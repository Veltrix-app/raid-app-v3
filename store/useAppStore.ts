import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  badgesCatalog,
  campaigns,
  defaultUserProfile,
  getCampaignRaids,
  getCampaignRewards,
  initialNotifications,
  lootboxes,
  quests,
  rewards,
} from "@/data/mock";
import { NotificationItem, UserProfile } from "@/types";

type QuestStatus = "open" | "pending" | "approved" | "rejected";

type EngineResult = {
  campaignProgressMap: Record<string, number>;
  completedCampaignIds: string[];
  unlockedRewardIds: string[];
};

type LootboxOpenResult = {
  ok: boolean;
  reason?: string;
  rewardId?: string;
};

type AppState = {
  xp: number;
  level: number;
  nextLevelXp: number;

  isSignedIn: boolean;
  walletConnected: boolean;

  joinedCommunities: string[];
  confirmedRaids: string[];
  claimedRewards: string[];
  openedLootboxIds: string[];
  questStatuses: Record<string, QuestStatus>;

  unreadCount: number;
  notificationsFeed: NotificationItem[];
  profile: UserProfile;

  campaignProgressMap: Record<string, number>;
  completedCampaignIds: string[];
  unlockedRewardIds: string[];
  unlockedBadgeIds: string[];

  streakCount: number;
  lastActiveDate: string | null;

  joinCommunity: (id: string) => void;
  confirmRaid: (id: string) => void;
  claimReward: (id: string) => { ok: boolean; reason?: string };
  openLootbox: (id: string) => LootboxOpenResult;

  submitQuest: (id: string) => void;
  approveQuestPrototype: (id: string) => void;

  connectWallet: () => void;
  signIn: () => void;
  signOut: () => void;
  addXP: (amount: number) => void;
  registerDailyActivity: () => void;

  updateProfile: (updates: Partial<UserProfile>) => void;
  markNotificationsRead: () => void;
  resetProgress: () => void;
};

function createNotification(
  title: string,
  body: string,
  type: NotificationItem["type"]
): NotificationItem {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function addNotification(
  current: NotificationItem[],
  title: string,
  body: string,
  type: NotificationItem["type"]
) {
  return [createNotification(title, body, type), ...current];
}

function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 100));
}

function calculateNextLevelXp(xp: number) {
  const level = calculateLevel(xp);
  return (level + 1) * 100;
}

function buildInitialQuestStatuses(): Record<string, QuestStatus> {
  return Object.fromEntries(
    quests.map((quest) => [quest.id, quest.status as QuestStatus])
  );
}

function evaluateCampaignEngine(
  questStatuses: Record<string, QuestStatus>,
  confirmedRaids: string[]
): EngineResult {
  const campaignProgressMap: Record<string, number> = {};
  const completedCampaignIds: string[] = [];
  const unlockedRewardIds: string[] = [];

  for (const campaign of campaigns) {
    const campaignQuests = quests.filter((quest) => quest.campaignId === campaign.id);
    const campaignRaids = getCampaignRaids(campaign.id);

    const totalItems = campaignQuests.length + campaignRaids.length;

    const approvedQuestCount = campaignQuests.filter(
      (quest) => questStatuses[quest.id] === "approved"
    ).length;

    const confirmedRaidCount = campaignRaids.filter((raid) =>
      confirmedRaids.includes(raid.id)
    ).length;

    const completedItems = approvedQuestCount + confirmedRaidCount;

    const progress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    campaignProgressMap[campaign.id] = progress;

    const completed = totalItems > 0 && completedItems === totalItems;

    if (completed) {
      completedCampaignIds.push(campaign.id);

      const campaignRewards = getCampaignRewards(campaign.id);
      campaignRewards.forEach((reward) => {
        unlockedRewardIds.push(reward.id);
      });
    }
  }

  return {
    campaignProgressMap,
    completedCampaignIds,
    unlockedRewardIds,
  };
}

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayDiff(a: string, b: string) {
  const d1 = dayStart(new Date(a));
  const d2 = dayStart(new Date(b));
  const diff = d2.getTime() - d1.getTime();
  return Math.round(diff / 86400000);
}

function evaluateBadges(params: {
  joinedCommunities: string[];
  confirmedRaids: string[];
  claimedRewards: string[];
  questStatuses: Record<string, QuestStatus>;
  completedCampaignIds: string[];
  xp: number;
  streakCount: number;
}): string[] {
  const badgeIds = new Set<string>();

  const approvedQuestCount = Object.values(params.questStatuses).filter(
    (status) => status === "approved"
  ).length;

  if (approvedQuestCount >= 1) badgeIds.add("first_quest");
  if (params.confirmedRaids.length >= 1) badgeIds.add("first_raid");
  if (params.claimedRewards.length >= 1) badgeIds.add("first_reward");
  if (params.completedCampaignIds.length >= 1) badgeIds.add("campaign_finisher");
  if (params.xp >= 500) badgeIds.add("xp_500");
  if (params.joinedCommunities.length >= 1) badgeIds.add("community_joiner");
  if (params.streakCount >= 3) badgeIds.add("streak_3");
  if (params.streakCount >= 7) badgeIds.add("streak_7");

  return badgesCatalog
    .map((badge) => badge.id)
    .filter((badgeId) => badgeIds.has(badgeId));
}

const initialQuestStatuses = buildInitialQuestStatuses();
const initialEngine = evaluateCampaignEngine(initialQuestStatuses, []);
const initialBadges = evaluateBadges({
  joinedCommunities: [],
  confirmedRaids: [],
  claimedRewards: [],
  questStatuses: initialQuestStatuses,
  completedCampaignIds: initialEngine.completedCampaignIds,
  xp: 120,
  streakCount: 1,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      xp: 120,
      level: 2,
      nextLevelXp: 300,

      isSignedIn: true,
      walletConnected: false,

      joinedCommunities: [],
      confirmedRaids: [],
      claimedRewards: [],
      openedLootboxIds: [],
      questStatuses: initialQuestStatuses,

      unreadCount: 1,
      notificationsFeed: initialNotifications,
      profile: defaultUserProfile,

      campaignProgressMap: initialEngine.campaignProgressMap,
      completedCampaignIds: initialEngine.completedCampaignIds,
      unlockedRewardIds: initialEngine.unlockedRewardIds,
      unlockedBadgeIds: initialBadges,

      streakCount: 1,
      lastActiveDate: new Date().toISOString(),

      registerDailyActivity: () =>
        set((state) => {
          const today = new Date().toISOString();

          if (!state.lastActiveDate) {
            return {
              lastActiveDate: today,
              streakCount: 1,
            };
          }

          const diff = getDayDiff(state.lastActiveDate, today);

          if (diff <= 0) {
            return state;
          }

          const nextStreak = diff === 1 ? state.streakCount + 1 : 1;
          const streakBonusXp = diff === 1 ? Math.min(nextStreak * 5, 50) : 0;
          const nextXp = state.xp + streakBonusXp;

          const nextBadges = evaluateBadges({
            joinedCommunities: state.joinedCommunities,
            confirmedRaids: state.confirmedRaids,
            claimedRewards: state.claimedRewards,
            questStatuses: state.questStatuses,
            completedCampaignIds: state.completedCampaignIds,
            xp: nextXp,
            streakCount: nextStreak,
          });

          const feed =
            streakBonusXp > 0
              ? addNotification(
                  state.notificationsFeed,
                  "Streak bonus received",
                  `You earned ${streakBonusXp} XP for keeping your streak alive.`,
                  "xp"
                )
              : state.notificationsFeed;

          return {
            lastActiveDate: today,
            streakCount: nextStreak,
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            unlockedBadgeIds: nextBadges,
            unreadCount: streakBonusXp > 0 ? state.unreadCount + 1 : state.unreadCount,
            notificationsFeed: feed,
          };
        }),

      joinCommunity: (id: string) =>
        set((state) => {
          const nextJoinedCommunities = state.joinedCommunities.includes(id)
            ? state.joinedCommunities.filter((item) => item !== id)
            : [...state.joinedCommunities, id];

          const nextBadges = evaluateBadges({
            joinedCommunities: nextJoinedCommunities,
            confirmedRaids: state.confirmedRaids,
            claimedRewards: state.claimedRewards,
            questStatuses: state.questStatuses,
            completedCampaignIds: state.completedCampaignIds,
            xp: state.xp,
            streakCount: state.streakCount,
          });

          return {
            joinedCommunities: nextJoinedCommunities,
            unlockedBadgeIds: nextBadges,
            unreadCount: state.unreadCount + 1,
            notificationsFeed: addNotification(
              state.notificationsFeed,
              "Community updated",
              nextJoinedCommunities.includes(id)
                ? "You joined a new community."
                : "You left a community.",
              "system"
            ),
          };
        }),

      confirmRaid: (id: string) =>
        set((state) => {
          if (state.confirmedRaids.includes(id)) {
            return state;
          }

          const nextConfirmedRaids = [...state.confirmedRaids, id];
          const engine = evaluateCampaignEngine(state.questStatuses, nextConfirmedRaids);

          const newlyCompletedCampaignIds = engine.completedCampaignIds.filter(
            (campaignId) => !state.completedCampaignIds.includes(campaignId)
          );

          const campaignBonusXp = newlyCompletedCampaignIds.reduce((sum, campaignId) => {
            const campaign = campaigns.find((item) => item.id === campaignId);
            return sum + (campaign?.xp || 0);
          }, 0);

          const nextXp = state.xp + 40 + campaignBonusXp;

          const nextBadges = evaluateBadges({
            joinedCommunities: state.joinedCommunities,
            confirmedRaids: nextConfirmedRaids,
            claimedRewards: state.claimedRewards,
            questStatuses: state.questStatuses,
            completedCampaignIds: engine.completedCampaignIds,
            xp: nextXp,
            streakCount: state.streakCount,
          });

          let feed = addNotification(
            state.notificationsFeed,
            "Raid confirmed",
            "You gained XP for completing a raid.",
            "raid"
          );

          let unreadCount = state.unreadCount + 1;

          if (newlyCompletedCampaignIds.length > 0) {
            newlyCompletedCampaignIds.forEach((campaignId) => {
              const campaign = campaigns.find((item) => item.id === campaignId);
              if (!campaign) return;
              feed = addNotification(
                feed,
                "Campaign completed",
                `${campaign.title} is complete. Rewards unlocked.`,
                "campaign"
              );
              unreadCount += 1;
            });
          }

          return {
            confirmedRaids: nextConfirmedRaids,
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            campaignProgressMap: engine.campaignProgressMap,
            completedCampaignIds: engine.completedCampaignIds,
            unlockedRewardIds: engine.unlockedRewardIds,
            unlockedBadgeIds: nextBadges,
            unreadCount,
            notificationsFeed: feed,
          };
        }),

      claimReward: (id: string) => {
        const state = get();
        const reward = rewards.find((item) => item.id === id);

        if (!reward) {
          return { ok: false, reason: "Reward not found." };
        }

        if (!state.unlockedRewardIds.includes(id)) {
          return { ok: false, reason: "Reward is not unlocked yet." };
        }

        if (state.claimedRewards.includes(id)) {
          return { ok: false, reason: "Reward already claimed." };
        }

        if (state.xp < reward.cost) {
          return { ok: false, reason: "Not enough XP." };
        }

        set((current) => {
          const nextXp = current.xp - reward.cost;
          const nextClaimedRewards = [...current.claimedRewards, id];

          const nextBadges = evaluateBadges({
            joinedCommunities: current.joinedCommunities,
            confirmedRaids: current.confirmedRaids,
            claimedRewards: nextClaimedRewards,
            questStatuses: current.questStatuses,
            completedCampaignIds: current.completedCampaignIds,
            xp: nextXp,
            streakCount: current.streakCount,
          });

          return {
            claimedRewards: nextClaimedRewards,
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            unlockedBadgeIds: nextBadges,
            unreadCount: current.unreadCount + 1,
            notificationsFeed: addNotification(
              current.notificationsFeed,
              "Reward claimed",
              `${reward.title} has been claimed successfully.`,
              "reward"
            ),
          };
        });

        return { ok: true };
      },

      openLootbox: (id: string) => {
        const state = get();
        const box = lootboxes.find((item) => item.id === id);

        if (!box) {
          return { ok: false, reason: "Lootbox not found." };
        }

        if (state.xp < box.cost) {
          return { ok: false, reason: "Not enough XP for this lootbox." };
        }

        const chosenRewardId =
          box.possibleRewardIds[
            Math.floor(Math.random() * box.possibleRewardIds.length)
          ];

        set((current) => {
          const nextXp = current.xp - box.cost;
          const rewardAlreadyUnlocked = current.unlockedRewardIds.includes(chosenRewardId);
          const nextUnlockedRewardIds = rewardAlreadyUnlocked
            ? current.unlockedRewardIds
            : [...current.unlockedRewardIds, chosenRewardId];

          return {
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            openedLootboxIds: [...current.openedLootboxIds, id],
            unlockedRewardIds: nextUnlockedRewardIds,
            unreadCount: current.unreadCount + 1,
            notificationsFeed: addNotification(
              current.notificationsFeed,
              "Lootbox opened",
              `You opened ${box.title} and revealed a new reward.`,
              "lootbox"
            ),
          };
        });

        return {
          ok: true,
          rewardId: chosenRewardId,
        };
      },

      submitQuest: (id: string) =>
        set((state) => ({
          questStatuses: {
            ...state.questStatuses,
            [id]: "pending",
          },
          unreadCount: state.unreadCount + 1,
          notificationsFeed: addNotification(
            state.notificationsFeed,
            "Quest submitted",
            "Your quest proof is pending review.",
            "quest"
          ),
        })),

      approveQuestPrototype: (id: string) =>
        set((state) => {
          if (state.questStatuses[id] === "approved") {
            return state;
          }

          const nextQuestStatuses = {
            ...state.questStatuses,
            [id]: "approved" as QuestStatus,
          };

          const engine = evaluateCampaignEngine(nextQuestStatuses, state.confirmedRaids);

          const newlyCompletedCampaignIds = engine.completedCampaignIds.filter(
            (campaignId) => !state.completedCampaignIds.includes(campaignId)
          );

          const quest = quests.find((item) => item.id === id);
          const questXp = quest?.xp || 0;

          const campaignBonusXp = newlyCompletedCampaignIds.reduce((sum, campaignId) => {
            const campaign = campaigns.find((item) => item.id === campaignId);
            return sum + (campaign?.xp || 0);
          }, 0);

          const nextXp = state.xp + questXp + campaignBonusXp;

          const nextBadges = evaluateBadges({
            joinedCommunities: state.joinedCommunities,
            confirmedRaids: state.confirmedRaids,
            claimedRewards: state.claimedRewards,
            questStatuses: nextQuestStatuses,
            completedCampaignIds: engine.completedCampaignIds,
            xp: nextXp,
            streakCount: state.streakCount,
          });

          let feed = addNotification(
            state.notificationsFeed,
            "Quest approved",
            `${quest?.title || "Quest"} approved. XP added.`,
            "quest"
          );
          let unreadCount = state.unreadCount + 1;

          if (newlyCompletedCampaignIds.length > 0) {
            newlyCompletedCampaignIds.forEach((campaignId) => {
              const campaign = campaigns.find((item) => item.id === campaignId);
              if (!campaign) return;
              feed = addNotification(
                feed,
                "Campaign completed",
                `${campaign.title} completed. Rewards unlocked.`,
                "campaign"
              );
              unreadCount += 1;
            });
          }

          return {
            questStatuses: nextQuestStatuses,
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            campaignProgressMap: engine.campaignProgressMap,
            completedCampaignIds: engine.completedCampaignIds,
            unlockedRewardIds: engine.unlockedRewardIds,
            unlockedBadgeIds: nextBadges,
            unreadCount,
            notificationsFeed: feed,
          };
        }),

      connectWallet: () =>
        set((state) => ({
          walletConnected: true,
          unreadCount: state.unreadCount + 1,
          notificationsFeed: addNotification(
            state.notificationsFeed,
            "Wallet connected",
            "Your wallet has been connected successfully.",
            "system"
          ),
        })),

      signIn: () =>
        set(() => ({
          isSignedIn: true,
        })),

      signOut: () =>
        set(() => ({
          isSignedIn: false,
        })),

      addXP: (amount: number) =>
        set((state) => {
          const nextXp = state.xp + amount;
          const nextBadges = evaluateBadges({
            joinedCommunities: state.joinedCommunities,
            confirmedRaids: state.confirmedRaids,
            claimedRewards: state.claimedRewards,
            questStatuses: state.questStatuses,
            completedCampaignIds: state.completedCampaignIds,
            xp: nextXp,
            streakCount: state.streakCount,
          });

          return {
            xp: nextXp,
            level: calculateLevel(nextXp),
            nextLevelXp: calculateNextLevelXp(nextXp),
            unlockedBadgeIds: nextBadges,
          };
        }),

      updateProfile: (updates: Partial<UserProfile>) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        })),

      markNotificationsRead: () =>
        set((state) => ({
          unreadCount: 0,
          notificationsFeed: state.notificationsFeed.map((item) => ({
            ...item,
            read: true,
          })),
        })),

      resetProgress: () => {
        const freshQuestStatuses = buildInitialQuestStatuses();
        const freshEngine = evaluateCampaignEngine(freshQuestStatuses, []);
        const freshBadges = evaluateBadges({
          joinedCommunities: [],
          confirmedRaids: [],
          claimedRewards: [],
          questStatuses: freshQuestStatuses,
          completedCampaignIds: freshEngine.completedCampaignIds,
          xp: 120,
          streakCount: 1,
        });

        set((state) => ({
          xp: 120,
          level: 2,
          nextLevelXp: 300,
          isSignedIn: state.isSignedIn,
          walletConnected: false,
          joinedCommunities: [],
          confirmedRaids: [],
          claimedRewards: [],
          openedLootboxIds: [],
          questStatuses: freshQuestStatuses,
          unreadCount: 1,
          notificationsFeed: initialNotifications,
          campaignProgressMap: freshEngine.campaignProgressMap,
          completedCampaignIds: freshEngine.completedCampaignIds,
          unlockedRewardIds: freshEngine.unlockedRewardIds,
          unlockedBadgeIds: freshBadges,
          streakCount: 1,
          lastActiveDate: new Date().toISOString(),
        }));
      },
    }),
    {
      name: "crypto-raid-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        nextLevelXp: state.nextLevelXp,
        isSignedIn: state.isSignedIn,
        walletConnected: state.walletConnected,
        joinedCommunities: state.joinedCommunities,
        confirmedRaids: state.confirmedRaids,
        claimedRewards: state.claimedRewards,
        openedLootboxIds: state.openedLootboxIds,
        questStatuses: state.questStatuses,
        unreadCount: state.unreadCount,
        notificationsFeed: state.notificationsFeed,
        profile: state.profile,
        campaignProgressMap: state.campaignProgressMap,
        completedCampaignIds: state.completedCampaignIds,
        unlockedRewardIds: state.unlockedRewardIds,
        unlockedBadgeIds: state.unlockedBadgeIds,
        streakCount: state.streakCount,
        lastActiveDate: state.lastActiveDate,
      }),
    }
  )
);