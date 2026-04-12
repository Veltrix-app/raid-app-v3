import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import LeaderboardRow from "@/components/LeaderboardRow";
import LiveScreenState from "@/components/LiveScreenState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

type LeaderboardUser = {
  id: string;
  username: string;
  xp: number;
  level: number;
  banner?: string;
  isCurrentUser?: boolean;
};

export default function LeaderboardScreen() {
  const { leaderboard, loading, error } = useLiveAppData();

  return (
    <Screen>
      <SectionTitle
        title="Leaderboard"
        subtitle="Top raiders from live backend data"
      />

      <LiveScreenState loading={loading} error={error} />

      {!loading && !error && leaderboard.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No leaderboard users found.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {leaderboard.map((item: LeaderboardUser, index: number) => (
          <LeaderboardRow
            key={item.id}
            rank={index + 1}
            username={item.username}
            xp={item.xp}
            isCurrentUser={!!item.isCurrentUser}
            title={`Level ${item.level}`}
            banner={item.banner}
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