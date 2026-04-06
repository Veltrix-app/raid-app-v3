export type ProjectRow = {
  id: string;
  name: string;
  chain: string;
  status: "draft" | "active" | "paused";
  members: number;
  campaigns: number;
  logo: string;
  website: string;
  contact_email: string;
  description: string;
  onboarding_status: "draft" | "pending" | "approved";
};

export type CampaignRow = {
  id: string;
  title: string;
  project_id: string;
  status: "draft" | "active" | "completed";
  participants: number;
  completion_rate: number;
  xp_budget: number;
  created_at: string;
};

export type RaidRow = {
  id: string;
  title: string;
  campaign_id: string;
  status: "live" | "scheduled" | "ended";
  participants: number;
  reward_xp: number;
  created_at: string;
};

export type RewardRow = {
  id: string;
  title: string;
  type: "access" | "token" | "badge" | "role";
  rarity: "common" | "rare" | "epic" | "legendary";
  cost: number;
  stock: number;
  created_at: string;
};

export type UserProfileRow = {
  id: string;
  auth_user_id: string | null;
  username: string;
  avatar_url: string;
  banner_url: string;
  xp: number;
  level: number;
  streak: number;
  status: "active" | "flagged";
  created_at: string;
};