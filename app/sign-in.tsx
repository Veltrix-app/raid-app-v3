import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Screen from "@/components/Screen";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

export default function SignInScreen() {
  const { signIn, signUp, loading, error, clearError } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleSubmit() {
    clearError();

    if (mode === "signin") {
      const result = await signIn(email, password);
      if (result.ok) {
        router.replace("/(tabs)");
      }
      return;
    }

    const result = await signUp(email, password, username);
    if (result.ok) {
      router.replace("/(tabs)");
    }
  }

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Veltrix Access</Text>
        <Text style={styles.title}>Sign in to Raid App</Text>

        <View style={styles.switchRow}>
          <Pressable
            onPress={() => setMode("signin")}
            style={[styles.switchBtn, mode === "signin" && styles.switchActive]}
          >
            <Text style={[styles.switchText, mode === "signin" && styles.switchTextActive]}>
              Sign In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("signup")}
            style={[styles.switchBtn, mode === "signup" && styles.switchActive]}
          >
            <Text style={[styles.switchText, mode === "signup" && styles.switchTextActive]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {mode === "signup" ? (
          <TextInput
            placeholder="Username"
            placeholderTextColor={COLORS.subtext}
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        ) : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.subtext}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.subtext}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitText}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginTop: 60,
  },
  eyebrow: {
    color: COLORS.primary,
    textTransform: "uppercase",
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
  },
  switchRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  switchBtn: {
    flex: 1,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
    paddingVertical: 12,
    alignItems: "center",
  },
  switchActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(198,255,0,0.12)",
  },
  switchText: {
color: COLORS.subtext,
    fontWeight: "700",
  },
  switchTextActive: {
    color: COLORS.primary,
  },
  input: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  submitText: {
    color: "#050507",
    fontWeight: "800",
    fontSize: 16,
  },
  error: {
    color: "#ff7a7a",
    fontSize: 13,
  },
});