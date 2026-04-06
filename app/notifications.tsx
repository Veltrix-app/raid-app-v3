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

        {notificationsFeed.length > 0 ? (
          notificationsFeed.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))
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

const styles = StyleSheet.create({
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