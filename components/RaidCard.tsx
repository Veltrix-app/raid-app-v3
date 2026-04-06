import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { Raid } from "@/types";
import ProgressBar from "./ProgressBar";
import { useAppState } from "@/hooks/useAppState";

type Props = {
  item: Raid;
};

export default function RaidCard({ item }: Props) {
  const { confirmedRaidIds } = useAppState();
  const confirmed = confirmedRaidIds.includes(item.id);

  return (
    <Pressable
      style={[styles.card, confirmed && styles.cardConfirmed]}
      onPress={() => router.push(`/raid/${item.id}`)}
    >
      <ImageBackground
        source={{ uri: item.banner }}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerCommunity}>{item.community}</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          <View style={[styles.reward, confirmed && styles.rewardConfirmed]}>
            <Text style={[styles.rewardText, confirmed && styles.rewardTextConfirmed]}>
              {confirmed ? "Confirmed" : `+${item.reward} XP`}
            </Text>
          </View>
        </View>

        <Text style={styles.target}>{item.target}</Text>

        <ProgressBar progress={item.progress} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{item.participants} joined</Text>
          <Text style={styles.footerText}>{item.timer}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.25)",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  cardConfirmed: {
    borderColor: COLORS.success,
  },

  banner: {
    height: 128,
    justifyContent: "flex-end",
  },

  bannerImage: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },

  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.38)",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },

  bannerCommunity: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },

  header: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  reward: {
    backgroundColor: "rgba(198,255,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.30)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },

  rewardConfirmed: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  rewardText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  rewardTextConfirmed: {
    color: "#050507",
  },

  target: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
});