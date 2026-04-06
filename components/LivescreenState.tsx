import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = {
  loading?: boolean;
  error?: string | null;
};

export default function LiveScreenState({ loading, error }: Props) {
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator />
        <Text style={styles.text}>Loading live data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.error}>Live data error</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  box: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 10,
    alignItems: "center",
  },
  text: {
    color: COLORS.subtext,
    textAlign: "center",
  },
  error: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
  },
});