import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="block-list" options={{ headerShown: false }} />
        <Stack.Screen name="sample-reset" options={{ headerShown: false }} />
        <Stack.Screen
          name="privacy-settings"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
