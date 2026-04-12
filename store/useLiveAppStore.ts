import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

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
  rewardPool: string;
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
  title: string;
  description: string;
  xp: number;
  deadline?: string;
  progress: number;
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
  xp: number;
  status: "open" | "pending" | "approved" | "rejected";
  actionLabel?: string;
};

export type LiveBadge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  unlockType: string;
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

  loadLeaderboard: () => Promise<void>;
  loadRaids: () => Promise<void>;
  loadCommunities: () => Promise<void>;
  loadCampaigns: () => Promise<void>;
  loadRewards: () => Promise<void>;
  loadQuests: () => Promise<void>;
  loadBadges: () => Promise<void>;
  loadUserBadges: () => Promise<void>;
  loadProjectReputation: () => Promise<void>;
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
        rewardPool:
          typeof row.campaigns === "number"
            ? `${row.campaigns} campaigns`
            : "Live project",
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

      const campaigns: LiveCampaign[] = (data || []).map((row: any) => ({
        id: row.id,
        communityId: row.project_id ?? "",
        title: row.title ?? "Campaign",
        description:
          row.short_description ||
          row.long_description ||
          "Live campaign from backend.",
        xp: row.xp_budget ?? 0,
        deadline: row.status ?? "active",
        progress: row.completion_rate ?? 0,
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
        xp: row.xp ?? 0,
        status: row.status ?? "open",
        actionLabel: row.action_label ?? "Open Task",
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
