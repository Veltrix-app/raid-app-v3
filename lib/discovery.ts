import {
  LiveCampaign,
  LiveCommunity,
  LiveProjectReputation,
  LiveQuest,
  LiveRaid,
  LiveReward,
} from "@/store/useLiveAppStore";

export type DiscoveryCampaign = {
  id: string;
  title: string;
  communityId: string;
  communityName: string;
  xp: number;
  progress: number;
  score: number;
  reason: string;
  questCount: number;
  rewardCount: number;
  joinedCommunity: boolean;
};

export type DiscoveryCommunity = {
  id: string;
  name: string;
  members: number;
  description: string;
  rewardPool: string;
  score: number;
  reason: string;
  joined: boolean;
  campaignCount: number;
};

type BuildDiscoveryParams = {
  communities: LiveCommunity[];
  campaigns: LiveCampaign[];
  quests: LiveQuest[];
  rewards: LiveReward[];
  raids: LiveRaid[];
  projectReputation: LiveProjectReputation[];
  joinedCommunityIds: string[];
  campaignProgressMap: Record<string, number>;
  completedCampaignIds: string[];
};

export function buildCampaignDiscovery(params: BuildDiscoveryParams) {
  const {
    communities,
    campaigns,
    quests,
    rewards,
    raids,
    projectReputation,
    joinedCommunityIds,
    campaignProgressMap,
    completedCampaignIds,
  } = params;

  const communityById = new Map(communities.map((community) => [community.id, community]));
  const reputationByProjectId = new Map(
    projectReputation.map((entry) => [entry.projectId, entry])
  );

  const rankedCampaigns = campaigns
    .map((campaign) => {
      const community = communityById.get(campaign.communityId);
      const reputation = reputationByProjectId.get(campaign.communityId);
      const joinedCommunity = joinedCommunityIds.includes(campaign.communityId);
      const isCompleted = completedCampaignIds.includes(campaign.id);
      const questCount = quests.filter((quest) => quest.campaignId === campaign.id).length;
      const rewardCount = rewards.filter((reward) => reward.campaignId === campaign.id).length;
      const raidMomentum = raids
        .filter((raid) => raid.campaignId === campaign.id)
        .reduce((sum, raid) => sum + raid.participants, 0);
      const liveProgress = campaignProgressMap[campaign.id] ?? campaign.progress ?? 0;
      const communityMembers = community?.members ?? 0;

      const score =
        (joinedCommunity ? 22 : 0) +
        Math.min(campaign.xp / 8, 24) +
        Math.min(communityMembers / 800, 18) +
        Math.min(liveProgress / 4, 18) +
        Math.min(raidMomentum / 40, 16) +
        (rewardCount > 0 ? 10 : 0) +
        (questCount > 1 ? 8 : 0) +
        (reputation ? Math.min(reputation.trustScore / 8, 10) : 0) -
        (isCompleted ? 40 : 0);

      let reason = "Strong live momentum and a healthy reward loop.";

      if (joinedCommunity && rewardCount > 0) {
        reason = "Already in this community and close to a meaningful reward path.";
      } else if (raidMomentum > 0) {
        reason = "Community momentum is active right now, which makes this a strong moment to jump in.";
      } else if (campaign.xp >= 500) {
        reason = "High XP upside makes this one of the strongest progression plays.";
      } else if (!joinedCommunity) {
        reason = "Good entry point into a live community with active campaign mechanics.";
      }

      return {
        id: campaign.id,
        title: campaign.title,
        communityId: campaign.communityId,
        communityName: community?.name ?? "Project",
        xp: campaign.xp,
        progress: liveProgress,
        score,
        reason,
        questCount,
        rewardCount,
        joinedCommunity,
      } satisfies DiscoveryCampaign;
    })
    .sort((a, b) => b.score - a.score);

  const trendingCampaigns = rankedCampaigns.slice(0, 4);
  const recommendedCampaigns = rankedCampaigns
    .filter((campaign) => campaign.joinedCommunity || campaign.rewardCount > 0)
    .slice(0, 4);
  const highRewardCampaigns = rankedCampaigns
    .filter((campaign) => campaign.xp >= 400)
    .slice(0, 4);

  return {
    rankedCampaigns,
    trendingCampaigns,
    recommendedCampaigns,
    highRewardCampaigns,
  };
}

export function buildCommunityDiscovery(params: BuildDiscoveryParams) {
  const { communities, campaigns, joinedCommunityIds, projectReputation, raids } = params;
  const reputationByProjectId = new Map(
    projectReputation.map((entry) => [entry.projectId, entry])
  );

  return communities
    .map((community) => {
      const joined = joinedCommunityIds.includes(community.id);
      const communityCampaigns = campaigns.filter(
        (campaign) => campaign.communityId === community.id
      );
      const communityRaids = raids.filter((raid) => raid.community === community.name);
      const reputation = reputationByProjectId.get(community.id);
      const score =
        (joined ? 30 : 0) +
        Math.min(community.members / 700, 20) +
        communityCampaigns.length * 8 +
        communityRaids.length * 6 +
        (reputation ? Math.min(reputation.xp / 150, 14) : 0);

      let reason = "Solid live community with campaigns ready to explore.";

      if (joined && reputation) {
        reason = "You already have momentum here, so this is a strong place to keep compounding reputation.";
      } else if (communityCampaigns.length >= 2) {
        reason = "Multiple live campaigns make this one of the richer places to start.";
      } else if (communityRaids.length > 0) {
        reason = "Active raid energy makes this community feel alive right now.";
      }

      return {
        id: community.id,
        name: community.name,
        members: community.members,
        description: community.description,
        rewardPool: community.rewardPool,
        score,
        reason,
        joined,
        campaignCount: communityCampaigns.length,
      } satisfies DiscoveryCommunity;
    })
    .sort((a, b) => b.score - a.score);
}
