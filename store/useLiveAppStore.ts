import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  loadAppNotifications,
  markAllAppNotificationsRead,
} from "@/lib/app-notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationItem } from "@/types";

export type LeaderboardUser = {
  id: string;
  username: string;
  xp: number;
  level: number;
  avatar: string;
  banner: string;
  isCurrentUser: boolean;
};

export type LiveRaid = {
  id: string;
  campaignId?: string;
  title: string;
  community: string;
  timer: string;
  reward: number;
  participants: number;
  progress: number;
  target: string;
  banner: string;
  instructions: string[];
};

export type LiveCommunity = {
  id: string;
  name: string;
  members: number;
  description: string;
  longDescription?: string;
  rewardPool: string;
  logo?: string;
  bannerUrl?: string;
  chain?: string;
  category?: string;
  website?: string;
  joined?: boolean;
};

export type LiveProjectReputation = {
  projectId: string;
  xp: number;
  level: number;
  streak: number;
  trustScore: number;
  contributionTier: string;
  questsCompleted: number;
  raidsCompleted: number;
  rewardsClaimed: number;
  rank: number;
};

export type LiveCampaign = {
  id: string;
  communityId: string;
  communityName?: string;
  title: string;
  description: string;
  longDescription?: string;
  xp: number;
  deadline?: string;
  progress: number;
  visibility?: string;
  featured?: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type LiveReward = {
  id: string;
  campaignId?: string;
  title: string;
  description: string;
  cost: number;
  type: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  icon?: string;
  claimable?: boolean;
};

export type LiveQuest = {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: string;
  questType?: string;
  xp: number;
  status: "open" | "pending" | "approved" | "rejected";
  actionLabel?: string;
  actionUrl?: string;
  proofRequired?: boolean;
  proofType?: string;
  verificationType?: string;
  verificationProvider?: string;
  completionMode?: string;
};

export type LiveBadge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  unlockType: string;
};

export type LiveUserProgress = {
  joinedCommunities: string[];
  confirmedRaids: string[];
  claimedRewards: string[];
  openedLootboxIds: string[];
  unlockedRewardIds: string[];
  questStatuses: Record<string, "open" | "pending" | "approved" | "rejected">;
  updatedAt?: string;
};

type LiveAppState = {
  loading: boolean;
  error: string | null;

  leaderboard: LeaderboardUser[];
  raids: LiveRaid[];
  communities: LiveCommunity[];
  campaigns: LiveCampaign[];
  rewards: LiveReward[];
  quests: LiveQuest[];
  badges: LiveBadge[];
  unlockedBadgeIds: string[];
  projectReputation: LiveProjectReputation[];
  userProgress: LiveUserProgress | null;
  notificationsFeed: NotificationItem[];
  unreadNotificationCount: number;

  loadLeaderboard: () => Promise<void>;
  loadRaids: () => Promise<void>;
  loadCommunities: () => Promise<void>;
  loadCampaigns: () => Promise<void>;
  loadRewards: () => Promise<void>;
  loadQuests: () => Promise<void>;
  loadBadges: () => Promise<void>;
  loadUserBadges: () => Promise<void>;
  loadProjectReputation: () => Promise<void>;
  loadUserProgress: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  loadAll: () => Promise<void>;
  clearError: () => void;
};

export const useLiveAppStore = create<LiveAppState>((set) => ({
  loading: false,
  error: null,

  leaderboard: [],
  raids: [],
  communities: [],
  campaigns: [],
  rewards: [],
  quests: [],
  badges: [],
  unlockedBadgeIds: [],
  projectReputation: [],
  userProgress: null,
  notificationsFeed: [],
  unreadNotificationCount: 0,

  clearError: () => set({ error: null }),

  loadLeaderboard: async () => {
    try {
      const currentAuthUserId = useAuthStore.getState().authUserId;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("status", "active")
        .order("xp", { ascending: false })
        .order("level", { ascending: false });

      if (error) throw error;

      const leaderboard: LeaderboardUser[] = (data || []).map((row: any) => ({
        id: row.id,
        username: row.username ?? "Raider",
        xp: row.xp ?? 0,
        level: row.level ?? 1,
        avatar: row.avatar_url ?? "",
        banner: row.banner_url ?? "",
        isCurrentUser: row.auth_user_id === currentAuthUserId,
      }));

      set({ leaderboard });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load leaderboard." });
    }
  },

  loadRaids: async () => {
    try {
      const { data, error } = await supabase
        .from("raids")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const raids: LiveRaid[] = (data || []).map((row: any) => ({
        id: row.id,
        campaignId: row.campaign_id ?? undefined,
        title: row.title ?? "",
        community: row.community ?? "",
        timer: row.timer ?? "",
        reward: row.reward ?? 0,
        participants: row.participants ?? 0,
        progress: row.progress ?? 0,
        target: row.target ?? "",
        banner: row.banner ?? "",
        instructions: row.instructions ?? [],
      }));

      set({ raids });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load raids." });
    }
  },

  loadCommunities: async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const communities: LiveCommunity[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name ?? "Project",
        members: row.members ?? 0,
        description: row.description ?? "No description yet.",
        longDescription: row.long_description ?? "",
        rewardPool:
          typeof row.campaigns === "number"
            ? `${row.campaigns} campaigns`
            : "Live project",
        logo: row.logo ?? "",
        bannerUrl: row.banner_url ?? "",
        chain: row.chain ?? "",
        category: row.category ?? "",
        website: row.website ?? "",
      }));

      set({ communities });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load communities." });
    }
  },

  loadCampaigns: async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const communityNameMap = new Map(
        (useLiveAppStore.getState().communities || []).map((community) => [community.id, community.name])
      );

      const campaigns: LiveCampaign[] = (data || []).map((row: any) => ({
        id: row.id,
        communityId: row.project_id ?? "",
        communityName: communityNameMap.get(row.project_id ?? "") ?? "Community",
        title: row.title ?? "Campaign",
        description:
          row.short_description ||
          row.long_description ||
          "Live campaign from backend.",
        longDescription: row.long_description ?? "",
        xp: row.xp_budget ?? 0,
        deadline: row.ends_at ?? row.status ?? "active",
        progress: row.completion_rate ?? 0,
        visibility: row.visibility ?? "public",
        featured: row.featured ?? false,
        startsAt: row.starts_at ?? undefined,
        endsAt: row.ends_at ?? undefined,
      }));

      set({ campaigns });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load campaigns." });
    }
  },

  loadRewards: async () => {
    try {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rewards: LiveReward[] = (data || []).map((row: any) => ({
        id: row.id,
        campaignId: row.campaign_id ?? undefined,
        title: row.title ?? "Reward",
        description: row.description ?? "Live reward from backend.",
        cost: row.cost ?? 0,
        type: row.type ?? row.reward_type ?? "Reward",
        rarity: row.rarity ?? "common",
        icon: row.icon ?? row.image_url ?? "",
        claimable: row.claimable ?? false,
      }));

      set({ rewards });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load rewards." });
    }
  },

  loadQuests: async () => {
    try {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const quests: LiveQuest[] = (data || []).map((row: any) => ({
        id: row.id,
        campaignId: row.campaign_id ?? "",
        title: row.title ?? "Quest",
        description: row.description ?? "",
        type: row.type ?? row.quest_type ?? "Task",
        questType: row.quest_type ?? "custom",
        xp: row.xp ?? 0,
        status: row.status ?? "open",
        actionLabel: row.action_label ?? "Open Task",
        actionUrl: row.action_url ?? "",
        proofRequired: row.proof_required ?? false,
        proofType: row.proof_type ?? "none",
        verificationType: row.verification_type ?? "manual_review",
        verificationProvider: row.verification_provider ?? "custom",
        completionMode:
          row.completion_mode ??
          ((row.auto_approve ?? false) ? "rule_auto" : "manual"),
      }));

      set({ quests });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load quests." });
    }
  },

  loadBadges: async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("status", "active")
        .eq("visible", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const badges: LiveBadge[] = (data || []).map((row: any) => ({
        id: row.id,
        slug: row.slug ?? "",
        name: row.name ?? "Badge",
        description: row.description ?? "",
        icon: row.emoji || row.icon_url || "🏅",
        unlockType: row.unlock_type ?? "manual",
      }));

      set({ badges });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load badges." });
    }
  },

  loadUserBadges: async () => {
    try {
      const authUserId = useAuthStore.getState().authUserId;
      if (!authUserId) {
        set({ unlockedBadgeIds: [] });
        return;
      }

      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("auth_user_id", authUserId);

      if (error) throw error;

      set({
        unlockedBadgeIds: (data || []).map((row: any) => row.badge_id),
      });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load user badges." });
    }
  },

  loadProjectReputation: async () => {
    try {
      const authUserId = useAuthStore.getState().authUserId;
      if (!authUserId) {
        set({ projectReputation: [] });
        return;
      }

      const { data, error } = await supabase
        .from("user_project_reputation")
        .select("*")
        .eq("auth_user_id", authUserId)
        .order("xp", { ascending: false });

      if (error) throw error;

      const rows = (data || []) as any[];
      const rankMap = new Map<string, number>();

      await Promise.all(
        rows.map(async (row) => {
          const { count } = await supabase
            .from("user_project_reputation")
            .select("*", { count: "exact", head: true })
            .eq("project_id", row.project_id)
            .gt("xp", row.xp ?? 0);

          rankMap.set(row.project_id, (count ?? 0) + 1);
        })
      );

      const projectReputation: LiveProjectReputation[] = rows.map((row) => ({
        projectId: row.project_id,
        xp: row.xp ?? 0,
        level: row.level ?? 1,
        streak: row.streak ?? 0,
        trustScore: row.trust_score ?? 50,
        contributionTier: row.contribution_tier ?? "explorer",
        questsCompleted: row.quests_completed ?? 0,
        raidsCompleted: row.raids_completed ?? 0,
        rewardsClaimed: row.rewards_claimed ?? 0,
        rank: rankMap.get(row.project_id) ?? 0,
      }));

      set({ projectReputation });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load project reputation." });
    }
  },

  loadUserProgress: async () => {
    try {
      const authUserId = useAuthStore.getState().authUserId;
      if (!authUserId) {
        set({ userProgress: null });
        return;
      }

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error) throw error;

      set({
        userProgress: data
          ? {
              joinedCommunities: data.joined_communities ?? [],
              confirmedRaids: data.confirmed_raids ?? [],
              claimedRewards: data.claimed_rewards ?? [],
              openedLootboxIds: data.opened_lootbox_ids ?? [],
              unlockedRewardIds: data.unlocked_reward_ids ?? [],
              questStatuses: data.quest_statuses ?? {},
              updatedAt: data.updated_at ?? undefined,
            }
          : {
              joinedCommunities: [],
              confirmedRaids: [],
              claimedRewards: [],
              openedLootboxIds: [],
              unlockedRewardIds: [],
              questStatuses: {},
            },
      });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load user progress." });
    }
  },

  loadNotifications: async () => {
    try {
      const authUserId = useAuthStore.getState().authUserId;
      if (!authUserId) {
        set({ notificationsFeed: [], unreadNotificationCount: 0 });
        return;
      }

      const { data, error } = await loadAppNotifications(authUserId);

      if (error) throw error;

      set({
        notificationsFeed: data,
        unreadNotificationCount: data.filter((item) => !item.read).length,
      });
    } catch (err: any) {
      set({ error: err?.message || "Failed to load notifications." });
    }
  },

  markNotificationsRead: async () => {
    try {
      const authUserId = useAuthStore.getState().authUserId;
      if (!authUserId) return;

      const { error } = await markAllAppNotificationsRead(authUserId);

      if (error) throw error;

      set((state) => ({
        unreadNotificationCount: 0,
        notificationsFeed: state.notificationsFeed.map((item) => ({
          ...item,
          read: true,
        })),
      }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to mark notifications as read." });
    }
  },

  loadAll: async () => {
    set({ loading: true, error: null });

    try {
      await Promise.all([
        useLiveAppStore.getState().loadLeaderboard(),
        useLiveAppStore.getState().loadRaids(),
        useLiveAppStore.getState().loadCommunities(),
        useLiveAppStore.getState().loadCampaigns(),
        useLiveAppStore.getState().loadRewards(),
        useLiveAppStore.getState().loadQuests(),
        useLiveAppStore.getState().loadBadges(),
        useLiveAppStore.getState().loadUserBadges(),
        useLiveAppStore.getState().loadProjectReputation(),
        useLiveAppStore.getState().loadUserProgress(),
        useLiveAppStore.getState().loadNotifications(),
      ]);

      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Failed to load live app data.",
      });
    }
  },
}));
