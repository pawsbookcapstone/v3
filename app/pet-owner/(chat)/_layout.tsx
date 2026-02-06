import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="chat-field" options={{ headerShown: false }} />
        <Stack.Screen name="search-users" options={{ headerShown: false }} />
        <Stack.Screen name="group-chat" options={{ headerShown: false }} />
        <Stack.Screen name="create-gc" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
