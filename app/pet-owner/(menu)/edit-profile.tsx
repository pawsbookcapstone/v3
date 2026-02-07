import ProfileImage from "@/app/usable/profile-image";
import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { find, set } from "@/helpers/db";
import { updateUserProfile } from "@/helpers/updateProfile";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const EditProfile = () => {
  const { userId, setUserFirstName, setUserLastName, setUserImagePath, isPage } =
    useAppContext();

  const [profile, setProfile] = useState<any>({
    // name: params.name || "",
    // email: params.email || "",
    // friends: params.friends || "",
    // profile_photo: params.profile_photo || "",
    // cover_photo: params.cover_photo || "",
    // bio: params.bio || "",
    // phone_number: params.phone_number || "",
    // isPage: params.isPage === "true" || false,
    // is_open: params.is_open === "true" || false,
    // address: params.address || "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [imageType, setImageType] = useState<"profile" | "cover" | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await find("users", userId);
      const data: any = snap.data();
      setProfile(data);
    };

    fetchProfile();
  }, []);

  const handleChange = (key: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const openImagePicker = (type: "profile" | "cover") => {
    setImageType(type);
    setModalVisible(true);
  };

  const handleImagePick = async (source: "camera" | "gallery") => {
    // try {
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: imageType === "cover" ? [3, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfile((prev: any) => ({
          ...prev,
          [imageType === "cover" ? "cover_photo" : "profile_photo"]:
            result.assets[0].uri,
        }));
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageType === "cover" ? [3, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfile((prev: any) => ({
          ...prev,
          [imageType === "cover" ? "cover_photo" : "profile_photo"]:
            result.assets[0].uri,
        }));
      }
    }
    setModalVisible(false);
    // } catch (error) {
    //   console.log("Image selection failed:", error);
    // }
  };

  const handleSave = async () => {
    try {
      let data = { ...profile };
      if (data.profile_photo) {
        const profilePath = await uploadImageUri(data.profile_photo);
        delete data.profile_photo;
        data.img_path = profilePath;
        setUserImagePath(profilePath);
      }
      if (data.cover_photo) {
        const profilePath = await uploadImageUri(data.cover_photo);
        delete data.cover_photo;
        data.cover_photo_path = profilePath;
      }
      setUserFirstName(data.firstname);
      setUserLastName(data.lastname);
      set("users", userId).value(data);
      updateUserProfile(
        userId,
        `${data.firstname} ${data.lastname}`,
        data.img_path,
      );
      router.back();
    } catch (e) {
      Alert.alert("Error", e + "");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[screens.screen]}>
          <HeaderLayout noBorderRadius bottomBorder>
            <HeaderWithActions
              title="Edit Profile"
              onBack={() => router.back()}
              centerTitle={true}
            />
          </HeaderLayout>

          <ScrollView
            contentContainerStyle={{
              padding: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* ✅ Cover Photo */}
            <Pressable
              style={styles.coverPhoto}
              onPress={() => openImagePicker("cover")}
            >
              {profile.cover_photo || profile.cover_photo_path ? (
                <Image
                  source={{
                    uri: profile.cover_photo ?? profile.cover_photo_path,
                  }}
                  style={styles.coverImage}
                />
              ) : (
                <FontAwesome name="photo" size={50} color={Colors.gray} />
              )}
              <View style={styles.editOverlay}>
                <FontAwesome name="camera" size={20} color={Colors.white} />
                <Text style={styles.editText}>Edit Cover</Text>
              </View>
            </Pressable>

            {/* ✅ Profile Photo */}
            <View style={styles.profilePhotoContainer}>
              <Pressable onPress={() => openImagePicker("profile")}>
                {profile.profile_photo || profile.img_path ? (
                  <ProfileImage
                  // <Image
                    source={{ uri: profile.profile_photo ?? profile.img_path }}
                    style={styles.profileImage}
                  />
                ) : (
                  <FontAwesome
                    name="user-circle"
                    size={80}
                    color={Colors.gray}
                  />
                )}
                <View style={styles.profileEditIcon}>
                  <FontAwesome name="camera" size={16} color={Colors.white} />
                </View>
              </Pressable>
            </View>

            {/* Editable Fields */}
            <View style={styles.formContainer}>
              {profile.is_page ? (
                <>
                  <Text style={styles.label}>Page Name*</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.firstname}
                    onChangeText={(text) => handleChange("firstname", text)}
                  />

                  {/* Open / Closed Toggle */}
                  <View style={styles.openStatusContainer}>
                    <Text style={styles.label}>Status</Text>

                    <Pressable
                      style={[
                        styles.statusToggle,
                        {
                          backgroundColor: profile.is_open
                            ? "#4CAF50"
                            : "#E53935",
                        },
                      ]}
                      onPress={() =>
                        setProfile((prev: any) => ({
                          ...prev,
                          is_open: !prev.is_open,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.statusCircle,
                          {
                            alignSelf: profile.is_open
                              ? "flex-end"
                              : "flex-start",
                          },
                        ]}
                      />
                    </Pressable>

                    <Text
                      style={[
                        styles.statusText,
                        { color: profile.is_open ? "#4CAF50" : "#E53935" },
                      ]}
                    >
                      {profile.is_open ? "Open" : "Closed"}
                    </Text>
                  </View>
                </>
              ): <>
                  <Text style={styles.label}>First Name*</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.firstname}
                    onChangeText={(text) => handleChange("firstname", text)}
                  />
                  <Text style={styles.label}>Last Name*</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.lastname}
                    onChangeText={(text) => handleChange("lastname", text)}
                  />
                </>
              }

              <Text style={styles.label}>Email*</Text>
              <TextInput
                style={styles.input}
                value={profile.email as string}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
              />

              {/* Address Input */}
              <Text style={styles.label}>Address*</Text>
              <TextInput
                style={styles.input}
                value={profile.address}
                onChangeText={(text) => handleChange("address", text)}
                placeholder="Enter business address"
              />

              <Text style={styles.label}>Phone*</Text>
              <TextInput
                style={styles.input}
                value={profile.phone_number as string}
                onChangeText={(text) => handleChange("phone_number", text)}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Bio*</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={profile.bio as string}
                onChangeText={(text) => handleChange("bio", text)}
                placeholder="Write something about yourself..."
                multiline
                numberOfLines={4}
                maxLength={60}
              />
              <View style={{ alignItems: "flex-end", marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: Colors.darkGray }}>
                  {(profile.bio ?? "").length}/60
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </ScrollView>

          {/* ✅ Modal for choosing image source */}
          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Choose Photo Source</Text>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleImagePick("camera")}
                >
                  <FontAwesome name="camera" size={18} color={Colors.white} />
                  <Text style={styles.modalButtonText}>Open Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleImagePick("gallery")}
                >
                  <FontAwesome name="image" size={18} color={Colors.white} />
                  <Text style={styles.modalButtonText}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.gray }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  coverPhoto: {
    width: "100%",
    height: 200,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 8,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  openStatusContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    alignSelf: "flex-start",
  },

  statusToggle: {
    width: 60,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    padding: 3,
    marginTop: 8,
  },

  statusCircle: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 3,
  },

  statusText: {
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },

  editOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    color: Colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileEditIcon: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: Colors.primary,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  formContainer: {
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "Roboto",
    // marginBottom: 6,
    marginLeft: 6,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderBottomWidth: 0.75,
    borderColor: Colors.primary,
  },
  bioInput: {
    textAlignVertical: "top",
    height: 50,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: "Roboto",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.darkGray,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 6,
    width: "100%",
    justifyContent: "center",
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "600",
  },
});
