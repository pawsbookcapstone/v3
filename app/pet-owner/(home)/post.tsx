import { useAppContext } from "@/AppsProvider";
import { moderateImage, moderateText } from "@/helpers/AI/ai";
import { SafetyStatus, Violation } from "@/helpers/AI/types";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, set } from "@/helpers/db";
import { useLoadingHook } from "@/hooks/loadingHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

type ImageType = {
  uri: string;
  scanning?: boolean;
  errors?: Violation[];
  status?: SafetyStatus | undefined;
};

const PostScreen = () => {
  const [editPost, setEditPost] = useState<any>(null);

  const { userId, userName, userImagePath, setFunc, isPage } = useAppContext();

  const router = useRouter();

  const renderLoadingButton = useLoadingHook(true);
  // const { taggedPets: taggedPetsParam } = useLocalSearchParams();

  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageType[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [violationTitle, setViolationTitle] = useState("Image");
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [taggedPets, setTaggedPets] = useState<
    { id: string; name: string; img_path: string }[]
  >([]);
  const params = useLocalSearchParams();
  const { title } = useLocalSearchParams();
  const titleSTR = title as string;

  useOnFocusHook(() => {
    console.log(title);
    if (!params.editPost) return;

    // try {
    //   const post = JSON.parse(params.editPost as string);
    //   setEditPost(post);
    //   setContent(post.body || "");
    //   setImages(post.img_paths || []);
    //   setTaggedPets(post.pets || []);

    //   console.log(post.img_paths);
    // } catch (e) {
    //   console.warn("Invalid editPost param", e);
    // }
    try {
      const post = JSON.parse(params.editPost as string);

      setEditPost(post);
      setContent(post.body || "");
      setTaggedPets(post.pets || []);

      if (post?.img_paths?.length) {
        const formattedImages: ImageType[] = post.img_paths.map(
          (path: string) => ({
            uri: path,
            scanning: false,
            errors: [],
            status: undefined,
          }),
        );

        setImages(formattedImages);
      } else {
        setImages([]);
      }

      console.log("img_paths:", images);
    } catch (e) {
      console.warn("Invalid editPost param", e);
    }
  }, []);

  const isScanning = useMemo(() => {
    return images.some((f) => f.scanning);
  }, [images]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || result.assets.length == 0) return;

    const asset = result.assets[0];

    const dataUrl = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    const idx = images.length;
    moderateImage(dataUrl).then((res) => {
      console.log("Image AI Result: ", res);

      setImages((_images) => {
        const img = _images[idx];
        img.scanning = false;
        img.status = res.status;
        if (res.violations && res.violations.length > 0)
          img.errors = res.violations;
        console.log(img);
        return [..._images];
      });
    });

    setImages((prev) => [...prev, { uri: asset.uri, scanning: true }]);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || result.assets.length == 0) return;

    const asset = result.assets[0];

    const dataUrl = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    const idx = images.length;
    moderateImage(dataUrl).then((res) => {
      console.log("Image AI Result: ", res);

      setImages((_images) => {
        const img = _images[idx];
        img.scanning = false;
        img.status = res.status;
        if (res.violations && res.violations.length > 0)
          img.errors = res.violations;
        console.log(img);
        return [..._images];
      });
    });

    setImages((prev) => [...prev, { uri: asset.uri, scanning: true }]);
  };

  const handlePost = async () => {
    Keyboard.dismiss();
    const safeImages = images.filter((s) => s.status !== SafetyStatus.BLOCKED);
    if (!content.trim() && safeImages.length === 0)
      throw "Please add some text or an image.";

    try {
      const res = await moderateText(content.trim());
      console.log("Text AI Result: ", res);
      if (res.status === SafetyStatus.BLOCKED) {
        setViolationTitle("Text");
        setViolations(res.violations);
        setShowViolationModal(true);
        return;
      }
      if (
        res.status === SafetyStatus.WARNING ||
        (res.violations && res.violations.length > 0)
      ) {
        setViolationTitle("Text");
        setViolations(res.violations);
        setShowViolationModal(true);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Warning", "AI validation is not available right now!!!");
    }

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

    if (safeImages.length > 0) {
      const temp: string[] = [];
      for (const img of safeImages) {
        const img_url = await uploadImageUri(img.uri);

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

  const showImageViolations = (img: ImageType) => {
    if (!img.errors || img.errors.length == 0) return;

    setViolationTitle("Image");
    setViolations(img.errors ?? []);
    setShowViolationModal(true);
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

  const getSeverityBGColor = (severity: string): string => {
    if (severity === "low") return Colors.primary;
    if (severity === "medium") return Colors.orange;
    return Colors.red;
  };

  const getImageIcon = (image: ImageType) => {
    if (image.status === SafetyStatus.BLOCKED)
      return <MaterialIcons name="warning" color={Colors.red} size={23} />;
    if (
      image.status === SafetyStatus.WARNING ||
      (image.errors && image.errors.length > 0)
    )
      return <MaterialIcons name="warning" color={Colors.primary} size={23} />;
    return <MaterialIcons name="thumb-up" color={Colors.secondary} size={23} />;
  };

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title={titleSTR}
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
            {images.map((image, idx) => (
              <Pressable
                key={idx}
                style={{ position: "relative", marginRight: 10 }}
                onPress={() => showImageViolations(image)}
              >
                <Image
                  source={{ uri: image.uri ?? "" }}
                  style={styles.previewImage}
                />
                {image.scanning && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: Colors.black,
                      opacity: 0.4,
                      display: "flex",
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    <Loader2 color={Colors.white} />
                  </View>
                )}
                {image.scanning == false && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    {getImageIcon(image)}
                  </View>
                )}
                {image.scanning == false && (
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => {
                      setImages(images.filter((_, i) => i !== idx));
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>X</Text>
                  </TouchableOpacity>
                )}
              </Pressable>
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

          {!isPage && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleTag}>
              <Entypo name="price-tag" size={20} color={"#007AFF"} />
              <Text style={styles.actionText}> Tag Pets</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Post Button */}
        {renderLoadingButton({
          style: [
            styles.postButton,
            isScanning && { backgroundColor: Colors.disabled },
          ],
          children: (
            <Text style={styles.postText}>
              {editPost ? "Update Post" : "Post"}
            </Text>
          ),
          disabled: isScanning,
          onPress: handlePost,
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

      <Modal transparent visible={showViolationModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{violationTitle} Violations</Text>

            {violations.map((txt, idx) => (
              <View
                key={idx}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 5,
                  marginBottom: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGray,
                  paddingBottom: 5,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "600", flex: 1 }}>
                  {txt.category}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.white,
                    paddingVertical: 2,
                    textAlign: "center",
                    width: 60,
                    borderRadius: 5,
                    backgroundColor: getSeverityBGColor(
                      txt.severity.toLowerCase(),
                    ),
                  }}
                >
                  {txt.severity.toLowerCase()}
                </Text>

                <Text style={{ width: "100%" }}>{txt.reason}</Text>
              </View>
            ))}

            <View style={[styles.modalActions, { marginTop: 10 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#f0f0f0" }]}
                onPress={() => setShowViolationModal(false)}
              >
                <Text style={{ color: "#333" }}>Close</Text>
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
    fontSize: 19,
    fontWeight: "700",
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
