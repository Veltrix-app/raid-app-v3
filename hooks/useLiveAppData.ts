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
  const userProgress = useLiveAppStore((s) => s.userProgress);
  const notificationsFeed = useLiveAppStore((s) => s.notificationsFeed);
  const unreadNotificationCount = useLiveAppStore((s) => s.unreadNotificationCount);
  const loading = useLiveAppStore((s) => s.loading);
  const error = useLiveAppStore((s) => s.error);
  const loadAll = useLiveAppStore((s) => s.loadAll);
  const markNotificationsRead = useLiveAppStore((s) => s.markNotificationsRead);

  useEffect(() => {
    loadAll();
  }, [authUserId]);

  const canonicalJoinedCommunities =
    userProgress && userProgress.joinedCommunities.length > 0
      ? userProgress.joinedCommunities
      : joinedCommunityIds;
  const canonicalQuestStatuses = userProgress?.questStatuses ?? {};
  const canonicalConfirmedRaids = userProgress?.confirmedRaids ?? [];
  const canonicalClaimedRewards = userProgress?.claimedRewards ?? [];
  const canonicalUnlockedRewardIds = userProgress?.unlockedRewardIds ?? [];

  const derivedCampaignProgressMap = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    const campaignQuests = quests.filter((quest) => quest.campaignId === campaign.id);
    const campaignRaids = raids.filter((raid) => raid.campaignId === campaign.id);
    const totalItems = campaignQuests.length + campaignRaids.length;
    const approvedQuestCount = campaignQuests.filter(
      (quest) => canonicalQuestStatuses[quest.id] === "approved"
    ).length;
    const confirmedRaidCount = campaignRaids.filter((raid) =>
      canonicalConfirmedRaids.includes(raid.id)
    ).length;
    const completedItems = approvedQuestCount + confirmedRaidCount;

    acc[campaign.id] = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return acc;
  }, {});

  const derivedCompletedCampaignIds = Object.entries(derivedCampaignProgressMap)
    .filter(([, progress]) => progress === 100)
    .map(([campaignId]) => campaignId);

  const derivedUnlockedRewardIds = Array.from(
    new Set([
      ...canonicalUnlockedRewardIds,
      ...rewards
        .filter(
          (reward) => reward.campaignId && derivedCompletedCampaignIds.includes(reward.campaignId)
        )
        .map((reward) => reward.id),
    ])
  );

  const campaignDiscovery = buildCampaignDiscovery({
    communities,
    campaigns,
    quests,
    rewards,
    raids,
    projectReputation,
    joinedCommunityIds: canonicalJoinedCommunities,
    campaignProgressMap: derivedCampaignProgressMap,
    completedCampaignIds: derivedCompletedCampaignIds,
  });

  const communityDiscovery = buildCommunityDiscovery({
    communities,
    campaigns,
    quests,
    rewards,
    raids,
    projectReputation,
    joinedCommunityIds: canonicalJoinedCommunities,
    campaignProgressMap: derivedCampaignProgressMap,
    completedCampaignIds: derivedCompletedCampaignIds,
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
    userProgress,
    notificationsFeed,
    unreadNotificationCount,
    canonicalJoinedCommunities,
    canonicalQuestStatuses,
    canonicalConfirmedRaids,
    canonicalClaimedRewards,
    canonicalUnlockedRewardIds: derivedUnlockedRewardIds,
    campaignProgressMap: derivedCampaignProgressMap,
    completedCampaignIds: derivedCompletedCampaignIds,
    trendingCampaigns: campaignDiscovery.trendingCampaigns,
    recommendedCampaigns: campaignDiscovery.recommendedCampaigns,
    highRewardCampaigns: campaignDiscovery.highRewardCampaigns,
    rankedCampaigns: campaignDiscovery.rankedCampaigns,
    discoveredCommunities: communityDiscovery,
    loading,
    error,
    reloadAll: loadAll,
    markNotificationsRead,
    getCampaignProgress: (campaignId: string) => derivedCampaignProgressMap[campaignId] || 0,
    isCampaignCompleted: (campaignId: string) =>
      derivedCompletedCampaignIds.includes(campaignId),
  };
}
