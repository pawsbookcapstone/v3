import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SkeletonPost = () => {
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
    <View style={styles.skeletonCard}>
      {/* Profile row */}
      <View style={styles.row}>
        <Animated.View style={[styles.circle, { opacity }]} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Animated.View style={[styles.line, { width: "40%", opacity }]} />
          <Animated.View
            style={[styles.line, { width: "25%", marginTop: 5, opacity }]}
          />
        </View>
      </View>

      {/* Post content */}
      <Animated.View
        style={[styles.line, { width: "90%", marginTop: 15, opacity }]}
      />
      <Animated.View
        style={[styles.line, { width: "80%", marginTop: 8, opacity }]}
      />

      {/* Post image */}
      <Animated.View style={[styles.imageBox, { opacity }]} />

      {/* Actions row */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <Animated.View style={[styles.smallCircle, { opacity }]} />
        <Animated.View style={[styles.smallCircle, { opacity }]} />
        <Animated.View style={[styles.smallCircle, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  smallCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#E0E0E0",
    marginRight: 15,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  imageBox: {
    height: 150,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    marginTop: 15,
  },
});

export default SkeletonPost;
