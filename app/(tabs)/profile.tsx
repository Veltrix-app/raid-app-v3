import React from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import PrimaryButton from "@/components/PrimaryButton";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useAuth } from "@/hooks/useAuth";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function ProfileScreen() {
  const {
    currentLevel,
    currentXp,
    nextLevelXp,
    walletConnected,
    connectWallet,
    completedQuestCount,
    confirmedRaidCount,
    joinedCommunityCount,
    claimCount,
    streakCount,
    resetProgress,
  } = useAppState();

  const { profile, signOut, loading: authLoading } = useAuth();
  const {
    badges,
    unlockedBadgeIds,
    loading: liveLoading,
    error,
  } = useLiveAppData();

  const progress = Math.min((currentXp / nextLevelXp) * 100, 100);
  const unlockedBadges = badges.filter((badge) =>
    unlockedBadgeIds.includes(badge.id)
  );

  const username = profile?.username || "Raider";
  const avatar =
    profile?.avatarUrl ||
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80";
  const banner =
    profile?.bannerUrl ||
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1400&q=80";
  const title = profile?.title || "Elite Raider";
  const faction = profile?.faction || "Neon Wolves";
  const bio = profile?.bio || "No bio set yet.";
  const contributionTier = profile?.contributionTier || "explorer";
  const trustScore = profile?.trustScore ?? 50;
  const sybilScore = profile?.sybilScore ?? 0;
  const reputationRank = profile?.reputationRank ?? 0;
  const questsCompleted = profile?.questsCompleted ?? completedQuestCount;
  const raidsCompleted = profile?.raidsCompleted ?? confirmedRaidCount;
  const rewardsClaimed = profile?.rewardsClaimed ?? claimCount;
  const walletText =
    walletConnected
      ? profile?.wallet || "Wallet connected"
      : "Wallet not connected";

  function handleWalletConnect() {
    connectWallet();
    Alert.alert("Wallet connected", "Wallet placeholder connected in this prototype.");
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <Screen>
      <LiveScreenState loading={liveLoading} error={error} />

      <ImageBackground
        source={{ uri: banner }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <Image source={{ uri: avatar }} style={styles.avatar} />

          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.playerTitle}>{title}</Text>
            <Text style={styles.faction}>{faction}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.bioCard}>
        <Text style={styles.bioTitle}>Profile Bio</Text>
        <Text style={styles.bioText}>{bio}</Text>

        <Text style={styles.wallet}>{walletText}</Text>

        <ProgressBar progress={progress} />
        <Text style={styles.levelText}>
          Level {currentLevel} • {currentXp} / {nextLevelXp} XP
        </Text>
      </View>

      <PrimaryButton
        title="Edit Profile"
        onPress={() => router.push("/profile/edit")}
      />

      <View style={styles.reputationCard}>
        <View style={styles.reputationHeader}>
          <View>
            <Text style={styles.reputationEyebrow}>Veltrix Reputation</Text>
            <Text style={styles.reputationTitle}>
              {contributionTier.toUpperCase()}
            </Text>
          </View>

          <View style={styles.rankPill}>
            <Text style={styles.rankLabel}>Rank</Text>
            <Text style={styles.rankValue}>
              {reputationRank > 0 ? `#${reputationRank}` : "-"}
            </Text>
          </View>
        </View>

        <Text style={styles.reputationText}>
          Trust and quality signals follow your activity across quests, raids and claims. This is the first layer of your portable Veltrix identity.
        </Text>

        <View style={styles.row}>
          <StatCard label="Trust score" value={trustScore} />
          <StatCard label="Sybil risk" value={sybilScore} />
        </View>
      </View>

      <View style={styles.row}>
        <StatCard label="Approved quests" value={String(questsCompleted)} />
        <StatCard label="Confirmed raids" value={String(raidsCompleted)} />
      </View>

      <View style={styles.row}>
        <StatCard label="Communities" value={String(joinedCommunityCount)} />
        <StatCard label="Claimed rewards" value={String(rewardsClaimed)} />
      </View>

      <View style={styles.row}>
        <StatCard label="Streak" value={`${streakCount}d`} />
        <StatCard label="Level" value={String(currentLevel)} />
      </View>

      <PrimaryButton
        title={walletConnected ? "Wallet Connected" : "Connect Wallet"}
        onPress={handleWalletConnect}
        disabled={walletConnected}
      />

      <PrimaryButton title="Reset Progress (DEV)" onPress={resetProgress} />

      <PrimaryButton
        title={authLoading ? "Signing Out..." : "Sign Out"}
        variant="secondary"
        onPress={handleSignOut}
      />

      <SectionTitle
        title="Unlocked Badges"
        subtitle="Your visible achievements"
      />

      <View style={styles.badgeCard}>
        {unlockedBadges.length > 0 ? (
          unlockedBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No badges unlocked yet.</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 210,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  heroImage: {
    borderRadius: RADIUS.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: "rgba(5,5,7,0.42)",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card2,
  },
  profileTextWrap: {
    flex: 1,
    paddingBottom: 6,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  playerTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  faction: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
  },
  bioCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  bioTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  bioText: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  reputationCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
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
    letterSpacing: 0.8,
  },
  reputationTitle: {
    color: COLORS.text,
    fontSize: 24,
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
  wallet: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  levelText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  badgeCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  badgeItem: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  badgeDesc: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 13,
  },
});
