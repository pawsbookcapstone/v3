import { useAppContext } from "@/AppsProvider";
import { collectionName } from "@/helpers/db";
import { auth } from "@/helpers/firebase";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import Loader from "@/shared/components/Loader";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Profile = {
  id: string;
  name: string;
  email?:string;
  avatar: string;
  creator_id?:string;
  created_at?:string;
  categories?:string[];
  allow_appointments?: boolean;
  is_page?: boolean;
};

interface CreateProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProfile: (profile: Profile) => void;
}

const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  visible,
  onClose,
  onSelectProfile,
}) => {
  const {userId, userFirstName, userLastName, userImagePath, pageCreator, isPage, reset, setPageCreator, setUserId, setUserImagePath, setUserFirstName, setUserLastName} = useAppContext()

  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([
    // {
    //   id: "1",
    //   name: "John Doe",
    //   avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    // },
    // {
    //   id: "2",
    //   name: "Jane Smith",
    //   avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    // },
  ]);

  // const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  useOnFocusHook(() => {
    const getProfiles = async () => {
      try {
        const _profiles = await AsyncStorage.getItem('profiles')
        const ids = _profiles?.split(',')

        const pageProfiles = isPage ? [] : await collectionName("users")
          .whereEquals("creator_id", userId)
          .getMapped((id, data) => ({
            id,
            is_page: true,
            avatar: data.img_path ?? '',
            name: data.firstname,
            ...data
          }))
          
        const users = await collectionName("users")
          .whereIn("id", ids)
          .getMapped((_, d) => ({
            id: d.id,
            email: d.email,
            name: `${d.firstname} ${d.lastname}`,
            avatar: d.img_path
          }))
        
        setProfiles([...pageProfiles, ...users]);
      } catch(e) {
        console.log(e);
      }
    }

    getProfiles()
  }, [userId])

  const handleSelectProfile = async (profile: Profile) => {
    // setActiveProfile(profile);
    onClose()
    
    if (profile.id === userId)return

    if (profile.is_page){
      if (userId === profile.id) return
      if (!pageCreator)
        setPageCreator({
          id: userId,
          firstname: userFirstName,
          lastname: userLastName,
          img_path: userImagePath
        })
      setUserId(profile.id)
      setUserImagePath(profile.avatar)
      setUserFirstName(profile.name)
      setUserLastName("")

      router.replace('/pet-owner/home')
      return
    }

    if (pageCreator){
      setUserId(pageCreator.id)
      setUserImagePath(pageCreator.img_path)
      setUserFirstName(pageCreator.firstname)
      setUserLastName(pageCreator.lastname)
      setPageCreator(null)

      router.replace('/pet-owner/home')
      return
    }

    // set("users", userId).value({ last_online_at: serverTimestamp(), active_status: 'inactive' });
    reset()
    auth.signOut();

    router.replace({
      pathname:'/auth/Login',
      params: {
        email: profile.email
      }
    })

    // Wait briefly to show the check
    // setTimeout(() => {
    //   onClose();
    //   setIsLoading(true);
    //   onSelectProfile(profile);

    //   const path =
    //     profile.id === "1"
    //       ? "/pet-owner/(tabs)/home"
    //       : "/other-user/(tabs)/home";

    //   router.push(path);
    //   setIsLoading(false);
    // }, 800);
  };

  return (
    <>
      {/* Main Profile Selection Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>Choose Profile</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={26} color="#333" />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Profile List */}
              <View style={styles.profileList}>
                {profiles.map((profile) => {
                  const isActive = profile.id === userId;
                  return (
                    <Pressable
                      key={profile.id}
                      style={[styles.profileRow]}
                      onPress={() => handleSelectProfile(profile)}
                    >
                      <Image
                        source={{ uri: profile.avatar }}
                        style={styles.avatar}
                      />
                      <Text style={styles.profileName}>{profile.name}</Text>
                      {isActive && (
                        <MaterialIcons
                          name="check-circle"
                          size={22}
                          color={Colors.primary}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              {/* Add New Profile */}
              <Pressable
                style={styles.addProfileRow}
                onPress={() => {
                  onClose();
                  router.push("/create-profile");
                }}
              >
                <View style={styles.addCircle}>
                  <MaterialIcons name="add" size={22} color="#fff" />
                </View>
                <Text style={styles.addProfileText}>
                  Create PaswBook Profile
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loader Overlay */}
      {isLoading && <Loader />}
    </>
  );
};

export default CreateProfileModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontFamily: "RobotoMedium",
    color: "#000",
  },
  profileList: {
    marginTop: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 12,
  },
  profileName: {
    fontSize: 15,
    color: "#000",
    fontFamily: "RobotoMedium",
  },
  divider: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  addProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addProfileText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: "RobotoMedium",
  },
});
