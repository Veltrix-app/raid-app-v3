import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import ProgressBar from "@/components/ProgressBar";
import SearchInput from "@/components/SearchInput";
import FilterChip from "@/components/FilterChip";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useLiveAppData } from "@/hooks/useLiveAppData";

type CampaignFilter = "all" | "active" | "high-xp";

export default function CampaignsScreen() {
  const { campaigns, communities, loading, error } = useLiveAppData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CampaignFilter>("all");

  const filteredCampaigns = useMemo(() => {
    let items = campaigns;

    if (query.trim()) {
      items = items.filter((campaign) =>
        campaign.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filter === "active") {
      items = items.filter((campaign) => campaign.progress < 100);
    }

    if (filter === "high-xp") {
      items = items.filter((campaign) => campaign.xp >= 500);
    }

    return items;
  }, [campaigns, query, filter]);

  return (
    <Screen>
      <SectionTitle title="Campaigns" subtitle="Browse active missions and quests" />

      <LiveScreenState loading={loading} error={error} />

      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search campaigns..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterChip label="Active" active={filter === "active"} onPress={() => setFilter("active")} />
          <FilterChip label="High XP" active={filter === "high-xp"} onPress={() => setFilter("high-xp")} />
        </View>
      </ScrollView>

      {filteredCampaigns.map((campaign) => {
        const community = communities.find((c) => c.id === campaign.communityId);

        return (
          <Pressable
            key={campaign.id}
            style={styles.card}
            onPress={() => router.push(`/campaign/${campaign.id}`)}
          >
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{campaign.title}</Text>
                <Text style={styles.meta}>
                  {community?.name || "Project"} • {campaign.deadline || "active"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>+{campaign.xp} XP</Text>
              </View>
            </View>

            <Text style={styles.description}>{campaign.description}</Text>
            <ProgressBar progress={campaign.progress} />
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  header: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: COLORS.card2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },
});