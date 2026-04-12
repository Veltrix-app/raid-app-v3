import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RewardsScreen() {
  const { rewards, loading, error } = useLiveAppData();

  function handleRewardPress(title: string) {
    Alert.alert(
      "Live reward loaded",
      `${title} is now coming from Supabase. Claim wiring is the next step.`
    );
  }

  return (
    <Screen>
      <SectionTitle
        title="Rewards"
        subtitle="Live rewards from your backend"
      />

      <LiveScreenState loading={loading} error={error} />

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Rewards are now loaded from Supabase. Claim execution will be connected in the next step.
        </Text>
      </View>

      {rewards.map((item) => (
        <Pressable
          key={item.id}
          style={styles.card}
          onPress={() => handleRewardPress(item.title)}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.type} • {item.rarity || "common"}
              </Text>
            </View>

            <View style={styles.costBadge}>
              <Text style={styles.costText}>{item.cost} XP</Text>
            </View>
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: "rgba(198,255,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.18)",
    borderRadius: 16,
    padding: 14,
  },
  infoText: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
    textTransform: "capitalize",
  },
  description: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  costBadge: {
    backgroundColor: COLORS.card2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  costText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },
});