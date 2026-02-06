import { useAppContext } from "@/AppsProvider";
import { add, find, set } from "@/helpers/db";
import { useNotifHook } from "@/helpers/notifHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const myProfileImage = "https://randomuser.me/api/portraits/men/32.jpg";
const myProfileName = "John Doe";

const dummyPets = [
  { id: "1", name: "Buddy", image: "https://place-puppy.com/60x60" },
  { id: "2", name: "Mochi", image: "https://placekitten.com/60/60" },
  { id: "3", name: "Charlie", image: "https://placebear.com/60/60" },
];

const SharePost = () => {
  const {setFunc, userId, userName, userImagePath} = useAppContext()

  const { post, taggedPets: taggedPetsParam } = useLocalSearchParams();
  const parsedPost = post ? JSON.parse(post as string) : null;

  const [taggedPets, setTaggedPets] = useState<
    { id: string; name: string; img_path: string }[]
  >([]);
  const [caption, setCaption] = useState("");
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  const addNotif = useNotifHook()

  useEffect(() => {
    if (taggedPetsParam) {
      try {
        const parsed = JSON.parse(taggedPetsParam as string);
        if (Array.isArray(parsed)) setTaggedPets(parsed);
      } catch (e) {
        console.warn("Invalid taggedPets param", e);
      }
    }
  }, [taggedPetsParam]);

  if (!parsedPost) {
    return (
      <View style={styles.center}>
        <Text>No post data found.</Text>
      </View>
    );
  }

  const togglePetTag = (petId: string) => {
    setSelectedPets((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  const handleTag = () => {
    setFunc({
      call: (_tags: any) => {
        setTaggedPets(_tags);
      },
    });
    router.push("/usable/pet-list");
  };

  const handleShare = async () => {
    if (!caption.trim()) {
      Alert.alert("Empty Post", "Please add some text.");
      return;
    }

    try {
      const sharedPostSnap = await find('posts', parsedPost.id)
      const sharesCount = parseInt(sharedPostSnap.data()?.shares ?? 0) + 1
      set('posts', parsedPost.id).value({
        shares: sharesCount
      })

      let data: any = {
        creator_id: userId,
        creator_name: userName,
        creator_img_path: userImagePath ?? null,
        body: caption.trim(),
        date: serverTimestamp(),
        shares: 0,
        shared_post_id: parsedPost.id
      };

      if (taggedPets.length > 0) {
        data.pets = taggedPets.map((p) => ({
          name: p.name,
          id: p.id,
          img_path: p.img_path,
        }));
      }

        await add("posts").value(data);
        addNotif({
          receiver_id: parsedPost.creator_id,
          type: 'Share',
          href: '/pet-owner/profile'
        })
        ToastAndroid.show("Post shared", ToastAndroid.SHORT);

      router.back();
    } catch (e) {
      Alert.alert("Error", e + "");
    }
return

  };

  const handleBack = () => {
    if (caption.trim() || taggedPets.length > 0) setShowExitModal(true);
    else router.back();
  };

  const discardPost = () => {
    setCaption("");
    setTaggedPets([]);
    router.back();
  };

  return (
    <View style={[screens.screen, { backgroundColor: "#fff" }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          onBack={handleBack}
          centerTitle={true}
          title="Share Post"
        />
      </HeaderLayout>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 🧍 Profile & Tag */}
        <View style={styles.profileRow}>
          <Image source={{ uri: myProfileImage }} style={styles.avatar} />
          <View>
            <Text style={styles.profileName}>{myProfileName}</Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleTag}
            >
              <Entypo name="price-tag" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Tag Pets</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✍️ Caption Input */}
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor="#999"
          style={styles.captionInput}
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        {/* 🐾 Tag Section */}
        <Text style={styles.sectionTitle}>Tagged Pets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {taggedPets.map((pet) => 
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petCard,
                  { borderColor: Colors.primary, borderWidth: 2 },
                ]}
                onPress={() => togglePetTag(pet.id)}
              >
                <Image source={{ uri: pet.img_path }} style={styles.petImage} />
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>
            )}
        </ScrollView>

        {/* 🗞️ Original Post Preview */}
        <View style={[styles.postCard, ShadowStyle]}>
          <View style={styles.row}>
            <Image
              source={{ uri: parsedPost.creator_img_path }}
              style={styles.profileImage}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>{parsedPost.creator_name}</Text>
              <Text style={styles.postTime}>{parsedPost.date_ago}</Text>
            </View>
          </View>
          <Text style={styles.content}>{parsedPost.body}</Text>
          { parsedPost.img_paths && parsedPost.img_paths?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {parsedPost.img_paths.map((img: string, idx: number) => (
                <Image key={idx} source={{ uri: img }} style={styles.image} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* 🚀 Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share Now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ⚠️ Exit Modal */}
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
                style={[styles.modalBtn, { backgroundColor: "#f1f1f1" }]}
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

export default SharePost;

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ddd",
  },
  profileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    marginLeft: 4,
  },
  captionInput: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 90,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    color: "#333",
  },
  petCard: {
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  petImage: { width: 60, height: 60, borderRadius: 30 },
  petName: { fontSize: 12, marginTop: 4, color: "#333" },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: "600", fontSize: 14, color: "#222" },
  postTime: { fontSize: 12, color: "#888" },
  content: { fontSize: 14, color: "#333", marginVertical: 8 },
  image: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 8,
  },
  shareBtn: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    ...ShadowStyle,
  },
  shareText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 14,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
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
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
