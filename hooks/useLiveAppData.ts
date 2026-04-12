import { useEffect } from "react";
import { useLiveAppStore } from "@/store/useLiveAppStore";
import { useAuth } from "@/hooks/useAuth";

export function useLiveAppData() {
  const { authUserId } = useAuth();

  const leaderboard = useLiveAppStore((s) => s.leaderboard);
  const raids = useLiveAppStore((s) => s.raids);
  const communities = useLiveAppStore((s) => s.communities);
  const campaigns = useLiveAppStore((s) => s.campaigns);
  const rewards = useLiveAppStore((s) => s.rewards);
  const quests = useLiveAppStore((s) => s.quests);
  const badges = useLiveAppStore((s) => s.badges);
  const unlockedBadgeIds = useLiveAppStore((s) => s.unlockedBadgeIds);
  const loading = useLiveAppStore((s) => s.loading);
  const error = useLiveAppStore((s) => s.error);
  const loadAll = useLiveAppStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [authUserId]);

  return {
    leaderboard,
    raids,
    communities,
    campaigns,
    rewards,
    quests,
    badges,
    unlockedBadgeIds,
    loading,
    error,
    reloadAll: loadAll,
  };
}