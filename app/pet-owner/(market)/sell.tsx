import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add } from "@/helpers/db";
import { storage } from "@/helpers/firebase";
import { useLoadingHook } from "@/hooks/loadingHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Octicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const categories = ["Dogs", "Cats", "Food", "Accessories"];
const conditions = ["New", "Like New", "Used", "Old"];

const Sell = () => {
  const { address } = useLocalSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<string[]>([]);
  const [modalType, setModalType] = useState<"category" | "condition">(
    "category",
  );

  const renderLoadingButton = useLoadingHook(true)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages(uris);
    }
  };

  const openModal = (type: "category" | "condition") => {
    setModalType(type);
    setModalOptions(type === "category" ? categories : conditions);
    setModalVisible(true);
  };

  const handleSelectOption = (option: string) => {
    if (modalType === "category") setCategory(option);
    else setCondition(option);
    setModalVisible(false);
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const uri of images) {
      // Convert local URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique path
      const filename = `marketplace/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      uploadedUrls.push(downloadURL);
    }

    return uploadedUrls;
  };

  const { userId, userName, userImagePath } = useAppContext();

  // const handlePublish = async () => {
  //   if (
  //     !images.length ||
  //     !title ||
  //     !price ||
  //     !description ||
  //     !category ||
  //     !condition
  //     //!location - for location
  //   ) {
  //     alert("Please fill all required fields.");
  //     return;
  //   }

  //   try {
  //     // 1️⃣ Upload images to Cloudinary
  //     const uploadedImages: string[] = [];
  //     for (const uri of images) {
  //       const url = await uploadImageUri(uri);
  //       uploadedImages.push(url);
  //     }

  //     // 2️⃣ Prepare the item data
  //     const newItem = {
  //       ownerId: userId,
  //       ownerName: userName,
  //       ownerImg: userImagePath ?? null,
  //       title,
  //       price: Number(price),
  //       category,
  //       condition,
  //       description,
  //       images: uploadedImages,
  //       location: location?.name || address || "Not specified",
  //       status: "available",
  //       createdAt: serverTimestamp(),
  //     };

  //     // 3️⃣ Save to Firestore (using your helper)
  //     await add("marketPlace").value(newItem);

  //     alert("Item published!");
  //     router.back();
  //   } catch (error) {
  //     console.log("Error publishing item:", error);
  //     alert("Failed to publish item. Try again.");
  //   }
  // };

  const handlePublish = async () => {
    if (
      !images.length ||
      !title.trim() ||
      !price.trim() ||
      !description.trim() ||
      !category ||
      !condition
    ) throw "Please fill all required fields.";

      // 2️⃣ Upload all selected images
      const uploadedImages: string[] = await Promise.all(
        images.map(async (uri) => {
          if (!uri) return "";
          const url = await uploadImageUri(uri); // your Cloudinary helper
          return url;
        }),
      );

      // Remove any empty strings if upload failed
      const finalImages = uploadedImages.filter((url) => url);

      // 3️⃣ Prepare Firestore document
      const newItem = {
        ownerId: userId,
        ownerName: userName,
        ownerImg: userImagePath || null,
        title: title.trim(),
        price: Number(price),
        category,
        condition,
        description: description.trim(),
        images: finalImages, // ✅ Save as an array
        location: location?.name || address || "Not specified",
        status: "available",
        createdAt: serverTimestamp(),
      };

      // 4️⃣ Save to Firestore
      await add("marketPlace").value(newItem);

      Alert.alert("Success", "Item published!");

      // 5️⃣ Navigate back to marketplace
      router.push("/pet-owner/(tabs)/market-place");
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  return (
    <ScrollView
      style={screens.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Sell Item"
          onBack={() => router.back()}
          centerTitle={false}
        />
        {renderLoadingButton({
          style: styles.publishBtn,
          children: <Text style={styles.publishText}>Publish</Text>,
          loadingText: "Saving",
          onPress: handlePublish
        })}
        {/* <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity> */}
      </HeaderLayout>

      <View style={styles.formContainer}>
        {/* Images Carousel */}
        <View style={styles.imageCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            <TouchableOpacity onPress={pickImage} style={styles.addImageBtn}>
              <Text style={{ fontSize: 28, color: "#888" }}>+</Text>
              <Text style={{ fontSize: 12, color: "#888" }}>Add Photos</Text>
            </TouchableOpacity>

            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(img)}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Input Fields */}
        <View style={styles.inputCard}>
          <TextInput
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Price"
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.selectionBtn}
            onPress={() => openModal("category")}
          >
            <Text style={{ color: category ? "#000" : "#888" }}>
              {category || "Select Category"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectionBtn}
            onPress={() => openModal("condition")}
          >
            <Text style={{ color: condition ? "#000" : "#888" }}>
              {condition || "Select Condition"}
            </Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Description"
            style={[styles.input, { height: 120 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Location Card */}
        <View style={styles.locationCard}>
          <Octicons name="location" size={22} color={Colors.primary} />
          <Text style={styles.locationText}>{address}</Text>
          <TouchableOpacity
            onPress={() => router.push("/pet-owner/(market)/map")}
          >
            <Text style={styles.locationBtn}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
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
                  onPress={() => handleSelectOption(item)}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default Sell;

const styles = StyleSheet.create({
  publishBtn: {
    position: "absolute",
    right: 15,
    top: 35,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  publishText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  formContainer: { padding: 20, gap: 20 },
  imageCard: {
    minHeight: 150,
    borderRadius: 15,
    backgroundColor: "#fafafa",
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  addImageBtn: {
    width: 100,
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  imageWrapper: { position: "relative", marginHorizontal: 6 },
  selectedImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  selectionBtn: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: 10,
  },
  locationText: { flex: 1, fontSize: 15, fontFamily: "Roboto", color: "#555" },
  locationBtn: { fontSize: 15, fontFamily: "Roboto", color: Colors.primary },
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
