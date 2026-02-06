import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType } from "react-native";

import { HapticTab } from "@/components/haptic-tab";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/shared/colors/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const renderIcon = (
    focused: boolean,
    activeIcon: ImageSourcePropType,
    inactiveIcon: ImageSourcePropType
  ) => (
    <Image
      source={focused ? activeIcon : inactiveIcon}
      style={{
        width: 30,
        height: 30,
        tintColor: focused ? Colors.primary : "#C3C0C0", // 👈 active/inactive colors
     
      }}
      resizeMode="contain"
    />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          alignSelf: "center",

          backgroundColor: "#fff",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/home-fill.png"),
              require("../../../assets/Icons/home-outline.png")
            ),
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/chat-fill.png"),
              require("../../../assets/Icons/chat-outline.png")
            ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/notif-fill.png"),
              require("../../../assets/Icons/notif-outline.png")
            ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/menu-fill.png"),
              require("../../../assets/Icons/menu-outline.png")
            ),
        }}
      />
    </Tabs>
  );
}
