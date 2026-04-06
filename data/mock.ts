import {
  Badge,
  Campaign,
  Community,
  LeaderboardUser,
  Lootbox,
  NotificationItem,
  Quest,
  Raid,
  Reward,
  UserProfile,
} from "@/types";

export const defaultUserProfile: UserProfile = {
  username: "JordiAlpha",
  wallet: "0x7A3...19f2",
  level: 8,
  xp: 948,
  nextLevelXp: 1200,
  completedQuests: 23,
  raidsJoined: 14,
  claimedRewards: 2,
  title: "Elite Raider",
  bio: "Focused on high-engagement campaigns, meme pushes and fast leaderboard climbs.",
  faction: "Neon Wolves",
  avatar:
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80",
  banner:
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1400&q=80",
};

export const avatarPresets = [
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
];

export const bannerPresets = [
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1400&q=80",
];

export const factionOptions = [
  "Neon Wolves",
  "Chain Blades",
  "Alpha Syndicate",
  "Raid Legion",
  "Mint Hunters",
];

export const titleOptions = [
  "Elite Raider",
  "Alpha Hunter",
  "Raid Captain",
  "Growth Sniper",
  "Community Blade",
  "Mythic Shiller",
];

export const badgesCatalog: Badge[] = [
  {
    id: "first_quest",
    name: "First Quest",
    description: "Approved your first quest.",
    icon: "⚡",
  },
  {
    id: "first_raid",
    name: "First Raid",
    description: "Confirmed your first raid.",
    icon: "🚀",
  },
  {
    id: "first_reward",
    name: "First Reward",
    description: "Claimed your first reward.",
    icon: "🎁",
  },
  {
    id: "campaign_finisher",
    name: "Campaign Finisher",
    description: "Completed a full campaign.",
    icon: "🏁",
  },
  {
    id: "xp_500",
    name: "500 XP Club",
    description: "Reached 500 XP.",
    icon: "💠",
  },
  {
    id: "community_joiner",
    name: "Community Joiner",
    description: "Joined your first community.",
    icon: "🤝",
  },
  {
    id: "streak_3",
    name: "3 Day Streak",
    description: "Stayed active for 3 consecutive days.",
    icon: "🔥",
  },
  {
    id: "streak_7",
    name: "7 Day Streak",
    description: "Stayed active for 7 consecutive days.",
    icon: "🌋",
  },
];

export const communities: Community[] = [
  {
    id: "1",
    name: "Pepe Raiders",
    members: 18244,
    description: "Meme-first community focused on raids, viral reach and fast social engagement.",
    rewardPool: "$12,500",
    joined: true,
  },
  {
    id: "2",
    name: "Nova DeFi",
    members: 9340,
    description: "DeFi growth squad with launch campaigns, quests and token incentives.",
    rewardPool: "$8,000",
  },
  {
    id: "3",
    name: "ChainGuild",
    members: 27111,
    description: "Gaming and NFT community with high-energy raids and reward-based tasks.",
    rewardPool: "$19,300",
  },
];

export const campaigns: Campaign[] = [
  {
    id: "1",
    communityId: "1",
    title: "Weekly Meme Push",
    description: "Boost meme visibility across X and Telegram with quick community actions.",
    xp: 420,
    deadline: "Ends in 18h",
    progress: 56,
  },
  {
    id: "2",
    communityId: "2",
    title: "Launch Warmup",
    description: "Warm up the community before launch with social actions and invite tasks.",
    xp: 600,
    deadline: "Ends in 2d",
    progress: 21,
  },
];

export const quests: Quest[] = [
  {
    id: "q1",
    campaignId: "1",
    title: "Follow X account",
    description: "Follow the official X account so you can stay updated on campaign pushes.",
    type: "Social",
    xp: 30,
    status: "approved",
    actionLabel: "Open X",
  },
  {
    id: "q2",
    campaignId: "1",
    title: "Join Telegram",
    description: "Join the main Telegram group and stay active during community raids.",
    type: "Community",
    xp: 20,
    status: "approved",
    actionLabel: "Open Telegram",
  },
  {
    id: "q3",
    campaignId: "1",
    title: "Post meme screenshot",
    description: "Create a meme, post it, and upload proof so the team can review it.",
    type: "Proof",
    xp: 60,
    status: "pending",
    actionLabel: "Upload Proof",
  },
  {
    id: "q4",
    campaignId: "1",
    title: "Like + repost announcement",
    description: "Engage with the announcement post and help push reach in the first hour.",
    type: "Raid",
    xp: 40,
    status: "open",
    actionLabel: "Start Task",
  },
  {
    id: "q5",
    campaignId: "2",
    title: "Connect wallet",
    description: "Connect your wallet so the project can track reward eligibility later.",
    type: "On-chain",
    xp: 40,
    status: "open",
    actionLabel: "Connect Wallet",
  },
  {
    id: "q6",
    campaignId: "2",
    title: "Comment on launch thread",
    description: "Leave a meaningful comment under the launch thread and support visibility.",
    type: "Social",
    xp: 50,
    status: "open",
    actionLabel: "Open Thread",
  },
  {
    id: "q7",
    campaignId: "2",
    title: "Invite 2 friends",
    description: "Invite two real users into the community and help grow the launch audience.",
    type: "Referral",
    xp: 90,
    status: "open",
    actionLabel: "Invite Users",
  },
];

export const raids: Raid[] = [
  {
    id: "1",
    title: "Push the teaser post",
    community: "Pepe Raiders",
    timer: "18m left",
    reward: 50,
    participants: 382,
    progress: 78,
    target: "Like, repost and drop a funny comment.",
    banner:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
    instructions: [
      "Open the target post",
      "Like and repost it",
      "Leave a short comment",
      "Return to the app and confirm completion",
    ],
  },
  {
    id: "2",
    title: "Raid listing rumor thread",
    community: "ChainGuild",
    timer: "42m left",
    reward: 80,
    participants: 145,
    progress: 42,
    target: "Quote the post and mention your squad.",
    banner:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80",
    instructions: [
      "Open the rumor thread",
      "Quote the post",
      "Mention your squad or community name",
      "Return and confirm your action",
    ],
  },
];

export const rewards: Reward[] = [
  {
    id: "1",
    title: "Whitelist Spot",
    description: "Priority access to the next allowlist event.",
    cost: 500,
    type: "Access",
    icon: "https://cdn-icons-png.flaticon.com/512/845/845646.png",
    claimable: true,
    rarity: "rare",
  },
  {
    id: "2",
    title: "$25 USDC Reward",
    description: "Manual stablecoin payout for top contributors.",
    cost: 1500,
    type: "Token",
    icon: "https://cdn-icons-png.flaticon.com/512/6001/6001527.png",
    claimable: false,
    rarity: "legendary",
  },
  {
    id: "3",
    title: "OG Raider Badge",
    description: "Permanent profile badge for early top participants.",
    cost: 300,
    type: "Badge",
    icon: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    claimable: true,
    rarity: "epic",
  },
  {
    id: "4",
    title: "Private Alpha Role",
    description: "Special gated role with access to alpha channels.",
    cost: 900,
    type: "Role",
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    claimable: false,
    rarity: "common",
  },
];

export const lootboxes: Lootbox[] = [
  {
    id: "lb1",
    title: "Starter Crate",
    description: "A beginner reward crate with a chance at entry-level perks.",
    cost: 250,
    rarity: "common",
    possibleRewardIds: ["1", "3"],
  },
  {
    id: "lb2",
    title: "Alpha Vault",
    description: "Premium mystery box for raiders with enough XP to gamble for better loot.",
    cost: 900,
    rarity: "epic",
    possibleRewardIds: ["2", "3", "4"],
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Welcome Raider",
    body: "Your account is ready. Join campaigns and start stacking XP.",
    type: "system",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export const leaderboardBase: LeaderboardUser[] = [
  {
    id: "u1",
    username: "RaidKing",
    xp: 12440,
    title: "Mythic Shiller",
    banner:
      "https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "u2",
    username: "MoonMila",
    xp: 11120,
    title: "Alpha Hunter",
    banner:
      "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "u3",
    username: "NovaWolf",
    xp: 8410,
    title: "Raid Captain",
    banner:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "u4",
    username: "ShillMaster",
    xp: 7980,
    title: "Growth Sniper",
    banner:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "u5",
    username: "ChainSniper",
    xp: 7320,
    title: "Community Blade",
    banner:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getBadgeById(id: string) {
  return badgesCatalog.find((item) => item.id === id);
}

export function getCommunityById(id: string) {
  return communities.find((item) => item.id === id);
}

export function getCampaignById(id: string) {
  return campaigns.find((item) => item.id === id);
}

export function getQuestById(id: string) {
  return quests.find((item) => item.id === id);
}

export function getRaidById(id: string) {
  return raids.find((item) => item.id === id);
}

export function getRewardById(id: string) {
  return rewards.find((item) => item.id === id);
}

export function getLootboxById(id: string) {
  return lootboxes.find((item) => item.id === id);
}

export function getCampaignsByCommunity(communityId: string) {
  return campaigns.filter((item) => item.communityId === communityId);
}

export function getQuestsByCampaign(campaignId: string) {
  return quests.filter((item) => item.campaignId === campaignId);
}

export function getCampaignRaids(id: string) {
  if (id === "1") return raids.slice(0, 1);
  if (id === "2") return raids.slice(1);
  return [];
}

export function getCampaignRewards(id: string) {
  if (id === "1") return rewards.slice(0, 2);
  if (id === "2") return rewards.slice(2);
  return [];
}