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

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function HomeScreen() {
  const {
    currentLevel,
    currentXp,
    unreadNotificationCount,
    claimedRewardIds,
    streakCount,
    registerDailyActivity,
    joinedCommunityIds,
  } = useAppState();

  const {
    communities,
    raids,
    rewards,
    badges,
    unlockedBadgeIds,
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
    const withJoined = communities.map((item) => ({
      ...item,
      joined: joinedCommunityIds.includes(item.id),
    }));

    if (!query.trim()) return withJoined;

    return withJoined.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [communities, query, joinedCommunityIds]);

  const featuredReward = useMemo(() => {
    const available = rewards.filter((reward) => !claimedRewardIds.includes(reward.id));
    return available[0] || rewards[0] || null;
  }, [rewards, claimedRewardIds]);

  const unlockedBadge = newBadgeId
    ? badges.find((badge) => badge.id === newBadgeId) || null
    : null;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.topLabel}>Crypto Raid App</Text>
          <Text style={styles.topTitle}>Home</Text>
        </View>

        <Pressable
          style={styles.notificationButton}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications" size={20} color={COLORS.text} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotificationCount}
              </Text>
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

      {featuredReward ? (
        <Pressable
          style={styles.featuredRewardCard}
          onPress={() => router.push("/(tabs)/rewards")}
        >
          <View style={styles.featuredRewardGlow} />
          <Text style={styles.featuredRewardLabel}>Featured Reward</Text>
          <Text style={styles.featuredRewardTitle}>{featuredReward.title}</Text>
          <Text style={styles.featuredRewardMeta}>
            {featuredReward.type} • {featuredReward.cost} XP
          </Text>
        </Pressable>
      ) : null}

      <SectionTitle
        title="Active raids"
        subtitle="Live campaigns your community can push now"
      />
      {raids.map((item) => (
        <GlowCard key={item.id}>
          <RaidCard item={item} />
        </GlowCard>
      ))}

      <SectionTitle
        title="Recommended communities"
        subtitle="Join projects and start earning"
      />
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search communities..."
      />

      {filteredCommunities.map((item) => (
        <CommunityCard key={item.id} item={item} />
      ))}

      {showLevelUp && (
        <LevelUpBurst
          level={currentLevel}
          onDone={() => setShowLevelUp(false)}
        />
      )}

      {unlockedBadge && (
        <BadgeUnlockToast
          badge={unlockedBadge}
          onDone={() => setNewBadgeId(null)}
        />
      )}
    </Screen>
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
    letterSpacing: 0.4,
  },
  topTitle: {
    color: COLORS.text,
    fontSize: 24,
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
  heroValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "800",
  },
  heroSub: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "90%",
  },
  heroPillsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  heroPill: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
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
  featuredRewardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  featuredRewardMeta: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 6,
  },
});