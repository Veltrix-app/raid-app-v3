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
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.members.toLocaleString()} members</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>

        <View style={[styles.badge, joined && styles.badgeJoined]}>
          <Text style={[styles.badgeText, joined && styles.badgeTextJoined]}>
            {joined ? "Joined" : "Open"}
          </Text>
        </View>
      </View>

      <View style={styles.pool}>
        <Text style={styles.poolLabel}>Reward pool</Text>
        <Text style={styles.poolValue}>{item.rewardPool}</Text>
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
  row: {
    flexDirection: "row",
    gap: SPACING.md,
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
    marginTop: 8,
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
  pool: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  poolLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  poolValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});