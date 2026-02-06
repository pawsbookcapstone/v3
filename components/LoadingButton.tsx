import { Loader2 } from "lucide-react-native";

import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useEffect, useRef } from "react";

type LoadingButtonProps = {
  title: string;
  loading: boolean;
  onPress: () => void;
  style?: any;
  textStyle?: any;
};

export const LoadingButton = ({
  title,
  loading,
  onPress,
  style,
  textStyle,
}: LoadingButtonProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [loading]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[styles.buttonContainer, style, loading && styles.disabled]}
    >
      <View style={styles.content}>
        {loading && (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Loader2 size={18} color="#fff" />
          </Animated.View>
        )}
        <Text style={[styles.buttonText, textStyle]}>
          {loading ? "Please wait..." : title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
