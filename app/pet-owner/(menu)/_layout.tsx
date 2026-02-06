import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="add-pet" options={{ headerShown: false }} />
        <Stack.Screen name="edit-pet" options={{ headerShown: false }} />
        <Stack.Screen name="appointment" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="acc-settings" options={{ headerShown: false }} />
        <Stack.Screen name="manage-pet" options={{ headerShown: false }} />
        <Stack.Screen name="saved" options={{ headerShown: false }} />
        <Stack.Screen name="lost-found" options={{ headerShown: false }} />
        <Stack.Screen name="adapt" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="create-group" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-appointment"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="appointment-details"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
