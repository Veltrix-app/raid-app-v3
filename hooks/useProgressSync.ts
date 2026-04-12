import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

type ProgressRow = {
  auth_user_id: string;
  joined_communities: string[];
  confirmed_raids: string[];
  claimed_rewards: string[];
  opened_lootbox_ids: string[];
  unlocked_reward_ids: string[];
  quest_statuses: Record<string, "open" | "pending" | "approved" | "rejected">;
};

export function useProgressSync() {
  const { authUserId, profile, session } = useAuth();

  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);
  const streakCount = useAppStore((s) => s.streakCount);
  const joinedCommunities = useAppStore((s) => s.joinedCommunities);
  const confirmedRaids = useAppStore((s) => s.confirmedRaids);
  const claimedRewards = useAppStore((s) => s.claimedRewards);
  const openedLootboxIds = useAppStore((s) => s.openedLootboxIds);
  const unlockedRewardIds = useAppStore((s) => s.unlockedRewardIds);
  const questStatuses = useAppStore((s) => s.questStatuses);

  const hydrateRemoteProgress = useAppStore((s) => s.hydrateRemoteProgress);

  const hydratedRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    hydratedRef.current = false;
  }, [authUserId]);

  useEffect(() => {
    async function loadRemoteProgress() {
      if (!session || !authUserId || !profile) return;
      if (hydratedRef.current) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        const { error: insertError } = await supabase.from("user_progress").insert({
          auth_user_id: authUserId,
          joined_communities: [],
          confirmed_raids: [],
          claimed_rewards: [],
          opened_lootbox_ids: [],
          unlocked_reward_ids: [],
          quest_statuses: {},
        });

        if (insertError) {
          console.error("Failed to initialize user_progress:", insertError.message);
          return;
        }

        hydrateRemoteProgress({
          xp: profile.xp,
          level: profile.level,
          streakCount: profile.streak,
          joinedCommunities: [],
          confirmedRaids: [],
          claimedRewards: [],
          openedLootboxIds: [],
          unlockedRewardIds: [],
          questStatuses: {},
        });

        hydratedRef.current = true;
        return;
      }

      const row = data as ProgressRow;

      hydrateRemoteProgress({
        xp: profile.xp,
        level: profile.level,
        streakCount: profile.streak,
        joinedCommunities: row.joined_communities || [],
        confirmedRaids: row.confirmed_raids || [],
        claimedRewards: row.claimed_rewards || [],
        openedLootboxIds: row.opened_lootbox_ids || [],
        unlockedRewardIds: row.unlocked_reward_ids || [],
        questStatuses: row.quest_statuses || {},
      });

      hydratedRef.current = true;
    }

    loadRemoteProgress();
  }, [session, authUserId, profile, hydrateRemoteProgress]);

  useEffect(() => {
    if (!session || !authUserId || !profile) return;
    if (!hydratedRef.current) return;
    if (savingRef.current) return;

    const timeout = setTimeout(async () => {
      savingRef.current = true;

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          xp,
          level,
          streak: streakCount,
        })
        .eq("auth_user_id", authUserId);

      if (profileError) {
        console.error("Failed to sync user_profiles:", profileError.message);
      }

      const { error: progressError } = await supabase
        .from("user_progress")
        .upsert({
          auth_user_id: authUserId,
          joined_communities: joinedCommunities,
          confirmed_raids: confirmedRaids,
          claimed_rewards: claimedRewards,
          opened_lootbox_ids: openedLootboxIds,
          unlocked_reward_ids: unlockedRewardIds,
          quest_statuses: questStatuses,
          updated_at: new Date().toISOString(),
        });

      if (progressError) {
        console.error("Failed to sync user_progress:", progressError.message);
      }

      savingRef.current = false;
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    session,
    authUserId,
    profile,
    xp,
    level,
    streakCount,
    joinedCommunities,
    confirmedRaids,
    claimedRewards,
    openedLootboxIds,
    unlockedRewardIds,
    questStatuses,
  ]);
}