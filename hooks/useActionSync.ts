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
      for (const rewardId of claimedRewards) {
        if (syncedRewardsRef.current.has(rewardId)) continue;

        const { error } = await supabase.from("reward_claims").insert({
          auth_user_id: authUserId,
          reward_id: rewardId,
        });

        if (!error) {
          syncedRewardsRef.current.add(rewardId);
        } else {
          console.error("Reward sync failed:", error.message);
        }
      }
    }

    syncRewards();
  }, [session, authUserId, claimedRewards]);

  useEffect(() => {
    if (!session || !authUserId) return;

    async function syncQuestSubmissions() {
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
            .eq("auth_user_id", authUserId),
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
      const hasWalletSignal = Boolean(profile?.wallet) || (walletLinkCount ?? 0) > 0;

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

        const { data: insertedSubmission, error } = await supabase
          .from("quest_submissions")
          .insert({
          auth_user_id: authUserId,
          quest_id: questId,
          status: decision.status,
          proof_text: questProofs[questId] ?? "",
          })
          .select("id")
          .single();

        if (!error) {
          syncedPendingQuestsRef.current.add(questId);

          if (decision.flagType && insertedSubmission?.id) {
            const { error: flagError } = await supabase.from("review_flags").insert({
              auth_user_id: authUserId,
              project_id: quest.project_id,
              source_table: "quest_submissions",
              source_id: insertedSubmission.id,
              flag_type: decision.flagType,
              severity: decision.severity ?? "medium",
              status: "open",
              reason: decision.reason,
              metadata: {
                questId,
                questTitle: quest.title,
                ...decision.metadata,
              },
            });

            if (flagError) {
              console.error("Review flag creation failed:", flagError.message);
            }
          }

          if (decision.status !== "pending") {
            setQuestReviewOutcome(questId, decision.status);
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
