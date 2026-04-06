import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lootbox } from "@/types";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

type Props = {
  item: Lootbox;
  onPress?: () => void;
};

export default function LootboxCard({ item, onPress }: Props) {
  const { currentXp } = useAppState();
  const affordable = currentXp >= item.cost;

  return (
    <Pressable
      style={[styles.card, affordable && styles.cardActive]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.rarity}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.cost}>{item.cost} XP</Text>
        <Text style={styles.action}>{affordable ? "Open" : "Need XP"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },

  cardActive: {
    borderColor: "rgba(198,255,0,0.30)",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.md,
  },

  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },

  badge: {
    backgroundColor: "rgba(198,255,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.25)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  description: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cost: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  action: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
});