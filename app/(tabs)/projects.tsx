import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import SearchInput from "@/components/SearchInput";
import FilterChip from "@/components/FilterChip";
import CommunityCard from "@/components/CommunityCard";
import LiveScreenState from "@/components/LiveScreenState";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useLiveAppData } from "@/hooks/useLiveAppData";

type ProjectFilter = "all" | "featured" | "joined";

export default function ProjectsScreen() {
  const {
    communities,
    campaigns,
    discoveredCommunities,
    canonicalJoinedCommunities,
    loading,
    error,
  } = useLiveAppData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const featuredProjects = useMemo(
    () =>
      communities.filter((community) =>
        campaigns.some(
          (campaign) => campaign.communityId === community.id && campaign.featured
        )
      ),
    [campaigns, communities]
  );

  const orderedProjects = useMemo(() => {
    const discoveryOrder = new Map(
      discoveredCommunities.map((community, index) => [community.id, index])
    );

    return [...communities].sort((a, b) => {
      const aIndex = discoveryOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bIndex = discoveryOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [communities, discoveredCommunities]);

  const filteredProjects = useMemo(() => {
    let items = orderedProjects;

    if (query.trim()) {
      const lower = query.toLowerCase();
      items = items.filter((project) =>
        [project.name, project.description, project.chain, project.category]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(lower))
      );
    }

    if (filter === "featured") {
      const featuredIds = new Set(featuredProjects.map((project) => project.id));
      items = items.filter((project) => featuredIds.has(project.id));
    }

    if (filter === "joined") {
      items = items.filter((project) => canonicalJoinedCommunities.includes(project.id));
    }

    return items;
  }, [canonicalJoinedCommunities, featuredProjects, filter, orderedProjects, query]);

  const topProject = filteredProjects[0] ?? communities[0] ?? null;
  const topProjectCampaignCount = campaigns.filter(
    (campaign) => campaign.communityId === topProject?.id
  ).length;

  return (
    <Screen>
      <SectionTitle
        title="Projects"
        subtitle="Explore public project profiles, brand stories and live campaign ecosystems"
      />

      <LiveScreenState loading={loading} error={error} />

      {topProject ? (
        <Pressable
          style={styles.hero}
          onPress={() =>
            router.push({
              pathname: "/project/[id]",
              params: { id: topProject.id },
            })
          }
        >
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Public profile spotlight</Text>
          <Text style={styles.heroTitle}>{topProject.name}</Text>
          <Text style={styles.heroText}>
            {topProject.longDescription || topProject.description}
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Members</Text>
              <Text style={styles.heroStatValue}>{topProject.members.toLocaleString()}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Campaigns</Text>
              <Text style={styles.heroStatValue}>{topProjectCampaignCount}</Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search projects..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterChip
            label="Featured"
            active={filter === "featured"}
            onPress={() => setFilter("featured")}
          />
          <FilterChip
            label="Joined"
            active={filter === "joined"}
            onPress={() => setFilter("joined")}
          />
        </View>
      </ScrollView>

      {filteredProjects.map((project) => (
        <CommunityCard key={project.id} item={project} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.20)",
    overflow: "hidden",
    gap: SPACING.md,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    right: -36,
    top: -18,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(198,255,0,0.12)",
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
    fontSize: 28,
    fontWeight: "800",
  },
  heroText: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  heroStat: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    padding: SPACING.md,
  },
  heroStatLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  heroStatValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  filters: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
});
