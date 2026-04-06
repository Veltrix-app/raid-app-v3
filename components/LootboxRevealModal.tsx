import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import PrimaryButton from "@/components/PrimaryButton";
import { Reward } from "@/types";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = {
  visible: boolean;
  reward: Reward | null;
  onClose: () => void;
};

export default function LootboxRevealModal({
  visible,
  reward,
  onClose,
}: Props) {
  if (!visible || !reward) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.label}>Lootbox Reveal</Text>
          <Text style={styles.title}>You unlocked</Text>

          <Image source={{ uri: reward.icon }} style={styles.icon} />
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          <Text style={styles.rewardMeta}>
            {reward.type} • {reward.rarity || "common"}
          </Text>
          <Text style={styles.rewardDesc}>{reward.description}</Text>

          <PrimaryButton title="Awesome" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,5,7,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.25)",
    alignItems: "center",
    gap: SPACING.md,
  },
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.card2,
  },
  rewardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  rewardMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  rewardDesc: {
    color: COLORS.subtext,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});