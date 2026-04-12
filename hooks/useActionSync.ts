import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

type VerificationQuestRow = {
  id: string;
  project_id: string | null;
  title: string;
  quest_type: string | null;
  proof_required: boolean | null;
  proof_type: string | null;
  auto_approve: boolean | null;
  verification_type: string | null;
};

type VerificationDecision = {
  status: "approved" | "pending" | "rejected";
  reason: string;
  flagType?: string;
  severity?: "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
};

type DuplicateSignal = {
  flagType: string;
  severity: "low" | "medium" | "high";
  reason: string;
  metadata: Record<string, unknown>;
};

type RewardVerificationRow = {
  id: string;
  project_id: string | null;
  campaign_id: string | null;
  title: string;
  reward_type: string | null;
  claim_method: string | null;
  cost: number;
};

function evaluateSubmission(params: {
  quest: VerificationQuestRow;
  proofText: string;
  walletConnected: boolean;
  hasWalletSignal: boolean;
  trustScore: number;
  sybilScore: number;
}) {
  const {
    quest,
    proofText,
    walletConnected,
    hasWalletSignal,
    trustScore,
    sybilScore,
  } = params;
  const trimmedProof = proofText.trim();
  const proofRequired = quest.proof_required ?? false;
  const proofType = quest.proof_type ?? "none";
  const verificationType = quest.verification_type ?? "manual_review";
  const questType = quest.quest_type ?? "custom";
  const autoApprove = quest.auto_approve ?? false;
  const walletRequired =
    proofType === "wallet" ||
    proofType === "tx_hash" ||
    verificationType === "onchain_check" ||
    ["wallet_connect", "token_hold", "nft_hold", "onchain_tx"].includes(questType);
  const hasWalletContext = walletConnected || hasWalletSignal;
  const elevatedRisk = sybilScore >= 70 || trustScore <= 35;

  if (proofRequired && proofType !== "none" && !trimmedProof) {
    return {
      status: "rejected",
      reason: "Proof required but not provided.",
      flagType: "missing_proof",
      severity: "medium",
      metadata: {
        proofType,
        verificationType,
      },
    } satisfies VerificationDecision;
  }

  if (walletRequired && !hasWalletContext && !trimmedProof) {
    return {
      status: "rejected",
      reason: "Wallet-based quest submitted without wallet context.",
      flagType: "missing_wallet_context",
      severity: "medium",
      metadata: {
        proofType,
        verificationType,
        questType,
      },
    } satisfies VerificationDecision;
  }

  if (elevatedRisk) {
    return {
      status: "pending",
      reason: "Submission routed to review because the user risk score is elevated.",
      flagType: "high_risk_submission",
      severity: sybilScore >= 85 ? "high" : "medium",
      metadata: {
        trustScore,
        sybilScore,
        verificationType,
        questType,
      },
    } satisfies VerificationDecision;
  }

  const autoVerifiable =
    autoApprove ||
    ((verificationType === "api_check" ||
      verificationType === "bot_check" ||
      verificationType === "event_check") &&
      !proofRequired) ||
    (verificationType === "onchain_check" && hasWalletContext);

  if (autoVerifiable) {
    return {
      status: "approved",
      reason: "Submission met low-risk auto-verification rules.",
      metadata: {
        verificationType,
        questType,
      },
    } satisfies VerificationDecision;
  }

  return {
    status: "pending",
    reason: "Submission requires manual or hybrid review.",
    metadata: {
      verificationType,
      questType,
    },
  } satisfies VerificationDecision;
}

async function detectDuplicateSignals(params: {
  authUserId: string;
  questId: string;
  projectId: string | null;
  proofText: string;
  walletAddress: string;
}) {
  const { authUserId, questId, projectId, proofText, walletAddress } = params;
  const duplicateSignals: DuplicateSignal[] = [];
  const trimmedProof = proofText.trim();

  const proofCheck = trimmedProof
    ? supabase
        .from("quest_submissions")
        .select("id, auth_user_id, quest_id, created_at")
        .eq("quest_id", questId)
        .eq("proof_text", trimmedProof)
        .neq("auth_user_id", authUserId)
        .limit(5)
    : Promise.resolve({ data: [], error: null });

  const walletCheck = walletAddress
    ? supabase
        .from("wallet_links")
        .select("auth_user_id, wallet_address")
        .eq("wallet_address", walletAddress)
        .neq("auth_user_id", authUserId)
        .limit(5)
    : Promise.resolve({ data: [], error: null });

  const [
    { data: duplicateProofRows, error: duplicateProofError },
    { data: duplicateWalletRows, error: duplicateWalletError },
  ] = await Promise.all([proofCheck, walletCheck]);

  if (duplicateProofError) {
    console.error("Duplicate proof check failed:", duplicateProofError.message);
  }

  if (duplicateWalletError) {
    console.error("Duplicate wallet check failed:", duplicateWalletError.message);
  }

  if ((duplicateProofRows ?? []).length > 0) {
    const proofRows = duplicateProofRows ?? [];
    duplicateSignals.push({
      flagType: "duplicate_proof",
      severity: "high",
      reason: "This proof text already appeared on another submission for the same quest.",
      metadata: {
        questId,
        projectId,
        duplicateCount: proofRows.length,
        proofPreview: trimmedProof.slice(0, 140),
      },
    });
  }

  if ((duplicateWalletRows ?? []).length > 0) {
    const walletRows = duplicateWalletRows ?? [];
    duplicateSignals.push({
      flagType: "duplicate_wallet",
      severity: "high",
      reason: "This wallet is already linked to another account.",
      metadata: {
        walletAddress,
        duplicateCount: walletRows.length,
      },
    });
  }

  return duplicateSignals;
}

export function useActionSync() {
  const { authUserId, session } = useAuth();
  const profile = useAuthStore((s) => s.profile);

  const confirmedRaids = useAppStore((s) => s.confirmedRaids);
  const claimedRewards = useAppStore((s) => s.claimedRewards);
  const questStatuses = useAppStore((s) => s.questStatuses);
  const questProofs = useAppStore((s) => s.questProofs);
  const walletConnected = useAppStore((s) => s.walletConnected);
  const setQuestReviewOutcome = useAppStore((s) => s.setQuestReviewOutcome);

  const syncedRaidsRef = useRef<Set<string>>(new Set());
  const syncedRewardsRef = useRef<Set<string>>(new Set());
  const syncedPendingQuestsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    syncedRaidsRef.current = new Set();
    syncedRewardsRef.current = new Set();
    syncedPendingQuestsRef.current = new Set();
  }, [authUserId]);

  useEffect(() => {
    if (!session || !authUserId) return;

    async function syncRaids() {
      for (const raidId of confirmedRaids) {
        if (syncedRaidsRef.current.has(raidId)) continue;

        const { error } = await supabase.from("raid_completions").insert({
          auth_user_id: authUserId,
          raid_id: raidId,
        });

        if (!error) {
          syncedRaidsRef.current.add(raidId);
        } else {
          console.error("Raid sync failed:", error.message);
        }
      }
    }

    syncRaids();
  }, [session, authUserId, confirmedRaids]);

  useEffect(() => {
    if (!session || !authUserId) return;

    async function syncRewards() {
      const currentAuthUserId = authUserId;
      if (!currentAuthUserId) return;

      const unsyncedRewardIds = claimedRewards.filter(
        (rewardId) => !syncedRewardsRef.current.has(rewardId)
      );
      if (!unsyncedRewardIds.length) return;

      const { data: rewardRows, error: rewardLookupError } = await supabase
        .from("rewards")
        .select("id, project_id, campaign_id, title, reward_type, claim_method, cost")
        .in("id", unsyncedRewardIds);

      if (rewardLookupError) {
        console.error("Reward verification load failed:", rewardLookupError.message);
        return;
      }

      const rewardsById = new Map(
        ((rewardRows ?? []) as RewardVerificationRow[]).map((row) => [row.id, row])
      );

      for (const rewardId of claimedRewards) {
        if (syncedRewardsRef.current.has(rewardId)) continue;

        const reward = rewardsById.get(rewardId);
        const { data: insertedClaim, error } = await supabase
          .from("reward_claims")
          .insert({
          auth_user_id: currentAuthUserId,
          reward_id: rewardId,
          })
          .select("id")
          .single();

        if (!error) {
          syncedRewardsRef.current.add(rewardId);

          const isHighValue = (reward?.cost ?? 0) >= 500;
          const needsManualFulfillment = reward?.claim_method === "manual_fulfillment";
          const flaggedUser = profile?.status === "flagged" || (profile?.sybilScore ?? 0) >= 70;

          const flagsToInsert = [
            ...(isHighValue && insertedClaim?.id
              ? [
                  {
                    auth_user_id: currentAuthUserId,
                    project_id: reward?.project_id ?? null,
                    source_table: "reward_claims",
                    source_id: insertedClaim.id,
                    flag_type: "high_value_claim",
                    severity: (reward?.cost ?? 0) >= 1000 ? "high" : "medium",
                    status: "open",
                    reason: "High-value reward claim routed to review before fulfillment.",
                    metadata: {
                      rewardId,
                      rewardTitle: reward?.title ?? "Unknown Reward",
                      rewardCost: reward?.cost ?? 0,
                      rewardType: reward?.reward_type ?? "custom",
                      campaignId: reward?.campaign_id ?? null,
                    },
                  },
                ]
              : []),
            ...(needsManualFulfillment && flaggedUser && insertedClaim?.id
              ? [
                  {
                    auth_user_id: currentAuthUserId,
                    project_id: reward?.project_id ?? null,
                    source_table: "reward_claims",
                    source_id: insertedClaim.id,
                    flag_type: "risky_manual_claim",
                    severity: "high",
                    status: "open",
                    reason: "Manual fulfillment claim came from a flagged or elevated-risk user.",
                    metadata: {
                      rewardId,
                      rewardTitle: reward?.title ?? "Unknown Reward",
                      claimMethod: reward?.claim_method ?? "manual_fulfillment",
                      sybilScore: profile?.sybilScore ?? 0,
                      trustScore: profile?.trustScore ?? 50,
                    },
                  },
                ]
              : []),
          ];

          if (flagsToInsert.length > 0) {
            const { error: flagError } = await supabase
              .from("review_flags")
              .insert(flagsToInsert);

            if (flagError) {
              console.error("Reward review flag creation failed:", flagError.message);
            }
          }
        } else {
          console.error("Reward sync failed:", error.message);
        }
      }
    }

    syncRewards();
  }, [session, authUserId, claimedRewards, profile]);

  useEffect(() => {
    if (!session || !authUserId) return;

    async function syncQuestSubmissions() {
      const currentAuthUserId = authUserId;
      if (!currentAuthUserId) return;
      const pendingQuestIds = Object.entries(questStatuses)
        .filter(([, status]) => status === "pending")
        .map(([questId]) => questId);

      if (!pendingQuestIds.length) return;

      const [{ data: questRows, error: questError }, { count: walletLinkCount, error: walletError }] =
        await Promise.all([
          supabase
            .from("quests")
            .select(
              "id, project_id, title, quest_type, proof_required, proof_type, auto_approve, verification_type"
            )
            .in("id", pendingQuestIds),
          supabase
            .from("wallet_links")
            .select("id", { count: "exact", head: true })
            .eq("auth_user_id", currentAuthUserId),
        ]);

      if (questError) {
        console.error("Quest verification load failed:", questError.message);
        return;
      }

      if (walletError) {
        console.error("Wallet verification load failed:", walletError.message);
      }

      const questsById = new Map(
        ((questRows ?? []) as VerificationQuestRow[]).map((row) => [row.id, row])
      );
      const walletAddress = profile?.wallet?.trim() ?? "";
      const hasWalletSignal = Boolean(walletAddress) || (walletLinkCount ?? 0) > 0;

      for (const questId of pendingQuestIds) {
        if (syncedPendingQuestsRef.current.has(questId)) continue;

        const quest = questsById.get(questId);
        if (!quest) continue;

        const decision = evaluateSubmission({
          quest,
          proofText: questProofs[questId] ?? "",
          walletConnected,
          hasWalletSignal,
          trustScore: profile?.trustScore ?? 50,
          sybilScore: profile?.sybilScore ?? 0,
        });
        const duplicateSignals = await detectDuplicateSignals({
          authUserId: currentAuthUserId,
          questId,
          projectId: quest.project_id ?? "",
          proofText: questProofs[questId] ?? "",
          walletAddress,
        });
        const duplicateReviewNeeded = duplicateSignals.length > 0;
        const finalDecision =
          duplicateReviewNeeded && decision.status === "approved"
            ? {
                ...decision,
                status: "pending" as const,
                reason:
                  "Submission routed to review because duplicate identity or proof signals were detected.",
              }
            : decision;

        const { data: insertedSubmission, error } = await supabase
          .from("quest_submissions")
          .insert({
          auth_user_id: currentAuthUserId,
          quest_id: questId,
          status: finalDecision.status,
          proof_text: questProofs[questId] ?? "",
          })
          .select("id")
          .single();

        if (!error) {
          syncedPendingQuestsRef.current.add(questId);

          if (insertedSubmission?.id) {
            const flagsToInsert = [
              ...(finalDecision.flagType
                ? [
                      {
                      auth_user_id: currentAuthUserId,
                      project_id: quest.project_id ?? null,
                      source_table: "quest_submissions",
                      source_id: insertedSubmission.id,
                      flag_type: finalDecision.flagType,
                      severity: finalDecision.severity ?? "medium",
                      status: "open",
                      reason: finalDecision.reason,
                      metadata: {
                        questId,
                        questTitle: quest.title,
                        ...finalDecision.metadata,
                      },
                    },
                  ]
                : []),
                ...duplicateSignals.map((signal) => ({
                auth_user_id: currentAuthUserId,
                project_id: quest.project_id ?? null,
                source_table: "quest_submissions",
                source_id: insertedSubmission.id,
                flag_type: signal.flagType,
                severity: signal.severity,
                status: "open",
                reason: signal.reason,
                metadata: {
                  questId,
                  questTitle: quest.title,
                  ...signal.metadata,
                },
              })),
            ];

            if (flagsToInsert.length > 0) {
              const { error: flagError } = await supabase
                .from("review_flags")
                .insert(flagsToInsert);

              if (flagError) {
                console.error("Review flag creation failed:", flagError.message);
              }
            }
          }

          if (finalDecision.status !== "pending") {
            setQuestReviewOutcome(questId, finalDecision.status);
          }
        } else {
          console.error("Quest submission sync failed:", error.message);
        }
      }
    }

    syncQuestSubmissions();
  }, [
    session,
    authUserId,
    profile,
    questStatuses,
    questProofs,
    walletConnected,
    setQuestReviewOutcome,
  ]);
}
