import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import LeaderboardRow from "@/components/LeaderboardRow";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { joinedCommunityIds, joinCommunity } = useAppState();
  const { communities, campaigns, leaderboard, loading, error } = useLiveAppData();

  const community = communities.find((item) => item.id === (id || ""));
  const communityCampaigns = useMemo(
    () => campaigns.filter((item) => item.communityId === (id || "")),
    [campaigns, id]
  );

  if (!community) {
    return (
      <Screen>
        <LiveScreenState loading={loading} error={error} />
        <Text style={styles.notFound}>Community not found.</Text>
      </Screen>
    );
  }

  const currentCommunity = community;
  const joined = joinedCommunityIds.includes(currentCommunity.id);
  const communityLeaders = leaderboard.map((item, index) => ({
    ...item,
    rank: index + 1,
    title: `Level ${item.level}`,
  }));

  function handleJoin() {
    joinCommunity(currentCommunity.id);
    Alert.alert(joined ? "Community left" : "Community joined");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: community.name,
          headerShown: true,
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.bg },
        }}
      />

      <Screen>
        <LiveScreenState loading={loading} error={error} />

        <View style={styles.hero}>
          <Text style={styles.name}>{currentCommunity.name}</Text>
          <Text style={styles.meta}>{currentCommunity.members.toLocaleString()} members</Text>
          <Text style={styles.desc}>{currentCommunity.description}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Reward pool</Text>
              <Text style={styles.statValue}>{currentCommunity.rewardPool}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{joined ? "Joined" : "Explore"}</Text>
            </View>
          </View>

          <PrimaryButton
            title={joined ? "Leave community" : "Join community"}
            onPress={handleJoin}
          />
        </View>

        <SectionTitle
          title="Active campaigns"
          subtitle="Tap a campaign to open the mission details"
        />

        {communityCampaigns.map((campaign) => (
          <Pressable
            key={campaign.id}
            style={styles.campaignCard}
            onPress={() => router.push(`/campaign/${campaign.id}`)}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <Text style={styles.campaignMeta}>{campaign.deadline}</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>+{campaign.xp} XP</Text>
              </View>
            </View>

            <Text style={styles.campaignDesc}>{campaign.description}</Text>
            <ProgressBar progress={campaign.progress} />
          </Pressable>
        ))}

        <SectionTitle
          title="Community leaderboard"
          subtitle="Top contributors inside this community"
        />

        {communityLeaders.map((item) => (
          <LeaderboardRow
            key={item.id}
            rank={item.rank}
            username={item.username}
            xp={item.xp}
            isCurrentUser={item.isCurrentUser}
            title={item.title}
            banner={item.banner}
          />
        ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 13,
  },
  desc: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  stats: {
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
    fontWeight: "700",
    marginTop: 6,
  },
  campaignCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  campaignTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  campaignMeta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  campaignDesc: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "rgba(198,255,0,0.12)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.30)",
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  notFound: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
