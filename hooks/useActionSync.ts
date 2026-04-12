import { useEffect, useRef } from "react";
import { createAppNotification } from "@/lib/app-notifications";
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
  verification_config: Record<string, unknown> | null;
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

type CampaignLookupRow = {
  id: string;
  title: string;
};

type ProjectLookupRow = {
  id: string;
  name: string;
};

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isHexWithLength(value: string, length: number) {
  return new RegExp(`^0x[a-fA-F0-9]{${length}}$`).test(value.trim());
}

function getRequiredConfigKeys(quest: VerificationQuestRow) {
  switch (quest.quest_type ?? "custom") {
    case "social_follow":
      return ["handle"];
    case "social_like":
    case "social_repost":
    case "social_comment":
      return ["postUrl"];
    case "telegram_join":
      return ["groupUrl"];
    case "discord_join":
      return ["inviteUrl"];
    case "token_hold":
      return ["contractAddress", "minimumBalance"];
    case "nft_hold":
      return ["contractAddress", "minimumOwned"];
    case "onchain_tx":
      return ["contractAddress", "method"];
    case "url_visit":
      return ["targetUrl"];
    case "referral":
      return ["minimumReferrals"];
    case "manual_proof":
      return ["instructions"];
    default:
      return [];
  }
}

function getMissingConfigKeys(quest: VerificationQuestRow) {
  const config = quest.verification_config ?? {};
  const requiredKeys = getRequiredConfigKeys(quest);

  return requiredKeys.filter((key) => {
    const value = config[key];

    if (typeof value === "number") {
      return Number.isNaN(value);
    }

    if (typeof value === "boolean") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !isNonEmptyString(value);
  });
}

function validateProofInput(params: {
  proofText: string;
  proofType: string;
  proofRequired: boolean;
  questType: string;
}) {
  const { proofText, proofType, proofRequired, questType } = params;
  const trimmedProof = proofText.trim();

  if (!proofRequired || proofType === "none") {
    return null;
  }

  if (!trimmedProof) {
    return {
      status: "rejected",
      reason: "Proof required but not provided.",
      flagType: "missing_proof",
      severity: "medium",
      metadata: { proofType, questType },
    } satisfies VerificationDecision;
  }

  if (proofType === "url" && !isValidUrl(trimmedProof)) {
    return {
      status: "rejected",
      reason: "Proof must be a valid URL.",
      flagType: "invalid_proof_format",
      severity: "medium",
      metadata: { proofType, questType, proofPreview: trimmedProof.slice(0, 120) },
    } satisfies VerificationDecision;
  }

  if (proofType === "tx_hash" && !isHexWithLength(trimmedProof, 64)) {
    return {
      status: "rejected",
      reason: "Proof must be a valid transaction hash.",
      flagType: "invalid_proof_format",
      severity: "medium",
      metadata: { proofType, questType, proofPreview: trimmedProof.slice(0, 80) },
    } satisfies VerificationDecision;
  }

  if (proofType === "wallet" && !isHexWithLength(trimmedProof, 40)) {
    return {
      status: "rejected",
      reason: "Proof must be a valid wallet address.",
      flagType: "invalid_proof_format",
      severity: "medium",
      metadata: { proofType, questType, proofPreview: trimmedProof.slice(0, 80) },
    } satisfies VerificationDecision;
  }

  if (proofType === "image" && trimmedProof.length < 8) {
    return {
      status: "rejected",
      reason: "Image proof looks incomplete.",
      flagType: "invalid_proof_format",
      severity: "low",
      metadata: { proofType, questType },
    } satisfies VerificationDecision;
  }

  return null;
}

function getVerificationRoute(decision: VerificationDecision) {
  const metadataRoute =
    typeof decision.metadata?.automationRoute === "string"
      ? decision.metadata.automationRoute
      : null;

  if (metadataRoute) {
    return metadataRoute;
  }

  if (decision.flagType === "high_risk_submission") {
    return "risk_review";
  }

  if (decision.flagType === "verification_config_incomplete") {
    return "config_review";
  }

  if (decision.flagType === "missing_proof" || decision.flagType === "invalid_proof_format") {
    return "validation_failed";
  }

  if (decision.status === "approved") {
    return "rule_auto_approved";
  }

  if (decision.status === "rejected") {
    return "validation_failed";
  }

  return "manual_review";
}

function getVerificationConfidence(params: {
  decision: VerificationDecision;
  duplicateSignals: DuplicateSignal[];
}) {
  const { decision, duplicateSignals } = params;

  if (duplicateSignals.length > 0) {
    return 28;
  }

  if (decision.flagType === "verification_config_incomplete") {
    return 35;
  }

  if (decision.flagType === "high_risk_submission") {
    return 42;
  }

  if (decision.status === "approved") {
    return 92;
  }

  if (decision.status === "rejected") {
    return 88;
  }

  return 55;
}

async function persistVerificationResult(params: {
  authUserId: string;
  submissionId: string;
  quest: VerificationQuestRow;
  decision: VerificationDecision;
  duplicateSignals: DuplicateSignal[];
  proofText: string;
}) {
  const { authUserId, submissionId, quest, decision, duplicateSignals, proofText } = params;
  const route = getVerificationRoute(decision);
  const requiredConfigKeys = toStringArray(decision.metadata?.requiredConfigKeys);
  const missingConfigKeys = toStringArray(decision.metadata?.missingConfigKeys);
  const duplicateSignalTypes = duplicateSignals.map((signal) => signal.flagType);
  const confidenceScore = getVerificationConfidence({ decision, duplicateSignals });

  const { error } = await supabase.from("verification_results").insert({
    auth_user_id: authUserId,
    project_id: quest.project_id ?? null,
    quest_id: quest.id,
    source_table: "quest_submissions",
    source_id: submissionId,
    verification_type: quest.verification_type ?? "manual_review",
    route,
    decision_status: decision.status,
    decision_reason: decision.reason,
    confidence_score: confidenceScore,
    required_config_keys: requiredConfigKeys,
    missing_config_keys: missingConfigKeys,
    duplicate_signal_types: duplicateSignalTypes,
    metadata: {
      questTitle: quest.title,
      questType: quest.quest_type ?? "custom",
      proofPreview: proofText.trim().slice(0, 140),
      proofType: quest.proof_type ?? "none",
      duplicateSignals: duplicateSignals.map((signal) => ({
        flagType: signal.flagType,
        severity: signal.severity,
        reason: signal.reason,
      })),
      decisionMetadata: decision.metadata ?? {},
    },
  });

  if (error) {
    console.error("Verification result persistence failed:", error.message);
  }
}

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
  const config = quest.verification_config ?? {};
  const requiredConfigKeys = getRequiredConfigKeys(quest);
  const missingConfigKeys = getMissingConfigKeys(quest);
  const walletRequired =
    proofType === "wallet" ||
    proofType === "tx_hash" ||
    verificationType === "onchain_check" ||
    ["wallet_connect", "token_hold", "nft_hold", "onchain_tx"].includes(questType);
  const hasWalletContext = walletConnected || hasWalletSignal;
  const elevatedRisk = sybilScore >= 70 || trustScore <= 35;

  const proofValidation = validateProofInput({
    proofText,
    proofType,
    proofRequired,
    questType,
  });

  if (proofValidation) {
    return proofValidation;
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

  if (missingConfigKeys.length > 0) {
    return {
      status: "pending",
      reason: "Quest verification rules are incomplete and need project-side configuration review.",
      flagType: "verification_config_incomplete",
      severity: "medium",
      metadata: {
        questType,
        verificationType,
        requiredConfigKeys,
        missingConfigKeys,
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
        requiredConfigKeys,
      },
    } satisfies VerificationDecision;
  }

  if (questType === "referral") {
    return {
      status: "pending",
      reason: "Referral quests stay in review until referral counts and abuse signals are verified.",
      flagType: "referral_validation_needed",
      severity: "medium",
      metadata: {
        verificationType,
        questType,
        minimumReferrals:
          typeof config.minimumReferrals === "number" ? config.minimumReferrals : null,
      },
    } satisfies VerificationDecision;
  }

  if (questType === "manual_proof") {
    return {
      status: "pending",
      reason: "Manual proof quests route to reviewer approval by design.",
      metadata: {
        verificationType,
        questType,
      },
    } satisfies VerificationDecision;
  }

  if (
    questType === "social_comment" &&
    proofType === "url" &&
    trimmedProof &&
    !/(x\.com|twitter\.com)/i.test(trimmedProof)
  ) {
    return {
      status: "rejected",
      reason: "Comment proof must link to an X or Twitter URL.",
      flagType: "invalid_proof_format",
      severity: "low",
      metadata: {
        verificationType,
        questType,
        proofPreview: trimmedProof.slice(0, 120),
      },
    } satisfies VerificationDecision;
  }

  const autoVerifiable =
    autoApprove ||
    ((verificationType === "api_check" ||
      verificationType === "bot_check" ||
      verificationType === "event_check") &&
      !proofRequired) ||
    (verificationType === "onchain_check" &&
      hasWalletContext &&
      missingConfigKeys.length === 0);

  if (autoVerifiable) {
    return {
      status: "approved",
      reason: "Submission met explicit low-risk verification rules.",
      metadata: {
        verificationType,
        questType,
        automationRoute: "rule_auto_approved",
        requiredConfigKeys,
      },
    } satisfies VerificationDecision;
  }

  return {
    status: "pending",
    reason: "Submission requires manual or hybrid review based on its verification rules.",
    metadata: {
      verificationType,
      questType,
      automationRoute: verificationType === "hybrid" ? "hybrid_review" : "manual_review",
      requiredConfigKeys,
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
      const campaignIds = Array.from(
        new Set(
          ((rewardRows ?? []) as RewardVerificationRow[])
            .map((row) => row.campaign_id)
            .filter((value): value is string => !!value)
        )
      );
      const projectIds = Array.from(
        new Set(
          ((rewardRows ?? []) as RewardVerificationRow[])
            .map((row) => row.project_id)
            .filter((value): value is string => !!value)
        )
      );

      const [{ data: campaignRows }, { data: projectRows }] = await Promise.all([
        campaignIds.length
          ? supabase.from("campaigns").select("id, title").in("id", campaignIds)
          : Promise.resolve({ data: [] as CampaignLookupRow[], error: null }),
        projectIds.length
          ? supabase.from("projects").select("id, name").in("id", projectIds)
          : Promise.resolve({ data: [] as ProjectLookupRow[], error: null }),
      ]);

      const campaignsById = new Map(
        ((campaignRows ?? []) as CampaignLookupRow[]).map((row) => [row.id, row])
      );
      const projectsById = new Map(
        ((projectRows ?? []) as ProjectLookupRow[]).map((row) => [row.id, row])
      );
      const profileUsername = profile?.username ?? "Raider";

      for (const rewardId of claimedRewards) {
        if (syncedRewardsRef.current.has(rewardId)) continue;

        const reward = rewardsById.get(rewardId);
        const campaignTitle =
          reward?.campaign_id ? campaignsById.get(reward.campaign_id)?.title ?? "" : "";
        const projectTitle =
          reward?.project_id ? projectsById.get(reward.project_id)?.name ?? "" : "";

        let insertResult = await supabase
          .from("reward_claims")
          .insert({
            auth_user_id: currentAuthUserId,
            username: profileUsername,
            reward_id: rewardId,
            reward_title: reward?.title ?? "",
            project_id: reward?.project_id ?? null,
            project_name: projectTitle,
            campaign_id: reward?.campaign_id ?? null,
            campaign_title: campaignTitle,
            claim_method: reward?.claim_method ?? "manual_fulfillment",
            status: "pending",
          })
          .select("id")
          .single();

        if (insertResult.error) {
          insertResult = await supabase
            .from("reward_claims")
            .insert({
              auth_user_id: currentAuthUserId,
              reward_id: rewardId,
            })
            .select("id")
            .single();
        }

        const { data: insertedClaim, error } = insertResult;

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

          const notificationBody =
            reward?.claim_method === "manual_fulfillment"
              ? `${reward?.title ?? "Reward"} is now in the fulfillment queue.`
              : `${reward?.title ?? "Reward"} has been submitted for automated claim handling.`;

          const { error: notificationError } = await createAppNotification({
            authUserId: currentAuthUserId,
            title: "Reward claim submitted",
            body: notificationBody,
            type: "reward",
            sourceTable: "reward_claims",
            sourceId: insertedClaim?.id,
            metadata: {
              rewardId,
              rewardTitle: reward?.title ?? "",
              claimMethod: reward?.claim_method ?? "manual_fulfillment",
              rewardCost: reward?.cost ?? 0,
            },
          });

          if (notificationError) {
            console.error("Reward notification creation failed:", notificationError.message);
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
              "id, project_id, title, quest_type, proof_required, proof_type, auto_approve, verification_type, verification_config"
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

            await persistVerificationResult({
              authUserId: currentAuthUserId,
              submissionId: insertedSubmission.id,
              quest,
              decision: finalDecision,
              duplicateSignals,
              proofText: questProofs[questId] ?? "",
            });

            const { error: notificationError } = await createAppNotification({
              authUserId: currentAuthUserId,
              title:
                finalDecision.status === "approved"
                  ? "Quest auto-approved"
                  : finalDecision.status === "rejected"
                    ? "Quest rejected"
                    : "Quest submitted",
              body:
                finalDecision.status === "approved"
                  ? `${quest.title} met the live verification rules and was approved automatically.`
                  : finalDecision.status === "rejected"
                    ? `${quest.title} was rejected because the proof or validation rules did not pass.`
                    : `${quest.title} was submitted and is now waiting for review.`,
              type: "quest",
              sourceTable: "quest_submissions",
              sourceId: insertedSubmission.id,
              metadata: {
                questId,
                questTitle: quest.title,
                decisionStatus: finalDecision.status,
                decisionReason: finalDecision.reason,
              },
            });

            if (notificationError) {
              console.error("Quest notification creation failed:", notificationError.message);
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
