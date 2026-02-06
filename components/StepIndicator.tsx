import { Colors } from "@/shared/colors/Colors";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface StepIndicatorProps {
  step: number;
  steps: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, steps }) => {
  const [animatedWidths, setAnimatedWidths] = useState<Animated.Value[]>([]);

  // Recreate animated values whenever steps change
  useEffect(() => {
    setAnimatedWidths(steps.map(() => new Animated.Value(7)));
  }, [steps]);

  // Animate whenever the current step changes
  useEffect(() => {
    steps.forEach((s, i) => {
      if (!animatedWidths[i]) return;
      Animated.timing(animatedWidths[i], {
        toValue: step === s ? 43 : 7,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [step, steps, animatedWidths]);

  return (
    <View style={styles.container}>
      {steps.map((s, i) => (
        <Animated.View
          key={s}
          style={[
            styles.indicator,
            {
              width: animatedWidths[i] || 7,
              backgroundColor: step === s ? Colors.primary : "#ccc",
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  indicator: {
    height: 7,
    borderRadius: 10,
    marginHorizontal: 5,
  },
});

export default StepIndicator;
