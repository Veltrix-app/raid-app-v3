import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: Props) {
  if (variant === "secondary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.secondary, disabled && styles.disabled]}
      >
        <Text style={styles.secondaryText}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={disabled && styles.disabled}>
      <LinearGradient
        colors={["#C6FF00", "#00FFA3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#C6FF00",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  primaryText: {
    color: "#050507",
    fontSize: 15,
    fontWeight: "800",
  },
  secondary: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  secondaryText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.55,
  },
});