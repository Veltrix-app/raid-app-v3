import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rewards, campaigns, loading, error } = useLiveAppData();
  const { claimReward, claimedRewardIds, currentXp, isRewardUnlocked } = useAppState();

  const reward = useMemo(
    () => rewards.find((item) => item.id === (id || "")),
    [rewards, id]
  );

  if (!reward) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Reward not found.</Text>
      </Screen>
    );
  }

  const currentReward = reward;
  const linkedCampaign = currentReward.campaignId
    ? campaigns.find((campaign) => campaign.id === currentReward.campaignId)
    : null;
  const claimed = claimedRewardIds.includes(currentReward.id);
  const unlocked = isRewardUnlocked(currentReward.id);
  const affordable = currentXp >= currentReward.cost;
  const claimable = unlocked && affordable && !claimed;

  function handleClaim() {
    if (claimed) {
      Alert.alert("Already claimed", "You already claimed this reward.");
      return;
    }

    if (!unlocked) {
      Alert.alert(
        "Not unlocked yet",
        "Complete the linked campaign flow first to unlock this reward."
      );
      return;
    }

    if (!affordable) {
      Alert.alert(
        "Need more XP",
        `You need ${currentReward.cost - currentXp} more XP to claim this reward.`
      );
      return;
    }

    claimReward(currentReward.id);
    Alert.alert("Claim submitted", "Your reward claim has been sent for processing.");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentReward.title,
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Reward</Text>
          <Text style={styles.heroTitle}>{currentReward.title}</Text>
          <Text style={styles.heroDescription}>{currentReward.description}</Text>

          <View style={styles.statsRow}>
            <StatCard label="Cost" value={`${currentReward.cost} XP`} />
            <StatCard label="Type" value={currentReward.type} />
          </View>
        </View>

        <SectionTitle
          title="Claim Readiness"
          subtitle="What still stands between you and this reward"
        />
        <View style={styles.statusCard}>
          <StatusRow label="Unlocked" value={unlocked ? "Yes" : "No"} />
          <StatusRow label="Affordable" value={affordable ? "Yes" : "No"} />
          <StatusRow label="Claimed" value={claimed ? "Yes" : "No"} />
          <StatusRow label="Rarity" value={currentReward.rarity || "common"} />
        </View>

        {linkedCampaign ? (
          <>
            <SectionTitle
              title="Linked campaign"
              subtitle="This reward is tied to live campaign progression"
            />
            <Pressable
              style={styles.campaignCard}
              onPress={() => router.push(`/campaign/${linkedCampaign.id}`)}
            >
              <Text style={styles.campaignTitle}>{linkedCampaign.title}</Text>
              <Text style={styles.campaignMeta}>
                {linkedCampaign.progress}% complete • +{linkedCampaign.xp} XP
              </Text>
              <Text style={styles.campaignDescription}>{linkedCampaign.description}</Text>
            </Pressable>
          </>
        ) : null}

        <PrimaryButton
          title={claimed ? "Reward Claimed" : claimable ? "Claim Reward" : "Not Ready Yet"}
          onPress={handleClaim}
          disabled={!claimable}
        />
      </Screen>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
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
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  statCard: {
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
    marginTop: 4,
    textTransform: "capitalize",
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  statusLabel: {
    color: COLORS.subtext,
    fontSize: 13,
  },
  statusValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  campaignCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  campaignTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  campaignMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  campaignDescription: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
