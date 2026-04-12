import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import LeaderboardRow from "@/components/LeaderboardRow";
import LiveScreenState from "@/components/LiveScreenState";
import DiscoveryCampaignCard from "@/components/DiscoveryCampaignCard";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { joinedCommunityIds, joinCommunity } = useAppState();
  const {
    communities,
    campaigns,
    leaderboard,
    projectReputation,
    rankedCampaigns,
    loading,
    error,
  } = useLiveAppData();

  const community = communities.find((item) => item.id === (id || ""));
  const communityCampaigns = useMemo(
    () => campaigns.filter((item) => item.communityId === (id || "")),
    [campaigns, id]
  );

  if (!community) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Community not found.</Text>
      </Screen>
    );
  }

  const currentCommunity = community;
  const joined = joinedCommunityIds.includes(currentCommunity.id);
  const communityReputation = projectReputation.find((item) => item.projectId === currentCommunity.id);
  const communityLeaders = leaderboard.map((item, index) => ({
    ...item,
    rank: index + 1,
    title: `Level ${item.level}`,
  }));
  const nextBestCampaigns = rankedCampaigns
    .filter((item) => item.communityId === currentCommunity.id)
    .slice(0, 2);

  function handleJoin() {
    joinCommunity(currentCommunity.id);
    Alert.alert(joined ? "Community left" : "Community joined");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentCommunity.name,
          headerShown: true,
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.bg },
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <LinearGradient
          colors={["#0B0D12", "#10251A", "#13261D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroHeader}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>{currentCommunity.logo || currentCommunity.name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{currentCommunity.name}</Text>
              <Text style={styles.meta}>
                {(currentCommunity.chain || "Community")}
                {currentCommunity.category ? ` | ${currentCommunity.category}` : ""} |{" "}
                {currentCommunity.members.toLocaleString()} members
              </Text>
            </View>
          </View>

          <Text style={styles.desc}>{currentCommunity.description}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Reward pool</Text>
              <Text style={styles.statValue}>{currentCommunity.rewardPool}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{joined ? "Joined" : "Explore"}</Text>
            </View>
          </View>

          <PrimaryButton title={joined ? "Leave community" : "Join community"} onPress={handleJoin} />
        </LinearGradient>

        <View style={styles.storyCard}>
          <Text style={styles.storyEyebrow}>Community Story</Text>
          <Text style={styles.storyTitle}>What this project stands for</Text>
          <Text style={styles.storyText}>
            {currentCommunity.longDescription ||
              "This community uses Veltrix to run campaigns, highlight contributors and convert engagement into visible reputation."}
          </Text>

          <View style={styles.storyPills}>
            <StoryPill label={currentCommunity.chain || "Multi-chain"} />
            {currentCommunity.category ? <StoryPill label={currentCommunity.category} /> : null}
            <StoryPill label={joined ? "Joined" : "Not joined"} />
          </View>
        </View>

        <View style={styles.reputationCard}>
          <View style={styles.reputationHeader}>
            <View>
              <Text style={styles.reputationEyebrow}>Project Reputation</Text>
              <Text style={styles.reputationTitle}>
                {communityReputation ? communityReputation.contributionTier.toUpperCase() : "NOT STARTED"}
              </Text>
            </View>

            <View style={styles.rankPill}>
              <Text style={styles.rankLabel}>Community Rank</Text>
              <Text style={styles.rankValue}>
                {communityReputation?.rank ? `#${communityReputation.rank}` : "-"}
              </Text>
            </View>
          </View>

          <Text style={styles.reputationText}>
            {communityReputation
                ? `Inside ${currentCommunity.name}, your reputation is tracked separately from your global Veltrix score.`
                : `You have not built project-specific reputation inside ${currentCommunity.name} yet.`}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Project XP</Text>
              <Text style={styles.statValue}>
                {communityReputation?.xp?.toLocaleString() ?? "0"}
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Trust</Text>
              <Text style={styles.statValue}>{communityReputation?.trustScore ?? 50}</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Approved quests</Text>
              <Text style={styles.statValue}>{communityReputation?.questsCompleted ?? 0}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Confirmed raids</Text>
              <Text style={styles.statValue}>{communityReputation?.raidsCompleted ?? 0}</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Active campaigns" subtitle="Tap a campaign to open the mission details" />

        {communityCampaigns.map((campaign) => (
          <Pressable
            key={campaign.id}
            style={styles.campaignCard}
            onPress={() => router.push(`/campaign/${campaign.id}`)}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <Text style={styles.campaignMeta}>
                  {campaign.featured ? "Featured | " : ""}
                  {campaign.visibility || "public"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>+{campaign.xp} XP</Text>
              </View>
            </View>

            <Text style={styles.campaignDesc}>{campaign.description}</Text>
            <ProgressBar progress={campaign.progress} />
          </Pressable>
        ))}

        {nextBestCampaigns.length > 0 ? (
          <>
            <SectionTitle
              title="Best next move"
              subtitle="The strongest campaign paths inside this community right now"
            />
            {nextBestCampaigns.map((item) => (
              <DiscoveryCampaignCard
                key={item.id}
                item={item}
                badgeLabel={item.joinedCommunity ? "Momentum" : "Start here"}
              />
            ))}
          </>
        ) : null}

        <SectionTitle title="Community leaderboard" subtitle="Top contributors inside this community" />

        {communityLeaders.map((item) => (
          <LeaderboardRow
            key={item.id}
            rank={item.rank}
            username={item.username}
            xp={item.xp}
            isCurrentUser={item.isCurrentUser}
            title={item.title}
            banner={item.banner}
          />
        ))}
      </Screen>
    </>
  );
}

function StoryPill({ label }: { label: string }) {
  return (
    <View style={styles.storyPill}>
      <Text style={styles.storyPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    gap: SPACING.md,
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    right: -40,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(198,255,0,0.12)",
  },
  heroHeader: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
  },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  reputationCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  storyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 10,
  },
  storyEyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  storyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  storyText: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 20,
  },
  storyPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  storyPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storyPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  reputationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.md,
  },
  reputationEyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  reputationTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },
  reputationText: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 20,
  },
  rankPill: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: "flex-end",
  },
  rankLabel: {
    color: COLORS.subtext,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  rankValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 4,
  },
  desc: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  campaignCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  campaignTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  campaignMeta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
    textTransform: "capitalize",
  },
  campaignDesc: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "rgba(198,255,0,0.12)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.30)",
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
