import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export default function XpBadge({ value }: any) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>+{value} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(198,255,0,0.15)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,

    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.4)",
  },

  text: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },
});