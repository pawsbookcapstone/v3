import { screens } from "@/shared/styles/styles";
import LottieView from "lottie-react-native";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

const SplashScreen = () => {
  return (
    <View
      style={[
        screens.screen,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/images/logo/PawsBook.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Lottie Animation */}
      <LottieView
        source={require("../../assets/animations/pawsbook.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
    alignSelf: "center",
  },
  animation: {
    width: "100%",
    height: "40%",
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
  },
});
