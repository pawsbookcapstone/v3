// app/_layout.tsx
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { AppsProvider } from "@/AppsProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StatusBar } from "react-native";
import Splash from "../components/screen/SplashScreen";

// Prevent auto-hide until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Sans: require("../assets/fonts/InriaSans-Regular.ttf"),
    SansBold: require("../assets/fonts/InriaSans-Bold.ttf"),
    Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoMedium: require("../assets/fonts/Roboto-Medium.ttf"),
    RobotoSemiBold: require("../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
  });

  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded) {
        await SplashScreen.hideAsync();
        // keep splash visible for a moment
        setTimeout(() => setAppReady(true), 100);
      }
    };
    prepareApp();
  }, [loaded]);

  useEffect(() => {
    if (appReady) {
      router.replace("/auth/Login");
      // router.replace("/pet-owner/(tabs)/home");
    }
  }, [appReady]);

  if (!appReady) {
    return <Splash />;
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <NavigationRoot />
    </>
  );
}

function NavigationRoot() {
  return (
    <AppsProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="StartScreen" />

        {/* pet-owner */}
        <Stack.Screen name="pet-owner/(home)" />
        <Stack.Screen name="pet-owner/(market)" />
        <Stack.Screen name="pet-owner/(friends)" />
        <Stack.Screen name="pet-owner/(chat)" />
        <Stack.Screen name="pet-owner/(menu)" />

        {/* pet-user */}
        <Stack.Screen name="other-user/(tabs)" />
        <Stack.Screen name="other-user/(menu)" />

        {/* reusable */}
        <Stack.Screen name="(account-settings)" />
        <Stack.Screen name="(create-profile)" />
        <Stack.Screen name="usable" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </AppsProvider>
  );
}
