import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

import { useAppContext } from "@/AppsProvider";
import { HapticTab } from "@/components/haptic-tab";
import { db } from "@/helpers/firebase";
import { Colors } from "@/shared/colors/Colors";
import { collection, onSnapshot } from "firebase/firestore";

export default function TabLayout() {
  const { userId, isPage } = useAppContext();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const q = collection(db, "friends");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.filter((doc) => {
        const d = doc.data();
        return (
          !d.confirmed &&
          d.users.includes(userId) &&
          d.users[1] === userId
        );
      }).length;

      setPendingRequests(count);
    });

    return () => unsubscribe();
  }, [userId]);

  const renderIcon = (
    focused: boolean,
    activeIcon: ImageSourcePropType,
    inactiveIcon: ImageSourcePropType,
    showBadge?: boolean
  ) => (
    <View style={{ width: 30, height: 30 }}>
      <Image
        source={focused ? activeIcon : inactiveIcon}
        style={{
          width: 30,
          height: 30,
          tintColor: focused ? Colors.primary : "#C3C0C0",
        }}
        resizeMode="contain"
      />
      {showBadge && pendingRequests > 0 && (
        <View
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "red",
          }}
        />
      )}
    </View>
  );

  // Prevent flicker while role is loading
  if (isPage === undefined) return null;

  return (
    <Tabs
      screenOptions={{
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
        name="market-place"
        options={{
          title: "Market",
          href: isPage ? null : undefined, // ✅ HIDE TAB SAFELY
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/store-fill.png"),
              require("../../../assets/Icons/store-outline.png")
            ),
        }}
      />

      <Tabs.Screen
        name="add-friend"
        options={{
          title: "Friends",
          href: isPage ? null : undefined, // ✅ HIDE TAB SAFELY
          tabBarIcon: ({ focused }) =>
            renderIcon(
              focused,
              require("../../../assets/Icons/friend-fill.png"),
              require("../../../assets/Icons/friend-outline.png"),
              pendingRequests > 0
            ),
        }}
      />

      <Tabs.Screen
        name="chat"
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
