import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const accSettings = () => {
  const settingsOptions = [
    // {
    //   id: 1,
    //   title: "Edit Profile",
    //   icon: (
    //     <Ionicons
    //       name="person-circle-outline"
    //       size={22}
    //       color={Colors.primary}
    //     />
    //   ),
    //   // onPress: () => router.push("/profile/edit"),
    // },
    {
      id: 2,
      title: "Change Password",
      icon: (
        <Ionicons name="lock-closed-outline" size={22} color={Colors.primary} />
      ),

      onPress: () => router.push("/(account-settings)/change-password"),
    },
    // {
    //   id: 3,
    //   title: "Notification Preferences",
    //   icon: (
    //     <Ionicons
    //       name="notifications-outline"
    //       size={22}
    //       color={Colors.primary}
    //     />
    //   ),
    //   // onPress: () => router.push("/account/notifications"),
    // },
    {
      id: 4,
      title: "Privacy Settings",
      icon: (
        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color={Colors.primary}
        />
      ),
      onPress: () => router.push("/(account-settings)/privacy-settings"),
    },
    {
      id: 5,
      title: "Help & Support",
      icon: (
        <MaterialIcons name="help-outline" size={22} color={Colors.primary} />
      ),
      onPress: () => router.push("/(account-settings)/help"),
    },
  ];

  return (
    <View style={[screens.screen, { backgroundColor: "#fff" }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Account Settings"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      <ScrollView contentContainerStyle={styles.container}>
        {settingsOptions.map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={item.onPress}>
            <View style={styles.iconBox}>{item.icon}</View>
            <Text style={styles.text}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
        ))}

        {/* <View style={styles.divider} />

        <Pressable
          style={styles.logoutButton}
          onPress={() => console.log("Logout")}
        >
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={[styles.text, { color: "red" }]}>Log Out</Text>
        </Pressable> */}
      </ScrollView>
    </View>
  );
};

export default accSettings;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  iconBox: {
    width: 35,
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Roboto",
    color: "#222",
  },
  divider: {
    height: 10,
    backgroundColor: "#f4f4f4",
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
});
