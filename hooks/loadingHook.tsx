import { Loader2 } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ToastAndroid,
  View,
} from "react-native";

const test = async () => {
  return await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 4000); // 4000ms = 4 seconds
  });
};

export function useLoadingHook(showError?: boolean) {
  const [loading, setLoading] = useState(false);
  const [loadingByKey, setLoadingByKey] = useState<{ [key: string]: boolean }>(
    {},
  );
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // 🔄 handle animation lifecycle
  useEffect(() => {
    if (loading || Object.values(loadingByKey).some((f) => f)) {
      if (!(loading && Object.values(loadingByKey).some((f) => f))) {
        animationRef.current = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        );
        animationRef.current.start();
      }
    } else {
      animationRef.current?.stop();
      spinValue.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [loading, loadingByKey, spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderLoadingButton = useCallback(
    ({
      style,
      onPress,
      children,
      disabled,
      hideLoadingText,
      loadingText,
      loadingTextStyle,
      spinnerSize,
      spinnerColor,
      key,
    }: {
      style?: any;
      onPress?: () => void | Promise<any>;
      children: React.ReactNode;
      hideLoadingText?: boolean;
      loadingText?: string;
      loadingTextStyle?: StyleProp<TextStyle>;
      spinnerSize?: number;
      spinnerColor?: string;
      disabled?: boolean;
      key?: string;
    }) => {
      const isLoading = key ? (loadingByKey[key] ?? false) : loading;

      const process = async () => {
        if (isLoading) return;

        try {
          if (key) setLoadingByKey((prev) => ({ ...prev, [key]: true }));
          else setLoading(true);
          if (onPress) await onPress();
          else await test();
        } catch (e: any) {
          if (!showError) return;

          if (Platform.OS === "android") {
            ToastAndroid.showWithGravity(
              e ?? "Something went wrong",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
            );
          } else {
            Alert.alert("Error", e ?? "Something went wrong");
          }
        } finally {
          if (key) setLoadingByKey((prev) => ({ ...prev, [key]: false }));
          else setLoading(false);
        }
      };

      return (
        <Pressable
          onPress={process}
          disabled={isLoading || disabled}
          style={[style, isLoading && styles.disabled]}
        >
          {isLoading ? (
            <View style={styles.content}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Loader2
                  size={spinnerSize ?? 18}
                  color={spinnerColor ?? "#fff"}
                />
              </Animated.View>
              {!hideLoadingText && (
                <Text style={[styles.buttonText, loadingTextStyle]}>
                  {loadingText ?? "Please wait..."}
                </Text>
              )}
            </View>
          ) : (
            children
          )}
        </Pressable>
      );
    },
    [loading, loadingByKey, rotate, showError],
  );

  return renderLoadingButton;
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
