import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultUserProfile, quests, raids, rewards } from "../data/mock";

type QuestStatus = "open" | "pending" | "approved" | "rejected";

type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

type StoredState = {
  joinedCommunityIds: string[];
  questStatuses: Record<string, QuestStatus>;
  confirmedRaidIds: string[];
  claimedRewardIds: string[];
  walletConnected: boolean;
  isSignedIn: boolean;
  notifications: AppNotification[];
};

type AppStateContextType = {
  joinedCommunityIds: string[];
  questStatuses: Record<string, QuestStatus>;
  confirmedRaidIds: string[];
  claimedRewardIds: string[];
  walletConnected: boolean;
  isSignedIn: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  currentXp: number;
  currentLevel: number;
  nextLevelXp: number;
  completedQuestCount: number;
  joinedCommunityCount: number;
  confirmedRaidCount: number;
  claimCount: number;
  signIn: () => void;
  signOut: () => void;
  joinCommunity: (communityId: string) => void;
  submitQuest: (questId: string) => void;
  approveQuestPrototype: (questId: string) => void;
  confirmRaid: (raidId: string) => void;
  claimReward: (rewardId: string) => { ok: boolean; reason?: string };
  connectWallet: () => void;
  markNotificationsRead: () => void;
};

const STORAGE_KEY = "crypto-raid-app-state-v2";

function createNotification(title: string, body: string): AppNotification {
  return {
    id: `${Date.now()}-${Math.random()}`,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

const defaultState: StoredState = {
  joinedCommunityIds: ["1"],
  questStatuses: Object.fromEntries(
    quests.map((q) => [q.id, q.status as QuestStatus])
  ),
  confirmedRaidIds: [],
  claimedRewardIds: [],
  walletConnected: false,
  isSignedIn: false,
  notifications: [
    createNotification("Welcome", "Start exploring communities and earning XP."),
  ],
};

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredState;
          setState({
            ...defaultState,
            ...parsed,
            questStatuses: {
              ...defaultState.questStatuses,
              ...(parsed.questStatuses || {}),
            },
            notifications: parsed.notifications?.length
              ? parsed.notifications
              : defaultState.notifications,
          });
        }
      } catch (error) {
        console.log("Failed to load app state", error);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
      console.log("Failed to save app state", error);
    });
  }, [state, loaded]);

  const currentXp = useMemo(() => {
    const baseXp = defaultUserProfile.xp;

    const approvedQuestXp = quests
      .filter((q) => state.questStatuses[q.id] === "approved" && q.status !== "approved")
      .reduce((sum, q) => sum + q.xp, 0);

    const confirmedRaidXp = raids
      .filter((r) => state.confirmedRaidIds.includes(r.id))
      .reduce((sum, r) => sum + r.reward, 0);

    const claimedRewardCost = rewards
      .filter((r) => state.claimedRewardIds.includes(r.id))
      .reduce((sum, r) => sum + r.cost, 0);

    return Math.max(0, baseXp + approvedQuestXp + confirmedRaidXp - claimedRewardCost);
  }, [state]);

  const currentLevel = useMemo(() => {
    if (currentXp >= 10000) return 10;
    if (currentXp >= 7500) return 9;
    if (currentXp >= 5000) return 8;
    if (currentXp >= 3500) return 7;
    if (currentXp >= 2000) return 6;
    if (currentXp >= 1000) return 5;
    if (currentXp >= 500) return 4;
    if (currentXp >= 250) return 3;
    if (currentXp >= 100) return 2;
    return 1;
  }, [currentXp]);

  const nextLevelXp = useMemo(() => {
    if (currentXp < 100) return 100;
    if (currentXp < 250) return 250;
    if (currentXp < 500) return 500;
    if (currentXp < 1000) return 1000;
    if (currentXp < 2000) return 2000;
    if (currentXp < 3500) return 3500;
    if (currentXp < 5000) return 5000;
    if (currentXp < 7500) return 7500;
    return 10000;
  }, [currentXp]);

  const unreadNotificationCount = useMemo(
    () => state.notifications.filter((item) => !item.read).length,
    [state.notifications]
  );

  const completedQuestCount = useMemo(
    () => Object.values(state.questStatuses).filter((status) => status === "approved").length,
    [state.questStatuses]
  );

  function addNotification(title: string, body: string) {
    setState((prev) => ({
      ...prev,
      notifications: [createNotification(title, body), ...prev.notifications],
    }));
  }

  function signIn() {
    setState((prev) => ({ ...prev, isSignedIn: true }));
    addNotification("Signed in", "Welcome back to the raid app.");
  }

  function signOut() {
    setState((prev) => ({ ...prev, isSignedIn: false }));
  }

  function joinCommunity(communityId: string) {
    setState((prev) => {
      const exists = prev.joinedCommunityIds.includes(communityId);
      const nextJoined = exists
        ? prev.joinedCommunityIds.filter((id) => id !== communityId)
        : [...prev.joinedCommunityIds, communityId];

      return {
        ...prev,
        joinedCommunityIds: nextJoined,
        notifications: [
          createNotification(
            exists ? "Community left" : "Community joined",
            exists
              ? "You left a community in the prototype."
              : "You joined a new community in the prototype."
          ),
          ...prev.notifications,
        ],
      };
    });
  }

  function submitQuest(questId: string) {
    setState((prev) => ({
      ...prev,
      questStatuses: {
        ...prev.questStatuses,
        [questId]: "pending",
      },
      notifications: [
        createNotification("Quest submitted", "Your quest is now pending review."),
        ...prev.notifications,
      ],
    }));
  }

  function approveQuestPrototype(questId: string) {
    setState((prev) => ({
      ...prev,
      questStatuses: {
        ...prev.questStatuses,
        [questId]: "approved",
      },
      notifications: [
        createNotification("Quest approved", "You earned XP from an approved quest."),
        ...prev.notifications,
      ],
    }));
  }

  function confirmRaid(raidId: string) {
    setState((prev) => {
      if (prev.confirmedRaidIds.includes(raidId)) return prev;
      return {
        ...prev,
        confirmedRaidIds: [...prev.confirmedRaidIds, raidId],
        notifications: [
          createNotification("Raid confirmed", "Your raid action was confirmed and XP was awarded."),
          ...prev.notifications,
        ],
      };
    });
  }

  function claimReward(rewardId: string) {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return { ok: false, reason: "Reward not found." };
    if (!reward.claimable) return { ok: false, reason: "This reward is locked." };
    if (state.claimedRewardIds.includes(rewardId)) {
      return { ok: false, reason: "Reward already claimed." };
    }
    if (currentXp < reward.cost) {
      return { ok: false, reason: "Not enough XP." };
    }

    setState((prev) => ({
      ...prev,
      claimedRewardIds: [...prev.claimedRewardIds, rewardId],
      notifications: [
        createNotification("Reward claimed", `${reward.title} was claimed successfully.`),
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  }

  function connectWallet() {
    setState((prev) => ({
      ...prev,
      walletConnected: true,
      notifications: [
        createNotification("Wallet connected", "Wallet placeholder connected successfully."),
        ...prev.notifications,
      ],
    }));
  }

  function markNotificationsRead() {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true })),
    }));
  }

  const value: AppStateContextType = {
    joinedCommunityIds: state.joinedCommunityIds,
    questStatuses: state.questStatuses,
    confirmedRaidIds: state.confirmedRaidIds,
    claimedRewardIds: state.claimedRewardIds,
    walletConnected: state.walletConnected,
    isSignedIn: state.isSignedIn,
    notifications: state.notifications,
    unreadNotificationCount,
    currentXp,
    currentLevel,
    nextLevelXp,
    completedQuestCount,
    joinedCommunityCount: state.joinedCommunityIds.length,
    confirmedRaidCount: state.confirmedRaidIds.length,
    claimCount: state.claimedRewardIds.length,
    signIn,
    signOut,
    joinCommunity,
    submitQuest,
    approveQuestPrototype,
    confirmRaid,
    claimReward,
    connectWallet,
    markNotificationsRead,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppStateContext must be used inside AppStateProvider");
  }
  return ctx;
}
