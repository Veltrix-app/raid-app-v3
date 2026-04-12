import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
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
  const {
    currentLevel,
    currentXp,
    claimedRewardIds,
    unlockedRewardIds,
    streakCount,
    registerDailyActivity,
    joinedCommunityIds,
    completedCampaignIds,
    questStatuses,
  } = useAppState();

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

  const featuredReward = useMemo(() => {
    const available = rewards.filter((reward) => !claimedRewardIds.includes(reward.id));
    return available[0] || rewards[0] || null;
  }, [rewards, claimedRewardIds]);

  const claimableRewards = useMemo(
    () =>
      rewards.filter(
        (reward) =>
          unlockedRewardIds.includes(reward.id) &&
          !claimedRewardIds.includes(reward.id) &&
          reward.claimable !== false
      ),
    [claimedRewardIds, rewards, unlockedRewardIds]
  );

  const pendingQuestCount = useMemo(
    () => Object.values(questStatuses).filter((status) => status === "pending").length,
    [questStatuses]
  );

  const approvedQuestCount = useMemo(
    () => Object.values(questStatuses).filter((status) => status === "approved").length,
    [questStatuses]
  );

  const recentActivity = useMemo(() => notificationsFeed.slice(0, 3), [notificationsFeed]);

  const nextAction = useMemo(() => {
    if (claimableRewards.length > 0) {
      return {
        title: "Claim your unlocked rewards",
        body: `${claimableRewards.length} reward${claimableRewards.length === 1 ? "" : "s"} are ready to move from earned to claimed.`,
        cta: "Open rewards",
        onPress: () => router.push("/(tabs)/rewards"),
      };
    }

    if (pendingQuestCount > 0) {
      return {
        title: "Track pending quest reviews",
        body: `${pendingQuestCount} submission${pendingQuestCount === 1 ? "" : "s"} are still under review.`,
        cta: "Open activity",
        onPress: () => router.push("/notifications"),
      };
    }

    if (recommendedCampaigns.length > 0) {
      const campaign = recommendedCampaigns[0];
      return {
        title: "Push your next campaign",
        body: `${campaign.title} is the best next move based on your joined communities and progress.`,
        cta: "Open campaign",
        onPress: () => router.push(`/campaign/${campaign.id}`),
      };
    }

    return {
      title: "Join another community",
      body: "Expand your signal surface to unlock more quests, raids and reputation paths.",
      cta: "Explore campaigns",
      onPress: () => router.push("/(tabs)/campaigns"),
    };
  }, [claimableRewards.length, pendingQuestCount, recommendedCampaigns]);

  const unlockedBadge = newBadgeId ? badges.find((badge) => badge.id === newBadgeId) || null : null;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.topLabel}>Crypto Raid App</Text>
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

      <LinearGradient
        colors={["#0B0D12", "#18210F", "#13261D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <Text style={styles.heroLabel}>Live Raider Streak</Text>
        <Text style={styles.heroValue}>{streakCount} days</Text>
        <Text style={styles.heroSub}>
          Stay active daily to keep your streak alive and earn bonus XP over time.
        </Text>
        <View style={styles.heroPillsRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Neon Rewards</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Live Raids</Text>
          </View>
        </View>
      </LinearGradient>

      <LiveScreenState loading={loading} error={error} />

      <View style={styles.row}>
        <StatCard label="Level" value={String(currentLevel)} />
        <StatCard label="XP" value={String(currentXp)} />
      </View>

      <View style={styles.row}>
        <StatCard label="Approved quests" value={String(approvedQuestCount)} />
        <StatCard label="Completed campaigns" value={String(completedCampaignIds.length)} />
      </View>

      <Pressable style={styles.nextActionCard} onPress={nextAction.onPress}>
        <View style={styles.nextActionGlow} />
        <Text style={styles.nextActionLabel}>Next best action</Text>
        <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
        <Text style={styles.nextActionBody}>{nextAction.body}</Text>
        <Text style={styles.nextActionCta}>{nextAction.cta}</Text>
      </Pressable>

      {featuredReward ? (
        <Pressable style={styles.featuredRewardCard} onPress={() => router.push("/(tabs)/rewards")}>
          <View style={styles.featuredRewardGlow} />
          <Text style={styles.featuredRewardLabel}>Featured Reward</Text>
          <Text style={styles.featuredRewardTitle}>{featuredReward.title}</Text>
          <Text style={styles.featuredRewardMeta}>
            {featuredReward.type} | {featuredReward.cost} XP
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.progressionCard}>
        <View style={styles.progressionHeader}>
          <View>
            <Text style={styles.progressionLabel}>Momentum</Text>
            <Text style={styles.progressionTitle}>Progression snapshot</Text>
          </View>
          <View style={styles.progressionPill}>
            <Text style={styles.progressionPillText}>{joinedCommunityIds.length} communities</Text>
          </View>
        </View>

        <View style={styles.progressionGrid}>
          <View style={styles.progressionMetric}>
            <Text style={styles.progressionMetricValue}>{claimableRewards.length}</Text>
            <Text style={styles.progressionMetricLabel}>Claimable rewards</Text>
          </View>
          <View style={styles.progressionMetric}>
            <Text style={styles.progressionMetricValue}>{pendingQuestCount}</Text>
            <Text style={styles.progressionMetricLabel}>Pending reviews</Text>
          </View>
          <View style={styles.progressionMetric}>
            <Text style={styles.progressionMetricValue}>{approvedQuestCount}</Text>
            <Text style={styles.progressionMetricLabel}>Approved quests</Text>
          </View>
        </View>
      </View>

      {recentActivity.length > 0 ? (
        <>
          <SectionTitle title="Recent activity" subtitle="What just moved across your account" />
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

      <SectionTitle title="Recommended communities" subtitle="Join projects and start earning" />
      <SearchInput value={query} onChangeText={setQuery} placeholder="Search communities..." />

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

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topLabel: { color: COLORS.subtext, fontSize: 12, letterSpacing: 0.4 },
  topTitle: { color: COLORS.text, fontSize: 24, fontWeight: "800", marginTop: 4 },
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
  notificationBadgeText: { color: "#050507", fontSize: 10, fontWeight: "800" },
  hero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: 10,
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
  heroValue: { color: COLORS.text, fontSize: 34, fontWeight: "800" },
  heroSub: { color: COLORS.subtext, fontSize: 14, lineHeight: 20, maxWidth: "90%" },
  heroPillsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  heroPill: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", gap: SPACING.md },
  nextActionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    overflow: "hidden",
    position: "relative",
    gap: 8,
  },
  nextActionGlow: {
    position: "absolute",
    right: -24,
    top: -24,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: "rgba(198,255,0,0.10)",
  },
  nextActionLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextActionTitle: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  nextActionBody: { color: COLORS.subtext, fontSize: 13, lineHeight: 20 },
  nextActionCta: { color: COLORS.primary, fontSize: 13, fontWeight: "800", marginTop: 2 },
  featuredRewardCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    overflow: "hidden",
    position: "relative",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  featuredRewardGlow: {
    position: "absolute",
    left: -30,
    bottom: -30,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,163,0.10)",
  },
  featuredRewardLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredRewardTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginTop: 6 },
  featuredRewardMeta: { color: COLORS.subtext, fontSize: 13, marginTop: 6 },
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
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressionTitle: { color: COLORS.text, fontSize: 20, fontWeight: "800", marginTop: 6 },
  progressionPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressionPillText: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  progressionGrid: { flexDirection: "row", gap: SPACING.md },
  progressionMetric: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.card2,
    padding: SPACING.md,
  },
  progressionMetricValue: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  progressionMetricLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 6, lineHeight: 18 },
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
  activityTitle: { color: COLORS.text, fontSize: 15, fontWeight: "800" },
  activityBody: { color: COLORS.subtext, fontSize: 13, lineHeight: 19 },
  communityWrap: { gap: 8 },
  discoveryReason: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
    paddingHorizontal: 2,
  },
});
