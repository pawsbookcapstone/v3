import { useAppContext } from "@/AppsProvider";
import { add, serverTimestamp } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const myProfileImage = "https://randomuser.me/api/portraits/men/32.jpg";
const myProfileName = "John Doe";

const AnonymousPosting = () => {
  const router = useRouter();
  const { userId, userName, userImagePath } = useAppContext();
  const { id } = useLocalSearchParams();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  const groupId = Array.isArray(id) ? id[0] : id;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handlePost = () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert("Empty Post", "Please add some text or an image.");
      return;
    }

    try {
      add("groups", groupId, "posts").value({
        // id: Date.now().toString(),
        user: userName,
        profileImage: userImagePath,
        time: serverTimestamp(),
        content,
        images,
        userId,
        liked: false,
        likesCount: 0,
        comments: [],
        showComments: false,
      });

      //       const newPost = {
      //   id: Date.now().toString(),
      //   user: myProfileName,
      //   profileImage: myProfileImage,
      //   time: "Just now",
      //   content,
      //   images,

      //   liked: false,
      //   likesCount: 0,
      //   comments: [],
      //   showComments: false,
      // };
      router.back();
      // router.replace({
      //   pathname: "/usable/group-profile",
      // });
      // ToastAndroid.show("Joined group successfully!", ToastAndroid.SHORT);
      // router.push({
      //   pathname: "/pet-owner/(menu)/community",
      // });
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to send join request. Try again.");
    }
  };

  const handleBack = () => {
    if (content.trim() || images.length > 0) {
      setShowExitModal(true);
    } else {
      router.back();
    }
  };

  const discardPost = () => {
    setContent("");
    setImages([]);

    setShowExitModal(false);
    router.back();
  };

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Create Post"
          onBack={handleBack}
          centerTitle={true}
        />
      </HeaderLayout>

      <View style={styles.container}>
        {/* Profile Row */}
        <View style={styles.profileRow}>
          <Image source={{ uri: userImagePath }} style={styles.avatar} />
          <View>
            <Text style={styles.profileName}>{userName}</Text>
          </View>
        </View>

        {/* Input */}
        <TextInput
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          style={styles.input}
          multiline
        />

        {/* Image Preview */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
          >
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        )}

        {/* Media Options */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <FontAwesome6 name="image" size={20} color={"#26BC00"} />
            <Text style={styles.actionText}> Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
            <Entypo name="camera" size={20} color={"#E00101"} />
            <Text style={styles.actionText}> Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Exit Modal */}
      <Modal transparent visible={showExitModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Discard Post?</Text>
            <Text style={styles.modalMessage}>
              You have unsaved changes. Do you want to keep editing or discard
              your post?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#f0f0f0" }]}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={{ color: "#333" }}>Keep Editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={discardPost}
              >
                <Text style={{ color: Colors.white }}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AnonymousPosting;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  taggedPet: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginTop: 5,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  petAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  petName: {
    fontSize: 12,
    color: "#333",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  input: {
    fontSize: 14,
    color: "#333",
    minHeight: 60,
    fontFamily: "Roboto",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  actionsColumn: {
    flexDirection: "column",
    gap: 5,
    marginTop: 15,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Roboto",
  },
  postButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  postText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});
