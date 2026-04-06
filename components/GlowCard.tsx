import React, { ReactNode, useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
  children: ReactNode;
};

export default function GlowCard({ children }: Props) {
  const glow = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.38,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0.18,
          duration: 1400,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [glow]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          shadowOpacity: glow,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});