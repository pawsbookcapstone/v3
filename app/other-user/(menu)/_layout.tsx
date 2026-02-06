import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="connections" options={{ headerShown: false }} />
        <Stack.Screen name="appointment" options={{ headerShown: false }} />
        <Stack.Screen
          name="appointment-details"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
