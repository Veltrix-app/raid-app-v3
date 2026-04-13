import React, { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import XPGainToast from "@/components/XPGainToast";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useAuth } from "@/hooks/useAuth";
import { useLiveAppData } from "@/hooks/useLiveAppData";

const PORTAL_BASE_URL =
  process.env.EXPO_PUBLIC_PORTAL_BASE_URL ||
  "https://crypto-raid-admin-portal-bu2lofn3c-veltrix-apps-projects.vercel.app";

function getStatusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "pending") return "Pending Review";
  if (status === "rejected") return "Rejected";
  return "Open";
}

function getProofGuidance(params: {
  proofRequired?: boolean;
  proofType?: string;
  verificationType?: string;
  verificationProvider?: string;
  completionMode?: string;
  questType?: string;
}) {
  const {
    proofRequired,
    proofType,
    verificationType,
    verificationProvider,
    completionMode,
    questType,
  } = params;

  if (
    questType === "telegram_join" &&
    verificationProvider === "telegram" &&
    completionMode === "integration_auto"
  ) {
    return "Link your Telegram account, join the group and let Veltrix wait for membership confirmation instead of asking for manual proof.";
  }

  if (
    questType === "discord_join" &&
    verificationProvider === "discord" &&
    completionMode === "integration_auto"
  ) {
    return "Link your Discord account, join the server and let Veltrix wait for membership confirmation instead of asking for manual proof.";
  }

  if (
    questType === "url_visit" &&
    verificationProvider === "website" &&
    completionMode === "integration_auto"
  ) {
    return "Open the tracked destination and Veltrix will complete this quest automatically after the website visit is confirmed.";
  }

  if (!proofRequired || proofType === "none") {
    return "No proof upload is required here. Complete the action and submit when you are done.";
  }

  if (proofType === "url") {
    return "Paste the direct URL that proves you completed the action.";
  }

  if (proofType === "tx_hash") {
    return "Paste the onchain transaction hash so Veltrix can verify the action cleanly.";
  }

  if (proofType === "wallet") {
    return "Use your connected wallet context or paste the relevant wallet address if requested.";
  }

  if (proofType === "image") {
    return "Paste a clear screenshot note or image proof reference that a reviewer can understand quickly.";
  }

  if (questType === "referral" || verificationType === "hybrid") {
    return "This quest mixes automation and review, so be as explicit as possible in your proof.";
  }

  return "Add the clearest proof you can so review is fast and predictable.";
}

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const {
    submitQuest,
    approveQuestPrototype,
    questStatuses,
    questProofs,
    walletConnected,
  } = useAppState();
  const { quests, campaigns, rewards, loading, error } = useLiveAppData();

  const existingProof = questProofs[id || ""] || "";
  const [proof, setProof] = useState(existingProof);
  const [showXP, setShowXP] = useState(false);
  const [openingTrackedTask, setOpeningTrackedTask] = useState(false);

  const quest = useMemo(
    () => quests.find((item) => item.id === (id || "")),
    [quests, id]
  );

  useEffect(() => {
    setProof(existingProof);
  }, [existingProof, id]);

  if (!quest) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Quest not found.</Text>
      </Screen>
    );
  }

  const currentQuest = quest;
  const linkedCampaign = campaigns.find((item) => item.id === currentQuest.campaignId);
  const linkedRewards = rewards.filter((item) => item.campaignId === currentQuest.campaignId).slice(0, 3);
  const liveStatus = questStatuses[currentQuest.id] || currentQuest.status;
  const proofGuidance = getProofGuidance({
    proofRequired: currentQuest.proofRequired,
    proofType: currentQuest.proofType,
    verificationType: currentQuest.verificationType,
    verificationProvider: currentQuest.verificationProvider,
    completionMode: currentQuest.completionMode,
    questType: currentQuest.questType,
  });
  const usesWebsiteVerification =
    currentQuest.questType === "url_visit" &&
    currentQuest.verificationProvider === "website" &&
    currentQuest.completionMode === "integration_auto";
  const usesDiscordVerification =
    currentQuest.questType === "discord_join" &&
    currentQuest.verificationProvider === "discord" &&
    currentQuest.completionMode === "integration_auto";
  const usesTelegramVerification =
    currentQuest.questType === "telegram_join" &&
    currentQuest.verificationProvider === "telegram" &&
    currentQuest.completionMode === "integration_auto";

  async function handleOpenTask() {
    if (!currentQuest.actionUrl) {
      Alert.alert("No destination yet", "This quest does not have a live destination configured.");
      return;
    }

    if (usesWebsiteVerification) {
      if (!session?.access_token) {
        Alert.alert("Sign in required", "Please sign in again before verifying this website quest.");
        return;
      }

      setOpeningTrackedTask(true);

      try {
        const response = await fetch(`${PORTAL_BASE_URL}/api/verify/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questId: currentQuest.id,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok || typeof payload?.targetUrl !== "string") {
          Alert.alert(
            "Verification failed",
            payload?.error || "Veltrix could not verify this website visit yet."
          );
          return;
        }

        approveQuestPrototype(currentQuest.id);
        setShowXP(true);

        const supportedTrackedTarget = await Linking.canOpenURL(payload.targetUrl);
        if (!supportedTrackedTarget) {
          Alert.alert("Cannot open link", "The verified destination could not be opened on your device.");
          return;
        }

        await Linking.openURL(payload.targetUrl);
        return;
      } catch (error) {
        Alert.alert(
          "Verification failed",
          error instanceof Error ? error.message : "Veltrix could not verify this website visit."
        );
        return;
      } finally {
        setOpeningTrackedTask(false);
      }
    }

    if (usesDiscordVerification) {
      if (!session?.access_token) {
        Alert.alert("Sign in required", "Please sign in again before verifying this Discord quest.");
        return;
      }

      setOpeningTrackedTask(true);

      try {
        const response = await fetch(`${PORTAL_BASE_URL}/api/verify/discord`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questId: currentQuest.id,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok || typeof payload?.targetUrl !== "string") {
          Alert.alert(
            "Discord verification blocked",
            payload?.error || "Veltrix could not start Discord membership verification yet."
          );
          return;
        }

        submitQuest(currentQuest.id, "discord_membership_requested");

        const supportedDiscordTarget = await Linking.canOpenURL(payload.targetUrl);
        if (!supportedDiscordTarget) {
          Alert.alert("Cannot open link", "The Discord invite could not be opened on your device.");
          return;
        }

        await Linking.openURL(payload.targetUrl);
        Alert.alert(
          "Discord verification started",
          payload?.message ||
            "Join the server now. Veltrix has queued the membership verification request."
        );
        return;
      } catch (error) {
        Alert.alert(
          "Discord verification failed",
          error instanceof Error ? error.message : "Veltrix could not start Discord verification."
        );
        return;
      } finally {
        setOpeningTrackedTask(false);
      }
    }

    if (usesTelegramVerification) {
      if (!session?.access_token) {
        Alert.alert("Sign in required", "Please sign in again before verifying this Telegram quest.");
        return;
      }

      setOpeningTrackedTask(true);

      try {
        const response = await fetch(`${PORTAL_BASE_URL}/api/verify/telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questId: currentQuest.id,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok || typeof payload?.targetUrl !== "string") {
          Alert.alert(
            "Telegram verification blocked",
            payload?.error || "Veltrix could not start Telegram membership verification yet."
          );
          return;
        }

        submitQuest(currentQuest.id, "telegram_membership_requested");

        const supportedTelegramTarget = await Linking.canOpenURL(payload.targetUrl);
        if (!supportedTelegramTarget) {
          Alert.alert("Cannot open link", "The Telegram group link could not be opened on your device.");
          return;
        }

        await Linking.openURL(payload.targetUrl);
        Alert.alert(
          "Telegram verification started",
          payload?.message ||
            "Join the Telegram group now. Veltrix has queued the membership verification request."
        );
        return;
      } catch (error) {
        Alert.alert(
          "Telegram verification failed",
          error instanceof Error ? error.message : "Veltrix could not start Telegram verification."
        );
        return;
      } finally {
        setOpeningTrackedTask(false);
      }
    }

    const supported = await Linking.canOpenURL(currentQuest.actionUrl);
    if (!supported) {
      Alert.alert("Cannot open link", "This destination could not be opened on your device.");
      return;
    }

    await Linking.openURL(currentQuest.actionUrl);
  }

  function handleSubmit() {
    if (usesWebsiteVerification) {
      Alert.alert(
        "Automatic verification",
        "This quest completes automatically after Veltrix confirms your website visit."
      );
      return;
    }

    if (liveStatus === "approved") {
      Alert.alert("Already approved", "This quest is already approved.");
      return;
    }

    if (currentQuest.proofRequired && currentQuest.proofType !== "none" && !proof.trim()) {
      Alert.alert("Proof required", "Please add your proof before submitting.");
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
          title: currentQuest.title,
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
          title="Execution"
          subtitle={
            usesWebsiteVerification
              ? "Open the tracked destination and let Veltrix confirm the visit automatically"
              : usesDiscordVerification
              ? "Join the Discord server and let Veltrix hold the quest until membership is confirmed"
              : usesTelegramVerification
              ? "Join the Telegram group and let Veltrix hold the quest until membership is confirmed"
              : "Understand the task, open the destination and then submit clean proof"
          }
        />
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>{getStatusLabel(liveStatus)}</Text>
          <Text style={styles.statusSub}>
            Action: {currentQuest.actionLabel || "Open Task"}
          </Text>
          <Text style={styles.statusSub}>
            Verification: {currentQuest.verificationType?.replace(/_/g, " ") || "manual review"}
          </Text>
          {currentQuest.verificationProvider ? (
            <Text style={styles.statusSub}>
              Provider: {currentQuest.verificationProvider.replace(/_/g, " ")}
            </Text>
          ) : null}
          <Text style={styles.statusSub}>{proofGuidance}</Text>
          {currentQuest.proofType === "wallet" || currentQuest.proofType === "tx_hash" ? (
            <Text style={styles.walletHint}>
              {walletConnected
                ? "Wallet context detected for this quest."
                : "Connect a wallet if this quest depends on onchain verification."}
            </Text>
          ) : null}
        </View>

        <PrimaryButton
          title={
            openingTrackedTask
              ? "Verifying Visit..."
              : currentQuest.actionUrl
              ? currentQuest.actionLabel || "Open Task"
              : "No Destination Yet"
          }
          onPress={handleOpenTask}
          disabled={!currentQuest.actionUrl || openingTrackedTask}
        />

        {!usesWebsiteVerification && !usesDiscordVerification && !usesTelegramVerification ? (
          <>
            <SectionTitle
              title="Proof / Notes"
              subtitle="Paste the clearest proof you can so review stays fast"
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
          </>
        ) : (
          <View style={styles.autoVerificationCard}>
            <Text style={styles.autoVerificationLabel}>
              {usesWebsiteVerification
                ? "Automatic website verification"
                : usesDiscordVerification
                ? "Automatic Discord verification"
                : "Automatic Telegram verification"}
            </Text>
            <Text style={styles.autoVerificationCopy}>
              {usesWebsiteVerification
                ? "Open the destination above. Once the tracked website signal lands, this quest can move forward without manual proof."
                : usesDiscordVerification
                ? "Open the Discord invite above. Veltrix will keep the quest in verification while the Discord membership check is pending."
                : "Open the Telegram group above. Veltrix will keep the quest in verification while the Telegram membership check is pending."}
            </Text>
          </View>
        )}

        {linkedCampaign ? (
          <>
            <SectionTitle
              title="Linked Campaign"
              subtitle="See how this quest contributes to the bigger mission"
            />
            <Pressable
              style={styles.linkCard}
              onPress={() => router.push(`/campaign/${linkedCampaign.id}`)}
            >
              <Text style={styles.linkTitle}>{linkedCampaign.title}</Text>
              <Text style={styles.linkMeta}>
                {linkedCampaign.progress}% complete • +{linkedCampaign.xp} XP
              </Text>
              <Text style={styles.linkDescription}>{linkedCampaign.description}</Text>
            </Pressable>
          </>
        ) : null}

        {linkedRewards.length > 0 ? (
          <>
            <SectionTitle
              title="What This Can Unlock"
              subtitle="Rewards connected to the same campaign loop"
            />
            {linkedRewards.map((reward) => (
              <Pressable
                key={reward.id}
                style={styles.rewardCard}
                onPress={() => router.push(`/reward/${reward.id}` as never)}
              >
                <View style={styles.rewardRow}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardCost}>{reward.cost} XP</Text>
                </View>
                <Text style={styles.rewardMeta}>
                  {reward.type} • {reward.rarity || "common"}
                </Text>
              </Pressable>
            ))}
          </>
        ) : null}

        {__DEV__ ? (
          <PrimaryButton
            title="Prototype Approve"
            variant="secondary"
            onPress={handlePrototypeApprove}
            disabled={liveStatus === "approved"}
          />
        ) : null}

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
    gap: 8,
  },
  statusLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  statusSub: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  walletHint: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  proofCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  autoVerificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 8,
  },
  autoVerificationLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  autoVerificationCopy: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    minHeight: 120,
    color: COLORS.text,
    textAlignVertical: "top",
    fontSize: 14,
  },
  linkCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  linkTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  linkMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  linkDescription: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  rewardCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  rewardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  rewardCost: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  rewardMeta: {
    color: COLORS.subtext,
    fontSize: 12,
    textTransform: "capitalize",
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
