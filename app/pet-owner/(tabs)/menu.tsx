import { useAppContext } from "@/AppsProvider";
import CreateProfileModal from "@/components/modals/CreateProfileModal";
import LogoutModal from "@/components/modals/LogoutModal";
import { all } from "@/helpers/db";
import { auth } from "@/helpers/firebase";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
const myProfileImage = {
  profile: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "John Doe",
};

const profile = () => {
  const { userId, userName, userImagePath, reset, isPage } = useAppContext();

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isCreateProfileModalVisible, setCreateProfileModalVisible] =
    useState(false);
  const [pets, setPets] = useState<{ [key: string]: any }[]>([]);
  // const dummyPets = [
  //   {
  //     id: "1",
  //     name: "Buddy",
  //     avatar: "https://placekitten.com/100/100", // sample internet image
  //     avatarColor: "#FFD700",
  //   },
  //   {
  //     id: "2",
  //     name: "Milo",
  //     avatar: "https://placekitten.com/101/101",
  //     avatarColor: "#FFA500",
  //   },
  //   {
  //     id: "3",
  //     name: "Luna",
  //     avatar: "https://placekitten.com/102/102",
  //     avatarColor: "#FF6347",
  //   },
  // ];

  useOnFocusHook(() => {
    if (isPage || !userId)return 

    const fetchPets = async () => {
      const snap = await all("users", userId, "pets");
      setPets(snap.docs.map((pet) => pet.data()));
    };
    fetchPets();
  }, [userId]);

  const handleLogout = () => {
    // set("users", userId).value({ last_online_at: serverTimestamp(), active_status: 'inactive' });
    reset()
    auth.signOut();
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: 100 }}
      >
        <View style={styles.profileConatiner}>
          <View style={styles.row}>
            <Pressable
              style={styles.row}
              onPress={() => {
                if (!isPage)
                  return router.push('/pet-owner/profile');

                router.push({
                  pathname: '/other-user/profile',
                  params: {
                    pageId: userId
                  }
                })
              }}
            >
              <View style={styles.avatar}>
                <Image
                  source={{ uri: userImagePath }}
                  style={styles.avatarImage}
                />
              </View>
              <Text style={styles.name}>{userName}</Text>
            </Pressable>

            <Pressable
              style={styles.addProfile}
              onPress={() => setCreateProfileModalVisible(true)}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={30}
                color="#000"
              />
            </Pressable>
          </View>

          {
            !isPage && <>
              <View style={styles.devider} />

              <Text style={styles.myPets}>My Pets</Text>

              {pets.map((pet) => (
                <View key={pet.name} style={styles.samplePetRow}>
                  <Image
                    source={{ uri: pet.img_path }}
                    style={styles.samplePetAvatar}
                  />
                  <Text style={styles.samplePetName}>{pet.name}</Text>
                </View>
              ))}

              <Link href="/pet-owner/(menu)/add-pet" asChild>
                <Pressable
                  onPress={(e) => {
                    if (pets.length >= 3) {
                      e.preventDefault(); // stop navigation
                      // ToastAndroid.show(
                      //   "You can only add 3 pets",
                      //   ToastAndroid.SHORT
                      // );
                    }
                  }}
                  style={[pets.length >= 3 && { opacity: 0.5 }]} // visually show disabled
                >
                  <View style={styles.row}>
                    <Entypo
                      name="circle-with-plus"
                      size={24}
                      color={Colors.primary}
                    />

                    <View style={{ flexDirection: "column", marginLeft: 10 }}>
                      <Text style={styles.addPet}>Add Pet</Text>
                      <Text
                        style={[
                          styles.addPet,
                          { color: "#8B8B8B", fontSize: 12, fontFamily: "Roboto" },
                        ]}
                      >
                        You can add only 3 pets
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            </>
          }
        </View>

        <View style={styles.actionButtonsWrapper}>
          <Link href={isPage ? "/other-user/connections" : "/pet-owner/(menu)/community"} asChild>
            <Pressable style={styles.actionButton}>
              <View
                style={[
                  styles.actionButtonIcon,
                  { backgroundColor: "rgba(0, 255, 34, 0.3)" },
                ]}
              >
                <Image
                  source={require("../../../assets/images/pet.png")}
                  style={{ opacity: 100 }}
                />
              </View>
              <Text style={styles.actionButtonText}>{isPage ? 'Connections' : 'Group'}</Text>
            </Pressable>
          </Link>

          <Link href={isPage ? "/other-user/appointment" : "/pet-owner/(menu)/appointment"} asChild>
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

        {
          !isPage &&
        <View style={styles.actionButtonsWrapper}>
          <Link href="/pet-owner/(menu)/adapt" asChild>
            <Pressable style={styles.actionButton}>
              <View
                style={[
                  styles.actionButtonIcon,
                  { backgroundColor: "rgba(0, 255, 200, 0.22)" },
                ]}
              >
                <FontAwesome5 name="paw" size={22} color="#80CBC4" />
              </View>
              <Text style={styles.actionButtonText}>Adapt Pet</Text>
            </Pressable>
          </Link>

          <Link href="/pet-owner/(menu)/lost-found" asChild>
            <Pressable style={styles.actionButton}>
              <View
                style={[
                  styles.actionButtonIcon,
                  { backgroundColor: "rgba(11, 48, 43, 0.3)" },
                ]}
              >
                <FontAwesome name="question-circle" size={25} color="#173B45" />
              </View>
              <Text style={styles.actionButtonText}>Lost and Found</Text>
            </Pressable>
          </Link>
        </View>
        }

        {
          !isPage && 
        <View style={styles.actionButtonsWrapper}>
          <Link href="/pet-owner/(menu)/manage-pet" asChild>
            <Pressable style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Image
                  source={require("../../../assets/images/vaccine.png")}
                  style={{ opacity: 100 }}
                />
              </View>
              <Text style={styles.actionButtonText}>Manage Pets</Text>
            </Pressable>
          </Link>

          <Link href="/pet-owner/(menu)/saved" asChild>
            <Pressable style={styles.actionButton}>
              <View
                style={[
                  styles.actionButtonIcon,
                  { backgroundColor: "rgba(255, 0, 242, 0.3)" },
                ]}
              >
                <FontAwesome name="bookmark" size={22} color="#9112BC" />
              </View>
              <Text style={styles.actionButtonText}>Saved</Text>
            </Pressable>
          </Link>
        </View>
        }

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
      </ScrollView>
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
    marginLeft: 12,
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
    marginTop: 10,
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
