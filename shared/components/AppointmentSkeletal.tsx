import { Colors } from "@/shared/colors/Colors";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

const SkeletonLoader: React.FC<{
  width?: string | number;
  height?: number;
  style?: any;
}> = ({ width = "100%", height = 20, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#f0f0f0"],
  });

  return (
    <Animated.View
      style={[{ width, height, borderRadius: 8, backgroundColor }, style]}
    />
  );
};

export const AppointmentSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <SkeletonLoader width={50} height={50} style={{ borderRadius: 25 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
      </View>

      <SkeletonLoader width="80%" height={14} style={{ marginBottom: 6 }} />
      <SkeletonLoader width="50%" height={14} style={{ marginBottom: 6 }} />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12, alignSelf: 'flex-end' }}>
        <SkeletonLoader width={80} height={30} style={{ borderRadius: 25 }} />
        <SkeletonLoader width={100} height={30} style={{ borderRadius: 25 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default SkeletonLoader;
