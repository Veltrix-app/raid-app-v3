import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import RaidCard from "@/components/RaidCard";
import LiveScreenState from "@/components/LiveScreenState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RaidsScreen() {
  const { raids, loading, error } = useLiveAppData();

  return (
    <Screen>
      <SectionTitle
        title="Raids"
        subtitle="Live raid feed from your backend"
      />

      <LiveScreenState loading={loading} error={error} />

      {!loading && !error && raids.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No live raids found.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {raids.map((item) => (
          <RaidCard
            key={item.id}
            item={{
              id: item.id,
              title: item.title,
              community: item.community,
              timer: item.status,
              reward: item.reward,
              participants: item.participants,
              progress: 0,
              target: "Live backend raid",
              instructions: [
                "This raid is now coming from Supabase",
                "Phase B will connect action flows and proof submission",
              ],
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