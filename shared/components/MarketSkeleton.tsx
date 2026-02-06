import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SkeletonMarketCard = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <Animated.View style={[styles.imageBox, { opacity }]} />

      <View style={styles.content}>
        {/* Title line */}
        <Animated.View style={[styles.line, { width: "70%", opacity }]} />
        {/* Price line */}
        <Animated.View
          style={[styles.line, { width: "40%", marginTop: 8, opacity }]}
        />
        {/* Description line */}
        <Animated.View
          style={[styles.line, { width: "90%", marginTop: 8, opacity }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    width: "48%",
    alignSelf: "flex-start",
  },
  imageBox: {
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  content: {
    padding: 8,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
});

export default SkeletonMarketCard;
