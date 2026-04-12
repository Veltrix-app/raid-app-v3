import { useAppStore } from "@/store/useAppStore";

export function useAppState() {
  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);
  const nextLevelXp = useAppStore((s) => s.nextLevelXp);

  const joinedCommunityIds = useAppStore((s) => s.joinedCommunities);
  const confirmedRaidIds = useAppStore((s) => s.confirmedRaids);
  const claimedRewardIds = useAppStore((s) => s.claimedRewards);
  const openedLootboxIds = useAppStore((s) => s.openedLootboxIds);
  const questStatuses = useAppStore((s) => s.questStatuses);
  const questProofs = useAppStore((s) => s.questProofs);

  const unreadNotificationCount = useAppStore((s) => s.unreadCount);
  const notificationsFeed = useAppStore((s) => s.notificationsFeed);

  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const walletConnected = useAppStore((s) => s.walletConnected);
  const profile = useAppStore((s) => s.profile);

  const campaignProgressMap = useAppStore((s) => s.campaignProgressMap);
  const completedCampaignIds = useAppStore((s) => s.completedCampaignIds);
  const unlockedRewardIds = useAppStore((s) => s.unlockedRewardIds);
  const unlockedBadgeIds = useAppStore((s) => s.unlockedBadgeIds);

  const streakCount = useAppStore((s) => s.streakCount);
  const lastActiveDate = useAppStore((s) => s.lastActiveDate);

  const joinCommunity = useAppStore((s) => s.joinCommunity);
  const confirmRaid = useAppStore((s) => s.confirmRaid);
  const claimReward = useAppStore((s) => s.claimReward);
  const openLootbox = useAppStore((s) => s.openLootbox);
  const submitQuest = useAppStore((s) => s.submitQuest);
  const approveQuestPrototype = useAppStore((s) => s.approveQuestPrototype);
  const connectWallet = useAppStore((s) => s.connectWallet);
  const signIn = useAppStore((s) => s.signIn);
  const signOut = useAppStore((s) => s.signOut);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const registerDailyActivity = useAppStore((s) => s.registerDailyActivity);
  const markNotificationsRead = useAppStore((s) => s.markNotificationsRead);
  const resetProgress = useAppStore((s) => s.resetProgress);

  return {
    currentXp: xp,
    currentLevel: level,
    nextLevelXp,

    joinedCommunityIds,
    confirmedRaidIds,
    claimedRewardIds,
    openedLootboxIds,
    questStatuses,
    questProofs,

    unreadNotificationCount,
    notificationsFeed,

    isSignedIn,
    walletConnected,
    profile,

    campaignProgressMap,
    completedCampaignIds,
    unlockedRewardIds,
    unlockedBadgeIds,

    streakCount,
    lastActiveDate,

    completedQuestCount: Object.values(questStatuses).filter(
      (status) => status === "approved"
    ).length,
    joinedCommunityCount: joinedCommunityIds.length,
    confirmedRaidCount: confirmedRaidIds.length,
    claimCount: claimedRewardIds.length,

    joinCommunity,
    confirmRaid,
    submitQuest,
    approveQuestPrototype,
    connectWallet,
    signIn,
    signOut,
    updateProfile,
    claimReward,
    openLootbox,
    registerDailyActivity,
    markNotificationsRead,
    resetProgress,

    getCampaignProgress: (campaignId: string) => campaignProgressMap[campaignId] || 0,
    isCampaignCompleted: (campaignId: string) =>
      completedCampaignIds.includes(campaignId),
    isRewardUnlocked: (rewardId: string) => unlockedRewardIds.includes(rewardId),
    isBadgeUnlocked: (badgeId: string) => unlockedBadgeIds.includes(badgeId),
  };
}
