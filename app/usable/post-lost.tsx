import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, serverTimestamp } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CreateLostFoundPost = () => {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [type, setType] = useState<"Lost" | "Found">("Lost");

  //bagong code
  //bagong code
  const { userId, userName, userImagePath } = useAppContext();
  const createLostFound = async () => {
    // console.log(providerId, providerImage, providerName);
    // if (!petName || !contactNumber || !selectedDate || !selectedTime) {
    //   alert("Please complete all fields");
    //   return;
    // }

    try {
      const uploadedImages: string[] = await Promise.all(
        images.map(async (uri) => {
          if (!uri) return "";
          const url = await uploadImageUri(uri);
          return url;
        }),
      );

      const finalImages = uploadedImages.filter((url) => url);

      await add("lost-and-found").value({
        type: type,
        caption: caption,
        userId: userId,
        userName: userName,
        userImage: userImagePath,
        createdAt: serverTimestamp(),
        petImages: finalImages,
        // ownerId:fin user.uid   // add later if needed
      });
      router.replace("/pet-owner/(menu)/lost-found");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      // setLoading(false);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // ✅ Allow multiple
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    console.log("Post Created:", { images, caption, type });
    router.back();
  };

  return (
    <View style={[screens.screen, { backgroundColor: "#fff", flex: 1 }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Create Post"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Type Selection */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggleRow}>
          {["Lost", "Found"].map((t) => (
            <Pressable
              key={t}
              style={[
                styles.toggleBtn,
                type === t && { backgroundColor: Colors.primary },
              ]}
              onPress={() => setType(t as "Lost" | "Found")}
            >
              <Text
                style={[styles.toggleText, type === t && { color: "#fff" }]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Caption */}
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          placeholder="Write something..."
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        {/* Images Section */}
        <Text style={styles.label}>Photos</Text>
        <Pressable style={styles.imagePicker} onPress={pickImages}>
          <Feather name="camera" size={28} color="#9CA3AF" />
          <Text style={{ color: "#9CA3AF", marginTop: 6 }}>
            Tap to pick photos
          </Text>
        </Pressable>

        {/* Preview Grid */}
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <Pressable
                style={styles.removeBtn}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Post Button */}
        <Pressable
          style={[styles.postBtn, { opacity: caption ? 1 : 0.7 }]}
          onPress={createLostFound}
          disabled={!caption}
        >
          <Text style={styles.postBtnText}>Post</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default CreateLostFoundPost;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleText: {
    color: Colors.primary,
    fontWeight: "600",
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  imageWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
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
});
