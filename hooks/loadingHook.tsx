import { Loader2 } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

const test = async () => {
  return await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 4000); // 4000ms = 4 seconds
  });
}

export function useLoadingHook(showError?: boolean) {
  const [loading, setLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // 🔄 handle animation lifecycle
  useEffect(() => {
    if (loading) {
      animationRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      spinValue.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [loading, spinValue]);

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
    }: {
      style?: any;
      onPress?: () => void | Promise<any>;
      children: React.ReactNode;
      hideLoadingText?: boolean;
      loadingText?: string;
      loadingTextStyle?: any;
      disabled?: boolean;
    }) => {
      const process = async () => {
        if (loading) return;

        try {
          setLoading(true);
          if (onPress)
            await onPress();
          else await test()
        } catch (e: any) {
          if (!showError) return
          
          if (Platform.OS === "android") {
            ToastAndroid.showWithGravity(
              e ?? "Something went wrong",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM
            );
          }
          else {
            Alert.alert("Error", e ?? "Something went wrong")
          }
        } finally {
          setLoading(false);
        }
      };

      return (
        <Pressable
          onPress={process}
          disabled={loading || disabled}
          style={[style, loading && styles.disabled]}
        >
          {loading ? (
            <View style={styles.content}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Loader2 size={18} color="#fff" />
              </Animated.View>
              {!hideLoadingText && <Text style={[styles.buttonText, loadingTextStyle]}>{loadingText ?? 'Please wait...'}</Text>}
            </View>
          ) : (
            children
          )}
        </Pressable>
      );
    },
    [loading, rotate, showError]
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
