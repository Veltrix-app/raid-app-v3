import React, { useMemo, useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import XPGainToast from "@/components/XPGainToast";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RaidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { confirmRaid, confirmedRaidIds } = useAppState();
  const { raids, loading, error } = useLiveAppData();

  const [showXP, setShowXP] = useState(false);

  const raid = useMemo(
    () => raids.find((item) => item.id === (id || "")),
    [raids, id]
  );

  if (!raid) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Raid not found.</Text>
      </Screen>
    );
  }

  const currentRaid = raid;
  const alreadyConfirmed = confirmedRaidIds.includes(currentRaid.id);

  function handleConfirm() {
    if (alreadyConfirmed) {
      Alert.alert("Already confirmed", "You already confirmed this raid.");
      return;
    }

    confirmRaid(currentRaid.id);
    setShowXP(true);
    Alert.alert("Raid confirmed", "Your raid has been confirmed.");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Raid",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <ImageBackground
          source={{ uri: currentRaid.banner }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.community}>{currentRaid.community}</Text>
            <Text style={styles.title}>{currentRaid.title}</Text>
            <Text style={styles.target}>{currentRaid.target}</Text>
          </View>
        </ImageBackground>

        <View style={styles.infoCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Reward</Text>
              <Text style={styles.statValue}>+{currentRaid.reward} XP</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Timer</Text>
              <Text style={styles.statValue}>{currentRaid.timer}</Text>
            </View>
          </View>

          <ProgressBar progress={currentRaid.progress} />
          <Text style={styles.progressLabel}>{currentRaid.progress}% campaign push progress</Text>
        </View>

        <SectionTitle
          title="Instructions"
          subtitle="Complete these steps and then confirm your action"
        />

        <View style={styles.instructionsCard}>
          {currentRaid.instructions.map((step, index) => (
            <View key={`${currentRaid.id}-${index}`} style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          title={alreadyConfirmed ? "Raid Confirmed" : "Confirm Raid"}
          onPress={handleConfirm}
          disabled={alreadyConfirmed}
        />

        {showXP && <XPGainToast amount={40} onDone={() => setShowXP(false)} />}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: RADIUS.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(5,5,7,0.40)",
    padding: SPACING.lg,
    gap: 6,
  },
  community: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  target: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  progressLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  instructionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(198,255,0,0.14)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
