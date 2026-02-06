import { Colors } from "@/shared/colors/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const FriendRequestSkeleton = () => {
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
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.profilePic, { opacity }]} />
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.textLine, { width: "60%", opacity }]} />
        <Animated.View
          style={[styles.textLine, { width: "40%", opacity, marginTop: 6 }]}
        />

        <View style={styles.mutualRow}>
          <Animated.View style={[styles.mutualPic, { opacity }]} />
          <Animated.View
            style={[styles.mutualPic, { opacity, marginLeft: -10 }]}
          />
          <Animated.View
            style={[styles.mutualPic, { opacity, marginLeft: -10 }]}
          />
        </View>

        <View style={styles.actionsColumn}>
          <Animated.View style={[styles.button, { opacity }]} />
          <Animated.View style={[styles.button, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  mutualRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  mutualPic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
  },
  actionsColumn: {
    flexDirection: "row",
    marginTop: 15,
    gap: 8,
  },
  button: {
    height: 30,
    flex: 1,
    borderRadius: 6,
    backgroundColor: Colors.buttonlogin,
  },
});
