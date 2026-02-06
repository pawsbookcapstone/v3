import CreateProfileModal from "@/components/modals/CreateProfileModal";
import LogoutModal from "@/components/modals/LogoutModal";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const myProfileImage = {
  profile: "https://randomuser.me/api/portraits/women/44.jpg",
  name: "Jane Smith",
};

const profile = () => {
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isCreateProfileModalVisible, setCreateProfileModalVisible] =
    useState(false);

  const handleLogout = () => {
    router.replace("/auth/Login");
    console.log("Logged out");
    setLogoutModalVisible(false);
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <HeaderLayout withLogo noBorderRadius height={90}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </HeaderLayout>

      <View style={styles.profileConatiner}>
        <View style={styles.row}>
          <Pressable
            style={styles.row}
            onPress={() => {
              const routePath = "/other-user/profile";

              router.push({
                pathname: routePath,
                params: {
                  profile: myProfileImage.profile,
                  name: myProfileImage.name,
                },
              });
            }}
          >
            <View style={styles.avatar}>
              <Image
                source={{ uri: myProfileImage.profile }}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.name}>{myProfileImage.name}</Text>
          </Pressable>

          <Pressable
            style={styles.addProfile}
            onPress={() => setCreateProfileModalVisible(true)}
          >
            <MaterialIcons name="keyboard-arrow-down" size={30} color="#000" />
          </Pressable>
        </View>
      </View>

      <View style={styles.actionButtonsWrapper}>
        <Link href="/other-user/connections" asChild>
          <Pressable style={styles.actionButton}>
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: "rgba(0, 255, 64, 0.3)" },
              ]}
            >
              <FontAwesome5 name="user-check" size={20} color="green" />
            </View>
            <Text style={styles.actionButtonText}>Connections</Text>
          </Pressable>
        </Link>

        <Link href="/other-user/appointment" asChild>
          <Pressable style={styles.actionButton}>
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: "rgba(255, 0, 0, 0.3)" },
              ]}
            >
              <FontAwesome5 name="calendar-day" size={22} color="#FF0000" />
            </View>
            <Text style={styles.actionButtonText}>Appoinments</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.actionButtonsWrapper}>
        <Link href="/usable/about" asChild>
          <Pressable style={styles.actionButton}>
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: "rgba(0, 0, 255, 0.3)" },
              ]}
            >
              <MaterialIcons name="info" size={22} color={"#0051FF"} />
            </View>
            <Text style={styles.actionButtonText}>About</Text>
          </Pressable>
        </Link>

        <Link href="/pet-owner/(menu)/acc-settings" asChild>
          <Pressable style={styles.actionButton}>
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: "rgba(165, 165, 165, 0.3)" },
              ]}
            >
              <Image
                source={require("../../../assets/images/settings.png")}
                style={{ opacity: 100 }}
              />
            </View>
            <Text style={styles.actionButtonText}>Account Settings</Text>
          </Pressable>
        </Link>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>

      <CreateProfileModal
        visible={isCreateProfileModalVisible}
        onClose={() => setCreateProfileModalVisible(false)}
        onSelectProfile={(selectedProfile) => {
          console.log("Selected profile:", selectedProfile);
          // You can set this as current user profile
        }}
      />

      <LogoutModal
        visible={isLogoutModalVisible}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  profileConatiner: {
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: "95%",
    borderRadius: 25,
    marginTop: 10,
    alignSelf: "center",
  },
  addProfile: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1, // Ensure it appears above other elements
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  devider: {
    borderWidth: 0.2,
    borderColor: "#ccc",
    alignSelf: "center",
    width: "100%",
    marginBottom: 15,
  },
  myPets: {
    fontSize: 14,
    fontFamily: "RobotoMedium",
    color: "#000",
    marginBottom: 10,
  },
  addPet: {
    fontSize: 14,
    fontFamily: "RobotoMedium",
    color: "#000",
  },
  actionButtonsWrapper: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  actionButton: {
    width: "45%",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.white,

    // justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    marginHorizontal: 10,
    flexDirection: "row",
    gap: 10,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: "rgba(252, 181, 59, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginTop: 5,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    width: "80%",
    borderRadius: 8,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  logoutButtonText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: Colors.black,
  },
  samplePetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  samplePetAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#ccc", // fallback if image fails
  },
  samplePetName: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
    color: "#000",
  },
});
