import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Splash from "../components/screen/SplashScreen";

export default function LoaderScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/Login"); // Navigate to start screen
    }, 100); // 2.5s delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Splash />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
