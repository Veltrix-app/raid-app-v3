import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <View style={styles.bg}>
      <LinearGradient
        colors={["#C6FF00", "#00FFA3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.min(progress, 100)}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    height: 10,
    backgroundColor: COLORS.card3,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});