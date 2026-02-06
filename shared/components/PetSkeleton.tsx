import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SkeletonPetCard = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={[styles.card]}>
      {/* Image Placeholder */}
      <Animated.View style={[styles.imageBox, { opacity }]} />

      <View style={styles.infoSection}>
        {/* Pet Name Line */}
        <Animated.View style={[styles.line, { width: "60%", opacity }]} />
        {/* Species Line */}
        <Animated.View
          style={[styles.line, { width: "40%", marginTop: 8, opacity }]}
        />
        {/* Age / Gender Line */}
        <Animated.View
          style={[styles.line, { width: "50%", marginTop: 8, opacity }]}
        />
        {/* Vaccines Line */}
        <Animated.View
          style={[styles.line, { width: "70%", marginTop: 8, opacity }]}
        />
      </View>
    </View>
  );
};

export default SkeletonPetCard;

const styles = StyleSheet.create({
  card: {
    // backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    padding: 10,
  },
  imageBox: {
    height: 200,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  infoSection: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
});
