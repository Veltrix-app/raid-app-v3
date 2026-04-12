import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { COLORS } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: Props) {
  const { initialized, loading, session } = useAuth();

  if (!initialized || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.text}>Checking session...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  text: {
    color: COLORS.subtext,
  },
});
