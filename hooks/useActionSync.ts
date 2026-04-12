import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

export function useActionSync() {
  const { authUserId, session } = useAuth();

  const confirmedRaids = useAppStore((s) => s.confirmedRaids);
  const claimedRewards = useAppStore((s) => s.claimedRewards);
  const questStatuses = useAppStore((s) => s.questStatuses);
  const questProofs = useAppStore((s) => s.questProofs);

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

      for (const questId of pendingQuestIds) {
        if (syncedPendingQuestsRef.current.has(questId)) continue;

        const { error } = await supabase.from("quest_submissions").insert({
          auth_user_id: authUserId,
          quest_id: questId,
          status: "pending",
          proof_text: questProofs[questId] ?? "",
        });

        if (!error) {
          syncedPendingQuestsRef.current.add(questId);
        } else {
          console.error("Quest submission sync failed:", error.message);
        }
      }
    }

    syncQuestSubmissions();
  }, [session, authUserId, questStatuses, questProofs]);
}
