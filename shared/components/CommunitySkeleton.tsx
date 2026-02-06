// path: shared/components/CommunitySkeleton.tsx
import { Colors } from "@/shared/colors/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const CommunitySkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  // Smooth shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, i) => (
        <Animated.View key={i} style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.imagePlaceholder} />
          <View style={styles.textContainer}>
            <View style={styles.titlePlaceholder} />
            <View style={styles.subtitlePlaceholder} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e3e3e3",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titlePlaceholder: {
    width: "70%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e3e3e3",
    marginBottom: 6,
  },
  subtitlePlaceholder: {
    width: "40%",
    height: 10,
    borderRadius: 6,
    backgroundColor: "#e3e3e3",
  },
});
