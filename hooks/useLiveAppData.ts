import { useEffect } from "react";
import { buildCampaignDiscovery, buildCommunityDiscovery } from "@/lib/discovery";
import { useLiveAppStore } from "@/store/useLiveAppStore";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/hooks/useAppState";

export function useLiveAppData() {
  const { authUserId } = useAuth();
  const { joinedCommunityIds, campaignProgressMap, completedCampaignIds } = useAppState();

  const leaderboard = useLiveAppStore((s) => s.leaderboard);
  const raids = useLiveAppStore((s) => s.raids);
  const communities = useLiveAppStore((s) => s.communities);
  const campaigns = useLiveAppStore((s) => s.campaigns);
  const rewards = useLiveAppStore((s) => s.rewards);
  const quests = useLiveAppStore((s) => s.quests);
  const badges = useLiveAppStore((s) => s.badges);
  const unlockedBadgeIds = useLiveAppStore((s) => s.unlockedBadgeIds);
  const projectReputation = useLiveAppStore((s) => s.projectReputation);
  const notificationsFeed = useLiveAppStore((s) => s.notificationsFeed);
  const unreadNotificationCount = useLiveAppStore((s) => s.unreadNotificationCount);
  const loading = useLiveAppStore((s) => s.loading);
  const error = useLiveAppStore((s) => s.error);
  const loadAll = useLiveAppStore((s) => s.loadAll);
  const markNotificationsRead = useLiveAppStore((s) => s.markNotificationsRead);

  useEffect(() => {
    loadAll();
  }, [authUserId]);

  const campaignDiscovery = buildCampaignDiscovery({
    communities,
    campaigns,
    quests,
    rewards,
    raids,
    projectReputation,
    joinedCommunityIds,
    campaignProgressMap,
    completedCampaignIds,
  });

  const communityDiscovery = buildCommunityDiscovery({
    communities,
    campaigns,
    quests,
    rewards,
    raids,
    projectReputation,
    joinedCommunityIds,
    campaignProgressMap,
    completedCampaignIds,
  });

  return {
    leaderboard,
    raids,
    communities,
    campaigns,
    rewards,
    quests,
    badges,
    unlockedBadgeIds,
    projectReputation,
    notificationsFeed,
    unreadNotificationCount,
    trendingCampaigns: campaignDiscovery.trendingCampaigns,
    recommendedCampaigns: campaignDiscovery.recommendedCampaigns,
    highRewardCampaigns: campaignDiscovery.highRewardCampaigns,
    rankedCampaigns: campaignDiscovery.rankedCampaigns,
    discoveredCommunities: communityDiscovery,
    loading,
    error,
    reloadAll: loadAll,
    markNotificationsRead,
  };
}
