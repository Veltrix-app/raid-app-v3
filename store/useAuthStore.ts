import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { createAppNotification } from "@/lib/app-notifications";
import { supabase } from "@/lib/supabase";
import { AppUserProfile } from "@/types/auth";

type AuthState = {
  initialized: boolean;
  loading: boolean;
  session: Session | null;
  authUserId: string | null;
  profile: AppUserProfile | null;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (
    updates: Partial<Omit<AppUserProfile, "id" | "authUserId">>
  ) => Promise<{ ok: boolean; error?: string }>;
  clearError: () => void;
};

function mapProfile(row: any): AppUserProfile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    username: row.username,
    avatarUrl: row.avatar_url ?? "",
    bannerUrl: row.banner_url ?? "",
    title: row.title ?? "Elite Raider",
    faction: row.faction ?? "Neon Wolves",
    bio: row.bio ?? "No bio set yet.",
    wallet: row.wallet ?? "",
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    streak: row.streak ?? 0,
    trustScore: row.user_global_reputation?.trust_score ?? 50,
    sybilScore: row.user_global_reputation?.sybil_score ?? 0,
    contributionTier: row.user_global_reputation?.contribution_tier ?? "explorer",
    reputationRank: row.user_global_reputation?.reputation_rank ?? 0,
    questsCompleted: row.user_global_reputation?.quests_completed ?? 0,
    raidsCompleted: row.user_global_reputation?.raids_completed ?? 0,
    rewardsClaimed: row.user_global_reputation?.rewards_claimed ?? 0,
    status: row.status ?? "active",
  };
}

async function fetchProfileWithReputation(authUserId: string) {
  const [{ data: profile, error: profileError }, { data: reputation, error: reputationError }] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single(),
      supabase
        .from("user_global_reputation")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle(),
    ]);

  if (profileError) {
    return { data: null, error: profileError };
  }

  if (reputationError) {
    return { data: null, error: reputationError };
  }

  return {
    data: {
      ...profile,
      user_global_reputation: reputation,
    },
    error: null,
  };
}

let authSubscriptionBound = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  loading: false,
  session: null,
  authUserId: null,
  profile: null,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      initialized: true,
      loading: false,
      session,
      authUserId: session?.user?.id ?? null,
    });

    if (session?.user?.id) {
      await get().loadProfile();
    }

    if (!authSubscriptionBound) {
      authSubscriptionBound = true;

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          session,
          authUserId: session?.user?.id ?? null,
        });

        if (session?.user?.id) {
          await get().loadProfile();
        } else {
          set({ profile: null });
        }
      });
    }
  },

  signUp: async (email, password, username) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { ok: false, error: error.message };
    }

    const authUserId = data.user?.id;

    if (!authUserId) {
      set({ loading: false, error: "No auth user returned." });
      return { ok: false, error: "No auth user returned." };
    }

    const { error: profileError } = await supabase.from("user_profiles").insert({
      auth_user_id: authUserId,
      username,
      avatar_url: "",
      banner_url: "",
      title: "Elite Raider",
      faction: "Neon Wolves",
      bio: "No bio set yet.",
      wallet: "",
      xp: 0,
      level: 1,
      streak: 0,
      status: "active",
    });

    const { error: reputationError } = await supabase
      .from("user_global_reputation")
      .upsert({
        auth_user_id: authUserId,
        total_xp: 0,
        level: 1,
        streak: 0,
        trust_score: 50,
        sybil_score: 0,
        contribution_tier: "explorer",
        reputation_rank: 0,
        quests_completed: 0,
        raids_completed: 0,
        rewards_claimed: 0,
        status: "active",
      });
    
    const { error: progressError } = await supabase.from("user_progress").insert({
      auth_user_id: authUserId,
      joined_communities: [],
      confirmed_raids: [],
      claimed_rewards: [],
      opened_lootbox_ids: [],
      unlocked_reward_ids: [],
      quest_statuses: {},
    });

    if (progressError) {
      set({ loading: false, error: progressError.message });
      return { ok: false, error: progressError.message };
    }

    if (profileError) {
      set({ loading: false, error: profileError.message });
      return { ok: false, error: profileError.message };
    }

    if (reputationError) {
      set({ loading: false, error: reputationError.message });
      return { ok: false, error: reputationError.message };
    }

    const { error: notificationError } = await createAppNotification({
      authUserId,
      title: "Welcome to Veltrix",
      body: "Your account is live. Join a community, complete quests and start building reputation.",
      type: "system",
      metadata: { stage: "signup" },
    });

    if (notificationError) {
      console.error("Signup notification creation failed:", notificationError.message);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      loading: false,
      session,
      authUserId,
    });

    await get().loadProfile();

    return { ok: true };
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { ok: false, error: error.message };
    }

    set({
      loading: false,
      session: data.session,
      authUserId: data.user?.id ?? null,
    });

    await get().loadProfile();

    return { ok: true };
  },
signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();

    set({
      loading: false,
      session: null,
      authUserId: null,
      profile: null,
      error: null,
    });
  },

  loadProfile: async () => {
    const authUserId = get().authUserId;
    if (!authUserId) return;

    const { data, error } = await fetchProfileWithReputation(authUserId);

    if (error) {
      set({ error: error.message, profile: null });
      return;
    }

    set({ profile: mapProfile(data) });
  },

  updateProfile: async (updates) => {
    const authUserId = get().authUserId;
    if (!authUserId) {
      return { ok: false, error: "Not signed in." };
    }

    const payload: Record<string, any> = {};

    if (typeof updates.username === "string") payload.username = updates.username;
    if (typeof updates.avatarUrl === "string") payload.avatar_url = updates.avatarUrl;
    if (typeof updates.bannerUrl === "string") payload.banner_url = updates.bannerUrl;
    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.faction === "string") payload.faction = updates.faction;
    if (typeof updates.bio === "string") payload.bio = updates.bio;
    if (typeof updates.wallet === "string") payload.wallet = updates.wallet;
    if (typeof updates.xp === "number") payload.xp = updates.xp;
    if (typeof updates.level === "number") payload.level = updates.level;
    if (typeof updates.streak === "number") payload.streak = updates.streak;
    if (typeof updates.status === "string") payload.status = updates.status;

    const { data, error } = await supabase
      .from("user_profiles")
      .update(payload)
      .eq("auth_user_id", authUserId)
      .select("*")
      .single();

    if (error) {
      set({ error: error.message });
      return { ok: false, error: error.message };
    }

    const { data: combinedData, error: combinedError } = await fetchProfileWithReputation(
      authUserId
    );

    if (combinedError) {
      set({ error: combinedError.message, profile: mapProfile(data) });
      return { ok: true };
    }

    set({ profile: mapProfile(combinedData) });
    return { ok: true };
  },
}));
