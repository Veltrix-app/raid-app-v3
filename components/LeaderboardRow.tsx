import React from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = {
  rank: number;
  username: string;
  xp: number;
  isCurrentUser?: boolean;
  title?: string;
  banner?: string;
  streakCount?: number;
};

function getRankStyle(rank: number) {
  if (rank === 1) {
    return { borderColor: "#FFC857", glow: "#FFC857" };
  }
  if (rank === 2) {
    return { borderColor: "#C8D0D9", glow: "#C8D0D9" };
  }
  if (rank === 3) {
    return { borderColor: "#D68A4D", glow: "#D68A4D" };
  }
  return { borderColor: COLORS.border, glow: COLORS.primary };
}

export default function LeaderboardRow({
  rank,
  username,
  xp,
  isCurrentUser = false,
  title,
  banner,
  streakCount,
}: Props) {
  const rankStyle = getRankStyle(rank);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: isCurrentUser ? COLORS.primary : rankStyle.borderColor,
          shadowColor: rank <= 3 ? rankStyle.glow : COLORS.primary,
          shadowOpacity: rank <= 3 || isCurrentUser ? 0.18 : 0.08,
        },
        isCurrentUser && styles.currentUser,
      ]}
    >
      <ImageBackground
        source={{
          uri:
            banner ||
            "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80",
        }}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <View style={[styles.rankBadge, { borderColor: rankStyle.borderColor }]}>
            <Text style={[styles.rankText, { color: rankStyle.borderColor }]}>#{rank}</Text>
          </View>

          <View style={styles.textWrap}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{username}</Text>
              {streakCount && streakCount > 1 ? (
                <Text style={styles.streak}>🔥 {streakCount}</Text>
              ) : null}
            </View>
            <Text style={styles.title}>{isCurrentUser ? "You" : title || "Top Raider"}</Text>
          </View>

          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: COLORS.card,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },

  currentUser: {
    shadowOpacity: 0.26,
  },

  banner: {
    height: 88,
    justifyContent: "center",
  },

  bannerImage: {
    borderRadius: RADIUS.xl,
  },

  bannerOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(5,5,7,0.48)",
  },

  rankBadge: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontWeight: "800",
    fontSize: 14,
  },

  textWrap: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  streak: {
    color: "#FFC857",
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },

  xpBadge: {
    backgroundColor: "rgba(0,255,163,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,163,0.30)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  xpText: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 12,
  },
});