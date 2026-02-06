import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const NotificationSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.item}>
      {/* Avatar */}
      <Animated.View style={[styles.avatar, { opacity }]} />

      {/* Text lines */}
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.line, { width: "50%", opacity }]} />
        <Animated.View style={[styles.line, { width: "80%", opacity }]} />
      </View>

      {/* Time placeholder */}
      <Animated.View style={[styles.time, { opacity }]} />
    </View>
  );
};

export default NotificationSkeleton;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  line: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginVertical: 4,
  },
  time: {
    width: 30,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
    marginLeft: 10,
  },
});
