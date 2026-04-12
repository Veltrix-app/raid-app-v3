import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import RaidCard from "@/components/RaidCard";
import CommunityCard from "@/components/CommunityCard";
import SearchInput from "@/components/SearchInput";
import GlowCard from "@/components/GlowCard";
import LevelUpBurst from "@/components/LevelUpBurst";
import BadgeUnlockToast from "@/components/BadgeUnlockToast";
import LiveScreenState from "@/components/LiveScreenState";
import DiscoveryCampaignCard from "@/components/DiscoveryCampaignCard";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function HomeScreen() {
  const { currentLevel, currentXp, streakCount, registerDailyActivity } = useAppState();

  const {
    raids,
    rewards,
    badges,
    unlockedBadgeIds,
    trendingCampaigns,
    recommendedCampaigns,
    discoveredCommunities,
    notificationsFeed,
    unreadNotificationCount,
    canonicalClaimedRewards,
    canonicalUnlockedRewardIds,
    canonicalJoinedCommunities,
    completedCampaignIds,
    canonicalQuestStatuses,
    projectReputation,
    loading,
    error,
  } = useLiveAppData();

  const [query, setQuery] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);

  const prevLevelRef = useRef(currentLevel);
  const prevBadgesRef = useRef(unlockedBadgeIds);

  useEffect(() => {
    registerDailyActivity();
  }, [registerDailyActivity]);

  useEffect(() => {
    if (currentLevel > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    const prev = prevBadgesRef.current;
    const added = unlockedBadgeIds.find((id) => !prev.includes(id));
    if (added) {
      setNewBadgeId(added);
    }
    prevBadgesRef.current = unlockedBadgeIds;
  }, [unlockedBadgeIds]);

  const filteredCommunities = useMemo(() => {
    if (!query.trim()) return discoveredCommunities;

    return discoveredCommunities.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [discoveredCommunities, query]);

  const claimableRewards = useMemo(
    () =>
      rewards.filter(
        (reward) =>
          canonicalUnlockedRewardIds.includes(reward.id) &&
          !canonicalClaimedRewards.includes(reward.id) &&
          reward.claimable !== false
      ),
    [canonicalClaimedRewards, canonicalUnlockedRewardIds, rewards]
  );

  const lockedRewards = useMemo(
    () =>
      rewards.filter(
        (reward) =>
          !canonicalUnlockedRewardIds.includes(reward.id) &&
          !canonicalClaimedRewards.includes(reward.id)
      ),
    [canonicalClaimedRewards, canonicalUnlockedRewardIds, rewards]
  );

  const pendingQuestCount = useMemo(
    () => Object.values(canonicalQuestStatuses).filter((status) => status === "pending").length,
    [canonicalQuestStatuses]
  );

  const approvedQuestCount = useMemo(
    () => Object.values(canonicalQuestStatuses).filter((status) => status === "approved").length,
    [canonicalQuestStatuses]
  );

  const recentActivity = useMemo(() => notificationsFeed.slice(0, 3), [notificationsFeed]);

  const mostAdvancedProject = useMemo(() => {
    const rankedProjects = [...projectReputation].sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.xp - a.xp;
    });

    return rankedProjects[0] || null;
  }, [projectReputation]);

  const nextReward = useMemo(() => {
    if (claimableRewards.length > 0) {
      return claimableRewards[0];
    }

    const sortedLocked = [...lockedRewards].sort((a, b) => a.cost - b.cost);
    return sortedLocked[0] || null;
  }, [claimableRewards, lockedRewards]);

  const missionOfTheDay = useMemo(() => {
    if (claimableRewards.length > 0) {
      return {
        eyebrow: "Ready to cash in",
        title: "Claim your unlocked rewards",
        body: `${claimableRewards.length} reward${claimableRewards.length === 1 ? "" : "s"} are ready to move from earned to claimed.`,
        cta: "Open rewards",
        accent: "Rewards ready",
        onPress: () => router.push("/(tabs)/rewards"),
      };
    }

    if (pendingQuestCount > 0) {
      return {
        eyebrow: "Review pressure",
        title: "Track your pending approvals",
        body: `${pendingQuestCount} submission${pendingQuestCount === 1 ? "" : "s"} are still in review. Stay close so you can act fast when they clear.`,
        cta: "Open activity",
        accent: "Pending reviews",
        onPress: () => router.push("/notifications"),
      };
    }

    if (recommendedCampaigns.length > 0) {
      const campaign = recommendedCampaigns[0];
      return {
        eyebrow: "Mission of the day",
        title: campaign.title,
        body: `${campaign.reason} Push this next to keep your progression compounding.`,
        cta: "Open campaign",
        accent: `${campaign.questCount} quests`,
        onPress: () => router.push(`/campaign/${campaign.id}`),
      };
    }

    return {
      eyebrow: "Expand your surface",
      title: "Join another project",
      body: "The fastest way to unlock more quests, rewards and reputation ladders is to widen the number of active ecosystems around you.",
      cta: "Explore projects",
      accent: "New ecosystems",
      onPress: () => router.push("/(tabs)/projects"),
    };
  }, [claimableRewards, pendingQuestCount, recommendedCampaigns]);

  const momentumCards = useMemo(
    () => [
      {
        label: "Approved quests",
        value: String(approvedQuestCount),
        helper: approvedQuestCount > 0 ? "Signal already compounding" : "Start your first quest chain",
      },
      {
        label: "Completed campaigns",
        value: String(completedCampaignIds.length),
        helper:
          completedCampaignIds.length > 0
            ? "You already have finished loops"
            : "No campaigns fully closed yet",
      },
      {
        label: "Joined projects",
        value: String(canonicalJoinedCommunities.length),
        helper:
          canonicalJoinedCommunities.length > 0
            ? "Your live ecosystem footprint"
            : "Join a project to start progressing",
      },
    ],
    [approvedQuestCount, completedCampaignIds.length, canonicalJoinedCommunities.length]
  );

  const unlockedBadge = newBadgeId ? badges.find((badge) => badge.id === newBadgeId) || null : null;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.topLabel}>Veltrix Mission Control</Text>
          <Text style={styles.topTitle}>Home</Text>
        </View>

        <Pressable style={styles.notificationButton} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications" size={20} color={COLORS.text} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadNotificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <LiveScreenState loading={loading} error={error} />

      <LinearGradient
        colors={["#0B0D12", "#1C2A0A", "#0F3A2B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroLabel}>{missionOfTheDay.eyebrow}</Text>
            <Text style={styles.heroTitle}>{missionOfTheDay.title}</Text>
          </View>
          <View style={styles.heroAccentPill}>
            <Text style={styles.heroAccentText}>{missionOfTheDay.accent}</Text>
          </View>
        </View>

        <Text style={styles.heroBody}>{missionOfTheDay.body}</Text>

        <View style={styles.heroSignalRow}>
          <SignalPill label={`Level ${currentLevel}`} />
          <SignalPill label={`${streakCount} day streak`} />
          <SignalPill label={`${currentXp} XP banked`} />
        </View>

        <Pressable style={styles.primaryCta} onPress={missionOfTheDay.onPress}>
          <Text style={styles.primaryCtaText}>{missionOfTheDay.cta}</Text>
          <Ionicons name="arrow-forward" size={18} color="#050507" />
        </Pressable>
      </LinearGradient>

      <View style={styles.momentumGrid}>
        {momentumCards.map((card) => (
          <View key={card.label} style={styles.momentumCard}>
            <Text style={styles.momentumLabel}>{card.label}</Text>
            <Text style={styles.momentumValue}>{card.value}</Text>
            <Text style={styles.momentumHelper}>{card.helper}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pressureGrid}>
        <Pressable
          style={[styles.spotlightCard, styles.spotlightPrimary]}
          onPress={() =>
            nextReward
              ? router.push(nextReward.id && canonicalUnlockedRewardIds.includes(nextReward.id)
                  ? `/reward/${nextReward.id}`
                  : "/(tabs)/rewards")
              : router.push("/(tabs)/rewards")
          }
        >
          <Text style={styles.spotlightEyebrow}>Almost there</Text>
          <Text style={styles.spotlightTitle}>
            {nextReward ? nextReward.title : "No rewards queued yet"}
          </Text>
          <Text style={styles.spotlightBody}>
            {nextReward
              ? canonicalUnlockedRewardIds.includes(nextReward.id)
                ? "This reward is already unlocked. Turn that progress into a real claim now."
                : `${nextReward.cost} XP target. Keep pushing campaigns until this one flips from locked to live.`
              : "Complete campaigns and quests to start building a more compelling reward shelf."}
          </Text>
        </Pressable>

        <Pressable
          style={styles.spotlightCard}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.spotlightEyebrow}>Status pressure</Text>
          <Text style={styles.spotlightTitle}>
            {mostAdvancedProject ? `#${mostAdvancedProject.rank || "-"} in project` : "No project rank yet"}
          </Text>
          <Text style={styles.spotlightBody}>
            {mostAdvancedProject
              ? `${mostAdvancedProject.contributionTier.toUpperCase()} tier inside your strongest project. Keep compounding trust and completions to climb.`
              : "Join and complete actions inside a project to start building relative status."}
          </Text>
        </Pressable>
      </View>

      <View style={styles.progressionCard}>
        <View style={styles.progressionHeader}>
          <View>
            <Text style={styles.progressionLabel}>Momentum snapshot</Text>
            <Text style={styles.progressionTitle}>What could move next</Text>
          </View>
          <View style={styles.progressionPill}>
            <Text style={styles.progressionPillText}>{pendingQuestCount} pending</Text>
          </View>
        </View>

        <View style={styles.progressionRail}>
          <ProgressRailItem
            label="Claimable rewards"
            value={String(claimableRewards.length)}
            tone={claimableRewards.length > 0 ? "hot" : "neutral"}
          />
          <ProgressRailItem
            label="Unread signals"
            value={String(unreadNotificationCount)}
            tone={unreadNotificationCount > 0 ? "hot" : "neutral"}
          />
          <ProgressRailItem
            label="Projects joined"
            value={String(canonicalJoinedCommunities.length)}
            tone="neutral"
          />
        </View>
      </View>

      {recentActivity.length > 0 ? (
        <>
          <SectionTitle title="Recent activity" subtitle="What just moved across your account" />
          <View style={styles.activityTicker}>
            {recentActivity.map((item) => (
              <Pressable
                key={item.id}
                style={styles.activityCard}
                onPress={() => router.push("/notifications")}
              >
                <View style={styles.activityTypePill}>
                  <Text style={styles.activityTypeText}>{item.type}</Text>
                </View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityBody}>{item.body}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <SectionTitle title="Trending campaigns" subtitle="High-signal missions with live momentum" />
      {trendingCampaigns.map((item) => (
        <DiscoveryCampaignCard key={item.id} item={item} badgeLabel="Trending" />
      ))}

      <SectionTitle
        title="Picked for you"
        subtitle="Recommended next moves based on your communities and progression"
      />
      {recommendedCampaigns.map((item) => (
        <DiscoveryCampaignCard key={item.id} item={item} badgeLabel="Recommended" />
      ))}

      <SectionTitle title="Active raids" subtitle="Live campaigns your community can push now" />
      {raids.map((item) => (
        <GlowCard key={item.id}>
          <RaidCard item={item} />
        </GlowCard>
      ))}

      <SectionTitle title="Project ecosystems" subtitle="Join projects and expand your progression surface" />
      <SearchInput value={query} onChangeText={setQuery} placeholder="Search projects..." />

      {filteredCommunities.map((item) => (
        <View key={item.id} style={styles.communityWrap}>
          <CommunityCard item={item} />
          <Text style={styles.discoveryReason}>{item.reason}</Text>
        </View>
      ))}

      {showLevelUp && <LevelUpBurst level={currentLevel} onDone={() => setShowLevelUp(false)} />}
      {unlockedBadge && <BadgeUnlockToast badge={unlockedBadge} onDone={() => setNewBadgeId(null)} />}
    </Screen>
  );
}

function SignalPill({ label }: { label: string }) {
  return (
    <View style={styles.heroPill}>
      <Text style={styles.heroPillText}>{label}</Text>
    </View>
  );
}

function ProgressRailItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "hot" | "neutral";
}) {
  return (
    <View style={[styles.progressRailItem, tone === "hot" && styles.progressRailItemHot]}>
      <Text style={styles.progressRailLabel}>{label}</Text>
      <Text style={styles.progressRailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topLabel: {
    color: COLORS.subtext,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  topTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C6FF00",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#050507",
    fontSize: 10,
    fontWeight: "800",
  },
  hero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    shadowColor: "#C6FF00",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    right: -32,
    top: -18,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(198,255,0,0.15)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  heroLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
    maxWidth: 250,
  },
  heroAccentPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.22)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroAccentText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  heroBody: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: "94%",
  },
  heroSignalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  heroPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.18)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  primaryCta: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  primaryCtaText: {
    color: "#050507",
    fontSize: 15,
    fontWeight: "900",
  },
  momentumGrid: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  momentumCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 8,
  },
  momentumLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  momentumValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
  },
  momentumHelper: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 17,
  },
  pressureGrid: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  spotlightCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 8,
  },
  spotlightPrimary: {
    borderColor: "rgba(198,255,0,0.28)",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  spotlightEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  spotlightTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  spotlightBody: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  progressionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
  },
  progressionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.md,
  },
  progressionLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
  },
  progressionPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressionPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  progressionRail: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  progressRailItem: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    padding: SPACING.md,
    gap: 6,
  },
  progressRailItemHot: {
    borderColor: "rgba(198,255,0,0.28)",
    backgroundColor: "rgba(198,255,0,0.08)",
  },
  progressRailLabel: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 17,
  },
  progressRailValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  activityTicker: {
    gap: SPACING.md,
  },
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 8,
  },
  activityTypePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activityTypeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  activityBody: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  communityWrap: {
    gap: 8,
  },
  discoveryReason: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
    paddingHorizontal: 2,
  },
});
