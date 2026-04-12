import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { Community } from "@/types";
import { useAppState } from "@/hooks/useAppState";

type Props = {
  item: Community;
};

export default function CommunityCard({ item }: Props) {
  const { joinedCommunityIds } = useAppState();
  const joined = joinedCommunityIds.includes(item.id);

  return (
    <Pressable style={[styles.card, joined && styles.cardJoined]} onPress={() => router.push(`/community/${item.id}`)}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>{item.logo || item.name.slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {(item.chain || "Community")}{item.category ? ` | ${item.category}` : ""} | {item.members.toLocaleString()} members
          </Text>
        </View>

        <View style={[styles.badge, joined && styles.badgeJoined]}>
          <Text style={[styles.badgeText, joined && styles.badgeTextJoined]}>
            {joined ? "Joined" : "Open"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.desc}>{item.description}</Text>
      </View>

      <View style={styles.pillsRow}>
        <View style={styles.poolPill}>
          <Text style={styles.poolLabel}>Reward pool</Text>
          <Text style={styles.poolValue}>{item.rewardPool}</Text>
        </View>
        {item.website ? (
          <View style={styles.linkPill}>
            <Text style={styles.linkPillText}>Website connected</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,

    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  cardJoined: {
    borderColor: COLORS.borderStrong,
  },
  hero: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  row: {
    gap: SPACING.sm,
  },
  logoWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  name: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  desc: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeJoined: {
    backgroundColor: "rgba(198,255,0,0.12)",
    borderColor: "rgba(198,255,0,0.30)",
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  badgeTextJoined: {
    color: COLORS.primary,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  poolPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(198,255,0,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.25)",
  },
  linkPillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  poolLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  poolValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
});
