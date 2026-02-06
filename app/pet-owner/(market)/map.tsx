import MapScreen from "@/components/Map";
import { screens } from "@/shared/styles/styles";
import React from "react";
import { View } from "react-native";

export default function App() {
  return (
    <View style={screens.screen}>
      <MapScreen />
    </View>
  );
}
