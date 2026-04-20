import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="user-profile" options={{ headerShown: false }} />
        <Stack.Screen name="pet-list" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="group-profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-group-event"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="edit-group-event"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="group-invite-friends"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="users-joined-events"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="group-events" options={{ headerShown: false }} />
        <Stack.Screen name="share-post" options={{ headerShown: false }} />
        <Stack.Screen name="post-lost" options={{ headerShown: false }} />
        <Stack.Screen name="post-adapt" options={{ headerShown: false }} />
        <Stack.Screen name="set-appointment" options={{ headerShown: false }} />
        <Stack.Screen name="success-screen" options={{ headerShown: false }} />
        <Stack.Screen name="page-profile" options={{ headerShown: false }} />
        <Stack.Screen name="manage-group" options={{ headerShown: false }} />
        <Stack.Screen
          name="anonymous-posting"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
