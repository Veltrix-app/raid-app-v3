import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { Quest } from "@/types";
import { useAppState } from "@/hooks/useAppState";

type Props = {
  item: Quest;
};

function getStatusStyles(status: string) {
  if (status === "approved") {
    return {
      borderColor: COLORS.success,
      badgeBg: COLORS.success,
      badgeText: "#050507",
      label: "Approved",
    };
  }

  if (status === "pending") {
    return {
      borderColor: "#FFC857",
      badgeBg: "rgba(255,200,87,0.18)",
      badgeText: "#FFC857",
      label: "Pending",
    };
  }

  if (status === "rejected") {
    return {
      borderColor: "#FF6B6B",
      badgeBg: "rgba(255,107,107,0.15)",
      badgeText: "#FF6B6B",
      label: "Rejected",
    };
  }

  return {
    borderColor: COLORS.border,
    badgeBg: "rgba(198,255,0,0.10)",
    badgeText: COLORS.primary,
    label: "Open",
  };
}

export default function QuestCard({ item }: Props) {
  const { questStatuses } = useAppState();
  const liveStatus = questStatuses[item.id] || item.status;
  const statusStyles = getStatusStyles(liveStatus);

  return (
    <Pressable
      style={[styles.card, { borderColor: statusStyles.borderColor }]}
      onPress={() => router.push(`/quest/${item.id}`)}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.type} • +{item.xp} XP
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusStyles.badgeBg }]}>
          <Text style={[styles.badgeText, { color: statusStyles.badgeText }]}>
            {statusStyles.label}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.actionText}>{item.actionLabel || "Open Quest"}</Text>
        <Text style={styles.viewText}>View</Text>
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
    gap: SPACING.md,
  },
  topRow: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  viewText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
});