import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import ProgressBar from "@/components/ProgressBar";
import RaidCard from "@/components/RaidCard";
import RewardCard from "@/components/RewardCard";
import LeaderboardRow from "@/components/LeaderboardRow";
import PrimaryButton from "@/components/PrimaryButton";
import CampaignCompleteToast from "@/components/CampaignCompleteToast";

import {
  getCampaignById,
  getCampaignRaids,
  getCampaignRewards,
  getQuestsByCampaign,
  leaderboardBase,
} from "@/data/mock";
import { useAppState } from "@/hooks/useAppState";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import QuestCard from "@/components/QuestCard";

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentXp,
    profile,
    getCampaignProgress,
    isCampaignCompleted,
    streakCount,
  } = useAppState();

  const [showCompleted, setShowCompleted] = useState(false);
  const prevCompletedRef = useRef(false);

  const campaign = getCampaignById(id || "");

  if (!campaign) {
    return (
      <Screen>
        <Text style={styles.notFound}>Campaign not found.</Text>
      </Screen>
    );
  }

  const campaignQuests = getQuestsByCampaign(campaign.id);
  const campaignRaids = getCampaignRaids(campaign.id);
  const campaignRewards = getCampaignRewards(campaign.id);

  const liveProgress = getCampaignProgress(campaign.id);
  const completed = isCampaignCompleted(campaign.id);

  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      setShowCompleted(true);
    }
    prevCompletedRef.current = completed;
  }, [completed]);

  const leaderboard = useMemo(() => {
    return [
      ...leaderboardBase.slice(0, 3),
      {
        id: "me",
        username: profile?.username || "You",
        xp: currentXp,
        title: profile?.title || "Elite Raider",
        banner: profile?.banner,
        streakCount,
      },
    ]
      .sort((a, b) => b.xp - a.xp)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        isCurrentUser: item.id === "me",
      }));
  }, [currentXp, profile, streakCount]);

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
        <LinearGradient
          colors={["#0B0D12", "#18210F", "#13261D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />

          <Text style={styles.heroLabel}>Campaign</Text>
          <Text style={styles.heroTitle}>{campaign.title}</Text>
          <Text style={styles.heroDescription}>{campaign.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Bonus XP</Text>
              <Text style={styles.statValue}>+{campaign.xp}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>
                {completed ? "Completed" : campaign.deadline}
              </Text>
            </View>
          </View>

          <ProgressBar progress={liveProgress} />

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{liveProgress}% complete</Text>
            {completed ? <Text style={styles.completedText}>Reward Unlocked</Text> : null}
          </View>

          <PrimaryButton
            title={completed ? "Campaign Completed" : "Campaign Active"}
            onPress={() => {}}
            disabled
          />
        </LinearGradient>

        <SectionTitle
          title="Quests"
          subtitle="Complete tasks to progress this campaign"
        />
        {campaignQuests.map((quest) => (
          <QuestCard key={quest.id} item={quest} />
        ))}

        <SectionTitle
          title="Live Raids"
          subtitle="Join coordinated pushes tied to this campaign"
        />
        {campaignRaids.map((raid) => (
          <RaidCard key={raid.id} item={raid} />
        ))}

        <SectionTitle
          title="Campaign Rewards"
          subtitle="Rewards unlock automatically when the campaign is completed"
        />
        {campaignRewards.map((reward) => (
          <RewardCard key={reward.id} item={reward} />
        ))}

        <SectionTitle
          title="Top Raiders"
          subtitle="Current leaderboard inside this campaign"
        />
        {leaderboard.map((item) => (
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

        <Pressable
          style={styles.linkButton}
          onPress={() => router.push("/(tabs)/campaigns")}
        >
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