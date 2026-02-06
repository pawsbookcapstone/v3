import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="post" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
