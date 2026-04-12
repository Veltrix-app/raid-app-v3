import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import NotificationCard from "@/components/NotificationCard";

import { COLORS } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

export default function NotificationsScreen() {
  const { notificationsFeed, markNotificationsRead } = useAppState();
  const unreadItems = notificationsFeed.filter((item) => !item.read).length;
  const questUpdates = notificationsFeed.filter((item) => item.type === "quest").length;
  const rewardUpdates = notificationsFeed.filter((item) => item.type === "reward").length;

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <SectionTitle
          title="Activity Feed"
          subtitle="Everything happening around your account"
        />

        <View style={styles.summaryRow}>
          <SummaryCard label="Unread on open" value={String(unreadItems)} />
          <SummaryCard label="Quest updates" value={String(questUpdates)} />
          <SummaryCard label="Reward updates" value={String(rewardUpdates)} />
        </View>

        {notificationsFeed.length > 0 ? (
          notificationsFeed.map((item) => <NotificationCard key={item.id} item={item} />)
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              New quest approvals, raids, badges and rewards will appear here.
            </Text>
          </View>
        )}
      </Screen>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  summaryLabel: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  empty: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
