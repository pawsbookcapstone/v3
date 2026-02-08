import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

import { useAppContext } from "@/AppsProvider";
import { HapticTab } from "@/components/haptic-tab";
import { db } from "@/helpers/firebase";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";

export default function TabLayout() {
  const { userId, isPage } = useAppContext();
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [focused, setFocused] = useState(true);


  useOnFocusHook(() => {
    setFocused(true)
    return () => setFocused(false)
  }, [])

  useEffect(() => {
    if (!userId || !focused) return;

    const q = query(collection(db, "friends"), 
      where("users", 'array-contains', userId), 
      where('confirmed', '==', false), 
      where("requested_by_id", "!=", userId),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.length;

      setHasPendingRequests(count > 0);
    });

    return () => unsubscribe();
  }, [userId, focused]);

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
      {showBadge && hasPendingRequests && (
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
              hasPendingRequests
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
