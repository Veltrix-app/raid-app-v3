import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import XPGainToast from "@/components/XPGainToast";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

function getStatusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "pending") return "Pending Review";
  if (status === "rejected") return "Rejected";
  return "Open";
}

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submitQuest, approveQuestPrototype, questStatuses } = useAppState();
  const { quests, loading, error } = useLiveAppData();

  const [proof, setProof] = useState("");
  const [showXP, setShowXP] = useState(false);

  const quest = useMemo(
    () => quests.find((item) => item.id === (id || "")),
    [quests, id]
  );

  if (!quest) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Quest not found.</Text>
      </Screen>
    );
  }

  const currentQuest = quest;

  const liveStatus = questStatuses[currentQuest.id] || currentQuest.status;

  function handleSubmit() {
    if (liveStatus === "approved") {
      Alert.alert("Already approved", "This quest is already approved.");
      return;
    }

    if (!proof.trim() && currentQuest.type === "Proof") {
      Alert.alert("Proof required", "Please paste proof before submitting.");
      return;
    }

    submitQuest(currentQuest.id, proof.trim());
    Alert.alert("Submitted", "Your quest proof has been submitted.");
  }

  function handlePrototypeApprove() {
    if (liveStatus === "approved") {
      Alert.alert("Already approved", "This quest is already approved.");
      return;
    }

    approveQuestPrototype(currentQuest.id);
    setShowXP(true);
    Alert.alert("Approved", "Prototype approval complete.");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Quest",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Quest</Text>
          <Text style={styles.heroTitle}>{currentQuest.title}</Text>
          <Text style={styles.heroDescription}>{currentQuest.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{currentQuest.type}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Reward</Text>
              <Text style={styles.metaValue}>+{currentQuest.xp} XP</Text>
            </View>
          </View>
        </View>

        <SectionTitle
          title="Status"
          subtitle="Current review state for this quest"
        />
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>{getStatusLabel(liveStatus)}</Text>
          <Text style={styles.statusSub}>
            Action: {currentQuest.actionLabel || "Open Task"}
          </Text>
        </View>

        <SectionTitle
          title="Proof / Notes"
          subtitle="Paste a link, screenshot note or completion message"
        />
        <View style={styles.proofCard}>
          <TextInput
            value={proof}
            onChangeText={setProof}
            multiline
            style={styles.input}
            placeholder="Paste proof here..."
            placeholderTextColor={COLORS.subtext}
          />
        </View>

        <PrimaryButton
          title={liveStatus === "approved" ? "Quest Approved" : "Submit Quest"}
          onPress={handleSubmit}
          disabled={liveStatus === "approved"}
        />

        <PrimaryButton
          title="Prototype Approve"
          variant="secondary"
          onPress={handlePrototypeApprove}
          disabled={liveStatus === "approved"}
        />

        {showXP && <XPGainToast amount={currentQuest.xp} onDone={() => setShowXP(false)} />}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
  },
  heroLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  heroDescription: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  metaCard: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  statusLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  statusSub: {
    color: COLORS.subtext,
    fontSize: 13,
  },
  proofCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    minHeight: 120,
    color: COLORS.text,
    textAlignVertical: "top",
    fontSize: 14,
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
