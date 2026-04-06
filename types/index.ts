export type Community = {
  id: string;
  name: string;
  members: number;
  description: string;
  rewardPool: string;
  joined?: boolean;
};

export type QuestStatus = "open" | "pending" | "approved" | "rejected";

export type Quest = {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: string;
  xp: number;
  status: QuestStatus;
  actionLabel?: string;
};

export type Campaign = {
  id: string;
  communityId: string;
  title: string;
  description: string;
  xp: number;
  deadline?: string;
  progress: number;
};

export type Raid = {
  id: string;
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

export type RewardRarity = "common" | "rare" | "epic" | "legendary";

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: string;
  icon: string;
  claimable: boolean;
  rarity?: RewardRarity;
};

export type Lootbox = {
  id: string;
  title: string;
  description: string;
  cost: number;
  rarity: RewardRarity;
  possibleRewardIds: string[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type:
    | "xp"
    | "badge"
    | "reward"
    | "campaign"
    | "raid"
    | "quest"
    | "system"
    | "lootbox";
  createdAt: string;
  read?: boolean;
};

export type UserProfile = {
  username: string;
  wallet: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  completedQuests: number;
  raidsJoined: number;
  claimedRewards: number;
  title?: string;
  bio?: string;
  faction?: string;
  avatar?: string;
  banner?: string;
};

export type LeaderboardUser = {
  id: string;
  username: string;
  xp: number;
  title?: string;
  banner?: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};