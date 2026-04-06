import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export default function FilterChip({ label, active = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "rgba(198,255,0,0.14)",
    borderColor: "rgba(198,255,0,0.35)",
  },
  text: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "800",
  },
  textActive: {
    color: COLORS.primary,
  },
});