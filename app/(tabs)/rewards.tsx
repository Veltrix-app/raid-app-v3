import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import RewardCard from "@/components/RewardCard";
import LiveScreenState from "@/components/LiveScreenState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RewardsScreen() {
  const { rewards, loading, error } = useLiveAppData();

  return (
    <Screen>
      <SectionTitle
        title="Rewards"
        subtitle="Live rewards from your backend"
      />

      <LiveScreenState loading={loading} error={error} />

      {!loading && !error && rewards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No live rewards found.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {rewards.map((item) => (
          <RewardCard
            key={item.id}
            item={{
              id: item.id,
              title: item.title,
              description: item.description,
              cost: item.cost,
              type: item.type as any,
              claimable: false,
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