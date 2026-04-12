import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import SearchInput from "@/components/SearchInput";
import FilterChip from "@/components/FilterChip";
import RewardCard from "@/components/RewardCard";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

type RewardFilter = "all" | "claimable" | "high-value";

export default function RewardsScreen() {
  const { rewards, campaigns, loading, error } = useLiveAppData();
  const { claimedRewardIds, currentXp, isRewardUnlocked } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RewardFilter>("all");

  const filteredRewards = useMemo(() => {
    let items = rewards;

    if (query.trim()) {
      const normalized = query.toLowerCase();
      items = items.filter(
        (reward) =>
          reward.title.toLowerCase().includes(normalized) ||
          reward.description.toLowerCase().includes(normalized) ||
          reward.type.toLowerCase().includes(normalized)
      );
    }

    if (filter === "claimable") {
      items = items.filter(
        (reward) =>
          isRewardUnlocked(reward.id) &&
          currentXp >= reward.cost &&
          !claimedRewardIds.includes(reward.id)
      );
    }

    if (filter === "high-value") {
      items = items.filter((reward) => reward.cost >= 500);
    }

    return items.sort((a, b) => {
      const aClaimable =
        isRewardUnlocked(a.id) && currentXp >= a.cost && !claimedRewardIds.includes(a.id);
      const bClaimable =
        isRewardUnlocked(b.id) && currentXp >= b.cost && !claimedRewardIds.includes(b.id);

      return Number(bClaimable) - Number(aClaimable) || b.cost - a.cost;
    });
  }, [rewards, query, filter, isRewardUnlocked, currentXp, claimedRewardIds]);

  const claimableCount = rewards.filter(
    (reward) =>
      isRewardUnlocked(reward.id) &&
      currentXp >= reward.cost &&
      !claimedRewardIds.includes(reward.id)
  ).length;
  const linkedCampaignCount = rewards.filter((reward) => reward.campaignId).length;

  return (
    <Screen>
      <SectionTitle
        title="Rewards"
        subtitle="Track what is unlocked, what is close, and what is worth pushing for next"
      />

      <LiveScreenState loading={loading} error={error} />

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Reward Readiness</Text>
        <Text style={styles.heroValue}>{claimableCount}</Text>
        <Text style={styles.heroSub}>
          rewards are claim-ready right now. {linkedCampaignCount} rewards are already tied to live
          campaigns.
        </Text>
      </View>

      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search rewards..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterChip
            label="Claimable"
            active={filter === "claimable"}
            onPress={() => setFilter("claimable")}
          />
          <FilterChip
            label="High Value"
            active={filter === "high-value"}
            onPress={() => setFilter("high-value")}
          />
        </View>
      </ScrollView>

      {filteredRewards.map((item) => {
        const linkedCampaign = item.campaignId
          ? campaigns.find((campaign) => campaign.id === item.campaignId)
          : null;

        return (
          <View key={item.id} style={styles.rewardWrap}>
            <RewardCard item={item} />
            {linkedCampaign ? (
              <Text style={styles.linkedCampaignText}>
                Linked to {linkedCampaign.title}
              </Text>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 8,
  },
  heroLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "800",
  },
  heroSub: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  filters: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  rewardWrap: {
    gap: 8,
  },
  linkedCampaignText: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
});
