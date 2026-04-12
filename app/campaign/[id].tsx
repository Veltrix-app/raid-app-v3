import React, { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import ProgressBar from "@/components/ProgressBar";
import RaidCard from "@/components/RaidCard";
import LeaderboardRow from "@/components/LeaderboardRow";
import PrimaryButton from "@/components/PrimaryButton";
import CampaignCompleteToast from "@/components/CampaignCompleteToast";
import QuestCard from "@/components/QuestCard";
import LiveScreenState from "@/components/LiveScreenState";
import DiscoveryCampaignCard from "@/components/DiscoveryCampaignCard";

import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { streakCount } = useAppState();
  const {
    campaigns,
    communities,
    quests,
    raids,
    rewards,
    leaderboard,
    rankedCampaigns,
    getCampaignProgress,
    isCampaignCompleted,
    loading,
    error,
  } = useLiveAppData();

  const [showCompleted, setShowCompleted] = useState(false);
  const prevCompletedRef = useRef(false);

  const campaign = campaigns.find((item) => item.id === (id || ""));
  const community = communities.find((item) => item.id === campaign?.communityId);

  const campaignQuests = useMemo(
    () => quests.filter((quest) => quest.campaignId === (id || "")),
    [quests, id]
  );

  const campaignRaids = useMemo(
    () => raids.filter((raid) => raid.campaignId === (id || "")),
    [raids, id]
  );

  const campaignRewards = useMemo(() => {
    const linked = rewards.filter((reward) => reward.campaignId === (id || ""));
    return linked.length > 0 ? linked : rewards.slice(0, 3);
  }, [rewards, id]);

  const relatedRecommendations = useMemo(
    () =>
      rankedCampaigns
        .filter(
          (item) =>
            item.id !== (id || "") &&
            (item.communityId === campaign?.communityId || item.joinedCommunity)
        )
        .slice(0, 3),
    [rankedCampaigns, id, campaign?.communityId]
  );

  const liveProgress = getCampaignProgress(id || "");
  const completed = isCampaignCompleted(id || "");

  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      setShowCompleted(true);
    }
    prevCompletedRef.current = completed;
  }, [completed]);

  const campaignLeaderboard = useMemo(
    () =>
      leaderboard.map((item, index) => ({
        ...item,
        rank: index + 1,
        title: `Level ${item.level}`,
      })),
    [leaderboard]
  );

  if (!campaign) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Campaign not found.</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: campaign.title,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <LinearGradient
          colors={["#0B0D12", "#18210F", "#13261D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />

          <Text style={styles.heroLabel}>
            {campaign.communityName || community?.name || "Campaign"}
          </Text>
          <Text style={styles.heroTitle}>{campaign.title}</Text>
          <Text style={styles.heroDescription}>{campaign.description}</Text>

          <View style={styles.heroPills}>
            <HeroPill label={campaign.featured ? "Featured" : "Live"} />
            <HeroPill label={campaign.visibility || "public"} />
            {community?.chain ? <HeroPill label={community.chain} /> : null}
            {community?.category ? <HeroPill label={community.category} /> : null}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Bonus XP</Text>
              <Text style={styles.statValue}>+{campaign.xp}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Timeline</Text>
              <Text style={styles.statValue}>{completed ? "Completed" : campaign.deadline}</Text>
            </View>
          </View>

          <ProgressBar progress={liveProgress} />

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{liveProgress}% complete</Text>
            {completed ? <Text style={styles.completedText}>Reward unlocked</Text> : null}
          </View>

          <PrimaryButton
            title={completed ? "Campaign Completed" : "Campaign Active"}
            onPress={() => {}}
            disabled
          />
        </LinearGradient>

        <View style={styles.storyCard}>
          <Text style={styles.storyEyebrow}>Campaign Story</Text>
          <Text style={styles.storyTitle}>Why this mission matters</Text>
          <Text style={styles.storyText}>
            {campaign.longDescription ||
              community?.longDescription ||
              "This campaign is part of the community's live engagement surface. Complete quests, join raids and unlock rewards to move your local reputation forward."}
          </Text>
        </View>

        <SectionTitle title="Quests" subtitle="Complete tasks to progress this campaign" />
        {campaignQuests.map((quest) => (
          <QuestCard key={quest.id} item={quest} />
        ))}

        <SectionTitle title="Live raids" subtitle="Join coordinated pushes tied to this campaign" />
        {campaignRaids.map((raid) => (
          <RaidCard key={raid.id} item={raid} />
        ))}

        <SectionTitle title="Campaign rewards" subtitle="Rewards linked to this campaign" />
        {campaignRewards.map((reward) => (
          <Pressable
            key={reward.id}
            style={styles.rewardCard}
            onPress={() => router.push("/(tabs)/rewards")}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardCost}>{reward.cost} XP</Text>
            </View>
            <Text style={styles.rewardMeta}>
              {reward.type} | {reward.rarity || "common"}
            </Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
          </Pressable>
        ))}

        {relatedRecommendations.length > 0 ? (
          <>
            <SectionTitle
              title="You may also like"
              subtitle="Strong next campaigns once you finish or pause this one"
            />
            {relatedRecommendations.map((item) => (
              <DiscoveryCampaignCard
                key={item.id}
                item={item}
                badgeLabel={item.joinedCommunity ? "Next up" : "Explore"}
              />
            ))}
          </>
        ) : null}

        <SectionTitle title="Top raiders" subtitle="Current leaderboard inside this campaign" />
        {campaignLeaderboard.map((item) => (
          <LeaderboardRow
            key={item.id}
            rank={item.rank}
            username={item.username}
            xp={item.xp}
            isCurrentUser={item.isCurrentUser}
            title={item.title}
            banner={item.banner}
            streakCount={item.isCurrentUser ? streakCount : undefined}
          />
        ))}

        <Pressable style={styles.linkButton} onPress={() => router.push("/(tabs)/campaigns")}>
          <Text style={styles.linkButtonText}>Back to campaigns</Text>
        </Pressable>

        {showCompleted && (
          <CampaignCompleteToast
            title={campaign.title}
            xp={campaign.xp}
            onDone={() => setShowCompleted(false)}
          />
        )}
      </Screen>
    </>
  );
}

function HeroPill({ label }: { label: string }) {
  return (
    <View style={styles.heroPill}>
      <Text style={styles.heroPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    shadowColor: "#C6FF00",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
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
  heroLabel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
  },
  heroDescription: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  heroPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.glass,
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
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  completedText: {
    color: COLORS.success,
    fontSize: 12,
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
    letterSpacing: 0.6,
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
  rewardCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  rewardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  rewardCost: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  rewardMeta: {
    color: COLORS.subtext,
    fontSize: 12,
    textTransform: "capitalize",
  },
  rewardDescription: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  linkButton: {
    marginTop: SPACING.sm,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
  },
  linkButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
