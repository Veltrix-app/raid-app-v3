import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import ProgressBar from "@/components/ProgressBar";
import { DiscoveryCampaign } from "@/lib/discovery";

type Props = {
  item: DiscoveryCampaign;
  badgeLabel?: string;
};

export default function DiscoveryCampaignCard({ item, badgeLabel }: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/campaign/${item.id}`)}
    >
      <View style={styles.topRow}>
        <View style={styles.communityBadge}>
          <Text style={styles.communityBadgeText}>{item.communityName.slice(0, 1)}</Text>
        </View>
        <View style={styles.topBody}>
          <Text style={styles.community}>{item.communityName}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel || `+${item.xp} XP`}</Text>
        </View>
      </View>

      <View style={styles.signalRow}>
        <Text style={styles.signalLabel}>Signal</Text>
        <Text style={styles.signalValue}>{item.reason}</Text>
      </View>

      <View style={styles.header}>
        <Pill label={`${item.progress}% complete`} />
        <Pill label={`${item.questCount} quests`} />
        <Pill label={`${item.rewardCount} rewards`} />
        <Pill label={item.joinedCommunity ? "Joined" : "Explore"} />
      </View>

      <ProgressBar progress={item.progress} />
    </Pressable>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.18)",
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  communityBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  communityBadgeText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  topBody: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    alignItems: "center",
  },
  community: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  badge: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,255,163,0.22)",
    alignSelf: "flex-start",
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  signalRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
  },
  signalLabel: {
    color: COLORS.subtext,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 2,
  },
  signalValue: {
    flex: 1,
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  pill: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
