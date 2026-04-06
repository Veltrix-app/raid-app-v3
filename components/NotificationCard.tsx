import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NotificationItem } from "@/types";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = {
  item: NotificationItem;
};

function getIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "xp":
      return "⚡";
    case "badge":
      return "🏆";
    case "reward":
      return "🎁";
    case "campaign":
      return "🏁";
    case "raid":
      return "🚀";
    case "quest":
      return "📌";
    case "lootbox":
      return "📦";
    default:
      return "🔔";
  }
}

export default function NotificationCard({ item }: Props) {
  return (
    <View style={[styles.card, !item.read && styles.cardUnread]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{getIcon(item.type)}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: {
    borderColor: "rgba(198,255,0,0.30)",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.card2,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  body: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  time: {
    color: COLORS.subtext,
    fontSize: 11,
    marginTop: 8,
  },
});