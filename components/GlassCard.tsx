import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export default function GlassCard({ children }: any) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
    backdropFilter: "blur(20px)",
  },
});