import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, serverTimestamp } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const categories = ["Dog", "Cat", "Rabbit", "Others"];

const CreateAdoptionPost = () => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  // bagong code
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<string[]>([]);
  const [modalType, setModalType] = useState("category");
  const [petCategory, setPetCategory] = useState(
    "Please select your pet category",
  );

  const openModal = (type: "category") => {
    setModalType(type);
    setModalOptions(categories);
    setModalVisible(true);
  };

  const handleSelectPetCategory = (item: string) => {
    setPetCategory(item);
    setModalVisible(false);
  };

  const { userId, userName, userImagePath } = useAppContext();
  // const [images, setImages] = useState<string[]>([]);

  const createLostFound = async () => {
    try {
      const finalImage = await uploadImageUri(image);

      await add("post-adopt").value({
        petCategory: petCategory,
        caption: caption,
        userId: userId,
        userName: userName,
        userImage: userImagePath ?? "default",
        createdAt: serverTimestamp(),
        petImage: finalImage,
      });
      router.replace("/pet-owner/(menu)/adapt");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      // setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // still valid
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // const handlePost = () => {
  //   console.log("Adoption Post Created:", { images, caption });
  //   router.back();
  // };

  return (
    <View style={[screens.screen, { backgroundColor: "#fff", flex: 1 }]}>
      {/* Header */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Create Adoption Post"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      <View style={styles.container}>
        {/* Pet Catergory */}
        <Text style={styles.label}>Pet Category</Text>
        <TouchableOpacity
          style={styles.selectionBtn}
          onPress={() => openModal("category")}
        >
          <Text style={{ color: "#000" }}>{petCategory}</Text>
        </TouchableOpacity>

        {/* Caption */}
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          placeholder="Write something about your pet..."
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        {/* Image Picker */}
        <Text style={styles.label}>Pet Photo</Text>
        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Feather name="camera" size={28} color="#9CA3AF" />
          )}
        </Pressable>

        {/* Post Button */}
        <Pressable
          style={[styles.postBtn, { opacity: caption ? 1 : 0.7 }]}
          onPress={createLostFound}
          disabled={!caption}
        >
          <Text style={styles.postBtnText}>Post</Text>
        </Pressable>
      </View>

      {/* modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "category"
                ? "Select Category"
                : "Select Condition"}
            </Text>
            <FlatList
              data={modalOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectPetCategory(item)}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CreateAdoptionPost;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 16,
  },
  imagePicker: {
    height: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  postBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  selectionBtn: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: "50%",
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: { fontSize: 15 },
});
