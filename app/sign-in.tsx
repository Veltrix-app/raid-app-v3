import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Screen from "@/components/Screen";
import PrimaryButton from "@/components/PrimaryButton";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

export default function SignInScreen() {
  const { signIn } = useAppState();

  function handleSignIn() {
    signIn();
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <LinearGradient colors={["#6D5EF7", "#3B2E7E"]} style={styles.hero}>
        <Text style={styles.kicker}>Crypto Community Growth</Text>
        <Text style={styles.title}>Join missions. Earn rewards. Grow communities.</Text>
        <Text style={styles.subtitle}>
          A mobile-first raid and quest app for crypto communities.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in to continue</Text>
        <Text style={styles.cardText}>
          For this prototype, the buttons below simulate sign-in and onboarding.
        </Text>

        <PrimaryButton title="Continue with Google" onPress={handleSignIn} />
        <PrimaryButton title="Continue with X" variant="secondary" onPress={handleSignIn} />
        <PrimaryButton title="Connect Wallet" variant="secondary" onPress={handleSignIn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  kicker: {
    color: "white",
    opacity: 0.9,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },
  cardText: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
});