import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import CampaignCard from "@/components/CampaignCard";
import LiveScreenState from "@/components/LiveScreenState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function CampaignsScreen() {
  const { campaigns, loading, error } = useLiveAppData();

  return (
    <Screen>
      <SectionTitle
        title="Campaigns"
        subtitle="Live campaigns from your backend"
      />

      <LiveScreenState loading={loading} error={error} />

      {!loading && !error && campaigns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No live campaigns found.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {campaigns.map((item) => (
          <CampaignCard
            key={item.id}
            item={{
              id: item.id,
              title: item.title,
              description: item.description,
              xp: item.xp,
              deadline: item.status,
              progress: item.progress,
            }}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 40,
  },
  empty: {
    padding: 20,
  },
  emptyText: {
    color: "#94A3B8",
  },
});