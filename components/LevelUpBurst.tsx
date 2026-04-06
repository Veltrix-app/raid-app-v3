import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = {
  level: number;
  onDone?: () => void;
};

export default function LevelUpBurst({ level, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.75)).current;
  const translateY = useRef(new Animated.Value(12)).current;

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
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDone?.();
    });
  }, [level, onDone, opacity, scale, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.title}>LEVEL UP</Text>
        <Text style={styles.level}>Level {level}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: "32%",
    alignSelf: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: "rgba(5,5,7,0.96)",
    borderWidth: 1,
    borderColor: "rgba(198,255,0,0.5)",
    borderRadius: 26,
    paddingHorizontal: 26,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },
  level: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
});