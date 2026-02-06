import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleBack}>
        <MaterialIcons
          name="arrow-back-ios"
          size={24}
          color="black"
          style={{ position: "absolute", marginTop: 38 }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;
