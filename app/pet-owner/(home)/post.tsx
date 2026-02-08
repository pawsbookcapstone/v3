import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, set } from "@/helpers/db";
import { useLoadingHook } from "@/hooks/loadingHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";

const PostScreen = () => {
  const [editPost, setEditPost] = useState<any>(null);

  const { userId, userName, userImagePath, setFunc, isPage } = useAppContext();

  const router = useRouter();

  const renderLoadingButton = useLoadingHook(true)
  // const { taggedPets: taggedPetsParam } = useLocalSearchParams();

  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [taggedPets, setTaggedPets] = useState<
    { id: string; name: string; img_path: string }[]
  >([]);
  const params = useLocalSearchParams();

  useOnFocusHook(() => {
    if (!params.editPost) return

    try {
      const post = JSON.parse(params.editPost as string);
      setEditPost(post);
      setContent(post.body || "");
      setImages(post.img_paths || []);
      setTaggedPets(post.pets || []);
    } catch (e) {
      console.warn("Invalid editPost param", e);
    }
  }, []);

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

  const handlePost = async () => {
    if (!content.trim() && images.length === 0)
      throw "Please add some text or an image."

      let data: any = {
        creator_id: userId,
        creator_name: userName,
        creator_img_path: userImagePath ?? null,
        creator_is_page: isPage,
        body: content.trim(),
        date: serverTimestamp(),
        shares: 0,
      };

      if (taggedPets.length > 0) {
        data.pets = taggedPets.map((p) => ({
          name: p.name,
          id: p.id,
          img_path: p.img_path,
        }));
      }

      if (images.length > 0) {
        const temp: string[] = [];
        for (const i in images) {
          const img_url = await uploadImageUri(images[i]);
          temp.push(img_url);
        }
        data.img_paths = temp;
      }

      if (editPost?.id) {
        // Edit existing post
        await set("posts", editPost.id).value(data);
        ToastAndroid.show("Post updated", ToastAndroid.SHORT);
      } else {
        // New post
        await add("posts").value(data);
        ToastAndroid.show("Post created", ToastAndroid.SHORT);
      }

      router.back();
  };

  const handleBack = () => {
    if (content.trim() || images.length > 0 || taggedPets.length > 0) {
      setShowExitModal(true);
    } else {
      router.back();
    }
  };

  const discardPost = () => {
    setContent("");
    setImages([]);
    setTaggedPets([]);
    setShowExitModal(false);
    router.push("/pet-owner/(tabs)/home");
  };

  const handleTag = () => {
    setFunc({
      call: (_tags: any) => {
        setTaggedPets(_tags);
      },
    });
    router.push("/usable/pet-list");
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

            {/* Tagged Pets */}
            {taggedPets.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {taggedPets.map((pet) => (
                  <View key={pet.id} style={styles.taggedPet}>
                    <Image
                      source={{ uri: pet.img_path }}
                      style={styles.petAvatar}
                    />
                    <Text style={styles.petName}>{pet.name}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
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
              <View key={idx} style={{ position: "relative", marginRight: 10 }}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImages(images.filter((_, i) => i !== idx))}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>X</Text>
                </TouchableOpacity>
              </View>
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

          {
            !isPage &&
            <TouchableOpacity style={styles.actionBtn} onPress={handleTag}>
              <Entypo name="price-tag" size={20} color={"#007AFF"} />
              <Text style={styles.actionText}> Tag Pets</Text>
            </TouchableOpacity>
          }
        </View>

        {/* Post Button */}
        {renderLoadingButton({
          style: styles.postButton,
          children: <Text style={styles.postText}>
            {editPost ? "Update Post" : "Post"}
          </Text>,
          onPress: handlePost
        })}
        {/* <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postText}>
            {editPost ? "Update Post" : "Post"}
          </Text>
        </TouchableOpacity> */}
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

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    margin: 15,
    padding: 15,
    borderRadius: 12,
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
    borderRadius: 10,
    fontFamily: "Roboto",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
  },
  removeImageBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
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
