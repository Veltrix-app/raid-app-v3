import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = {
  title: string;
  xp: number;
  onDone?: () => void;
};

export default function CampaignCompleteToast({ title, xp, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => onDone?.());
  }, [title, xp, onDone, opacity, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ scale }] }]}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Campaign Completed</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <Text style={styles.reward}>+{xp} XP Bonus</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "28%",
    alignSelf: "center",
    zIndex: 999,
  },
  card: {
    minWidth: 260,
    backgroundColor: "rgba(5,5,7,0.96)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.45)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  title: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  reward: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
  },
});