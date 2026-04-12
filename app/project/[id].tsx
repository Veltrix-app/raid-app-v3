import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import LiveScreenState from "@/components/LiveScreenState";
import DiscoveryCampaignCard from "@/components/DiscoveryCampaignCard";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { joinedCommunityIds, joinCommunity } = useAppState();
  const {
    communities,
    campaigns,
    rewards,
    projectReputation,
    rankedCampaigns,
    getCampaignProgress,
    loading,
    error,
  } = useLiveAppData();

  const project = communities.find((item) => item.id === (id || ""));
  const projectCampaigns = useMemo(
    () => campaigns.filter((item) => item.communityId === (id || "")),
    [campaigns, id]
  );
  const highlightedRewards = useMemo(
    () =>
      rewards
        .filter((reward) =>
          projectCampaigns.some((campaign) => campaign.id === reward.campaignId)
        )
        .slice(0, 3),
    [projectCampaigns, rewards]
  );
  const recommendedCampaigns = useMemo(
    () =>
      rankedCampaigns
        .filter((campaign) => campaign.communityId === (id || ""))
        .slice(0, 3),
    [id, rankedCampaigns]
  );

  if (!project) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Project not found.</Text>
      </Screen>
    );
  }

  const currentProject = project;
  const joined = joinedCommunityIds.includes(currentProject.id);
  const reputation = projectReputation.find((item) => item.projectId === currentProject.id);

  function openWebsite() {
    if (currentProject.website) {
      void Linking.openURL(currentProject.website);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentProject.name,
          headerShown: true,
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.bg },
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <LinearGradient
          colors={["#0B0D12", "#112117", "#13261D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroHeader}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>{currentProject.logo || currentProject.name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{currentProject.name}</Text>
              <Text style={styles.meta}>
                {(currentProject.chain || "Project")}
                {currentProject.category ? ` | ${currentProject.category}` : ""} | {currentProject.members.toLocaleString()} members
              </Text>
            </View>
          </View>

          <Text style={styles.desc}>{currentProject.description}</Text>

          <View style={styles.storyPills}>
            {currentProject.chain ? <StoryPill label={currentProject.chain} /> : null}
            {currentProject.category ? <StoryPill label={currentProject.category} /> : null}
            <StoryPill label={joined ? "Joined" : "Public"} />
            {currentProject.website ? <StoryPill label="Website connected" /> : null}
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Live campaigns</Text>
              <Text style={styles.statValue}>{projectCampaigns.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Highlighted rewards</Text>
              <Text style={styles.statValue}>{highlightedRewards.length}</Text>
            </View>
          </View>

          <PrimaryButton
            title={joined ? "Joined to project" : "Join project"}
            onPress={() => joinCommunity(project.id)}
          />

          {currentProject.website ? (
            <Pressable style={styles.secondaryButton} onPress={openWebsite}>
              <Text style={styles.secondaryButtonText}>Open website</Text>
            </Pressable>
          ) : null}
        </LinearGradient>

        <View style={styles.storyCard}>
          <Text style={styles.storyEyebrow}>Public Profile</Text>
          <Text style={styles.storyTitle}>Brand story and positioning</Text>
          <Text style={styles.storyText}>
            {currentProject.longDescription ||
              "This project uses Veltrix to turn campaigns, community participation and rewards into a branded contributor journey."}
          </Text>
        </View>

        <View style={styles.reputationCard}>
          <View style={styles.reputationHeader}>
            <View>
              <Text style={styles.reputationEyebrow}>Your Project Standing</Text>
              <Text style={styles.reputationTitle}>
                {reputation ? reputation.contributionTier.toUpperCase() : "NOT STARTED"}
              </Text>
            </View>
            <View style={styles.rankPill}>
              <Text style={styles.rankLabel}>Rank</Text>
              <Text style={styles.rankValue}>{reputation?.rank ? `#${reputation.rank}` : "-"}</Text>
            </View>
          </View>

          <Text style={styles.reputationText}>
            {reputation
              ? `You already have signal inside ${currentProject.name}. Keep compounding with quests, raids and rewards.`
              : `You have not built project-specific reputation inside ${currentProject.name} yet.`}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Project XP</Text>
              <Text style={styles.statValue}>{reputation?.xp?.toLocaleString() ?? "0"}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Trust</Text>
              <Text style={styles.statValue}>{reputation?.trustScore ?? 50}</Text>
            </View>
          </View>
        </View>

        <SectionTitle
          title="Live campaigns"
          subtitle="Everything this project is currently pushing through Veltrix"
        />

        {projectCampaigns.map((campaign) => {
          const progress = getCampaignProgress(campaign.id);

          return (
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
              <ProgressBar progress={progress} />
              <Text style={styles.progressText}>{progress}% complete</Text>
            </Pressable>
          );
        })}

        {recommendedCampaigns.length > 0 ? (
          <>
            <SectionTitle
              title="Best campaign entries"
              subtitle="The strongest ways to start inside this project right now"
            />
            {recommendedCampaigns.map((item) => (
              <DiscoveryCampaignCard key={item.id} item={item} badgeLabel="Project pick" />
            ))}
          </>
        ) : null}

        {highlightedRewards.length > 0 ? (
          <>
            <SectionTitle
              title="Reward surface"
              subtitle="A preview of the rewards attached to this project's campaigns"
            />
            {highlightedRewards.map((reward) => (
              <Pressable
                key={reward.id}
                style={styles.rewardCard}
                onPress={() => router.push(`/reward/${reward.id}`)}
              >
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardMeta}>
                      {reward.type} | {reward.rarity || "common"}
                    </Text>
                  </View>
                  <Text style={styles.rewardCost}>{reward.cost} XP</Text>
                </View>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
              </Pressable>
            ))}
          </>
        ) : null}
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
    width: 56,
    height: 56,
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
  name: {
    color: COLORS.text,
    fontSize: 26,
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
    lineHeight: 21,
  },
  storyPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  storyPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glass,
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
  stats: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  statLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
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
  reputationCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
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
  progressText: {
    color: COLORS.subtext,
    fontSize: 12,
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
  rewardCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  rewardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  rewardMeta: {
    color: COLORS.subtext,
    fontSize: 12,
    textTransform: "capitalize",
  },
  rewardCost: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  rewardDescription: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
