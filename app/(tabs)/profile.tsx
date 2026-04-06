import React from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import PrimaryButton from "@/components/PrimaryButton";

import { badgesCatalog } from "@/data/mock";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

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
    signOut,
    profile,
    unlockedBadgeIds,
    streakCount,
    resetProgress,
  } = useAppState();

  const progress = Math.min((currentXp / nextLevelXp) * 100, 100);
  const unlockedBadges = badgesCatalog.filter((badge) =>
    unlockedBadgeIds.includes(badge.id)
  );

  function handleWalletConnect() {
    connectWallet();
    Alert.alert("Wallet connected", "Wallet placeholder connected in this prototype.");
  }

  function handleSignOut() {
    signOut();
  }

  return (
    <Screen>
      <ImageBackground
        source={{
          uri:
            profile?.banner ||
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1400&q=80",
        }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <Image
            source={{
              uri:
                profile?.avatar ||
                "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80",
            }}
            style={styles.avatar}
          />

          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{profile?.username || "Raider"}</Text>
            <Text style={styles.playerTitle}>{profile?.title || "Elite Raider"}</Text>
            <Text style={styles.faction}>{profile?.faction || "Neon Wolves"}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.bioCard}>
        <Text style={styles.bioTitle}>Profile Bio</Text>
        <Text style={styles.bioText}>
          {profile?.bio || "No bio set yet."}
        </Text>

        <Text style={styles.wallet}>
          {walletConnected
            ? profile?.wallet || "Wallet connected"
            : "Wallet not connected"}
        </Text>

        <ProgressBar progress={progress} />
        <Text style={styles.levelText}>
          Level {currentLevel} • {currentXp} / {nextLevelXp} XP
        </Text>
      </View>

      <PrimaryButton title="Edit Profile" onPress={() => router.push("/profile/edit")} />

      <View style={styles.row}>
        <StatCard label="Approved quests" value={String(completedQuestCount)} />
        <StatCard label="Confirmed raids" value={String(confirmedRaidCount)} />
      </View>

      <View style={styles.row}>
        <StatCard label="Communities" value={String(joinedCommunityCount)} />
        <StatCard label="Claimed rewards" value={String(claimCount)} />
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

      <PrimaryButton title="Sign Out" variant="secondary" onPress={handleSignOut} />

      <SectionTitle title="Unlocked Badges" subtitle="Your visible achievements" />

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