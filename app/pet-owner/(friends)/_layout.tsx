import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="suggestions" options={{ headerShown: false }} />
        <Stack.Screen name="my-friends" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
