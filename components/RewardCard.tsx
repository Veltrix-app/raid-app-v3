import React, { useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { RewardRarity } from "@/types";
import { useAppState } from "@/hooks/useAppState";
import { LiveReward } from "@/store/useLiveAppStore";

type Props = {
  item: LiveReward;
  onPress?: () => void;
};

function getRarityStyles(rarity: RewardRarity | undefined) {
  switch (rarity) {
    case "legendary":
      return {
        borderColor: "#FFC857",
        glowColor: "#FFC857",
        badgeBg: "rgba(255,200,87,0.14)",
        badgeBorder: "rgba(255,200,87,0.35)",
        textColor: "#FFC857",
      };
    case "epic":
      return {
        borderColor: "#B56CFF",
        glowColor: "#B56CFF",
        badgeBg: "rgba(181,108,255,0.14)",
        badgeBorder: "rgba(181,108,255,0.35)",
        textColor: "#D0A8FF",
      };
    case "rare":
      return {
        borderColor: "#59A5FF",
        glowColor: "#59A5FF",
        badgeBg: "rgba(89,165,255,0.14)",
        badgeBorder: "rgba(89,165,255,0.35)",
        textColor: "#8EC2FF",
      };
    default:
      return {
        borderColor: COLORS.border,
        glowColor: COLORS.primary,
        badgeBg: "rgba(198,255,0,0.12)",
        badgeBorder: "rgba(198,255,0,0.30)",
        textColor: COLORS.primary,
      };
  }
}

export default function RewardCard({ item, onPress }: Props) {
  const { claimedRewardIds, currentXp, isRewardUnlocked } = useAppState();

  const claimed = claimedRewardIds.includes(item.id);
  const unlocked = isRewardUnlocked(item.id);
  const affordable = currentXp >= item.cost;
  const claimable = unlocked && affordable && !claimed;

  const pulse = useRef(new Animated.Value(0.15)).current;
  const rarity = getRarityStyles(item.rarity);

  useEffect(() => {
    if (!claimable) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.34,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.15,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [claimable, pulse]);

  let label = "Locked";
  if (claimed) label = "Claimed";
  else if (claimable) label = "Claim";
  else if (unlocked && !affordable) label = "Need XP";

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          borderColor: claimable ? rarity.borderColor : COLORS.border,
          shadowColor: claimable ? rarity.glowColor : COLORS.primary,
          shadowOpacity: claimable ? pulse : 0.08,
        },
      ]}
    >
      <Pressable
        style={[styles.card, claimed && styles.cardClaimed]}
        onPress={
          onPress ||
          (() => router.push(`/reward/${item.id}` as never))
        }
      >
        <Image source={{ uri: item.icon }} style={styles.icon} />

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.meta}>
            {item.type} • {item.cost} XP
            {item.rarity ? ` • ${item.rarity}` : ""}
          </Text>

          <Text style={styles.description}>{item.description}</Text>

          {!affordable && unlocked && !claimed && (
            <Text style={styles.warning}>
              Need {item.cost - currentXp} more XP
            </Text>
          )}
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: rarity.badgeBg,
              borderColor: rarity.badgeBorder,
            },
            !unlocked && styles.badgeDisabled,
            unlocked && !affordable && styles.badgeDisabled,
            claimed && styles.badgeClaimed,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: rarity.textColor },
              claimed && styles.badgeTextClaimed,
            ]}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },

  cardClaimed: {
    borderColor: COLORS.success,
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.card2,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  meta: {
    color: COLORS.subtext,
    fontSize: 12,
    textTransform: "capitalize",
  },

  description: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  warning: {
    marginTop: 4,
    fontSize: 11,
    color: "#ffcc00",
    fontWeight: "700",
  },

  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },

  badgeDisabled: {
    backgroundColor: COLORS.card2,
    borderColor: COLORS.border,
  },

  badgeClaimed: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  badgeTextClaimed: {
    color: "#050507",
  },
});
