import { useAppContext } from "@/AppsProvider";
import ActionMenuModal from "@/components/modals/ActionModal";
import { all, remove } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  findNodeHandle,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// const dummyLostFound = [
//   {
//     id: "1",
//     ownerName: "Liam Walker",
//     ownerAvatar: "https://randomuser.me/api/portraits/men/56.jpg",
//     caption: "🚨 Lost near Central Park! Please contact if seen 🐕",
//     petImages: [
//       "https://i.pinimg.com/564x/24/7f/2d/247f2da68e0f94cb6cfb4d43f8d67e11.jpg",
//       "https://i.pinimg.com/564x/75/8c/ae/758cae1b934e79b32e5796c9f5f7077b.jpg",
//       "https://i.pinimg.com/564x/7b/92/ed/7b92ed4a1776b81e80d38213f6bfa5a2.jpg",
//     ],
//     species: "Dog",
//   },
//   {
//     id: "2",
//     ownerName: "Ella Brown",
//     ownerAvatar: "https://randomuser.me/api/portraits/women/18.jpg",
//     caption: "✅ Found this adorable kitten near Green Avenue 🐱",
//     petImages: [
//       "https://placedog.net/400/300?id=1",
//       "https://placedog.net/400/301?id=2",
//       "https://placedog.net/400/302?id=3",
//       "https://placedog.net/400/303?id=4",
//     ],
//     species: "Cat",
//   },
//   {
//     id: "3",
//     ownerName: "Noah Lee",
//     ownerAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
//     caption: "Lost rabbit near Maple Street. Very friendly! 🐇",
//     petImages: [
//       "https://i.pinimg.com/564x/0e/f1/4b/0ef14b73e2c21eeafef812ca36c7fbe0.jpg",
//       "https://i.pinimg.com/564x/5f/b8/f0/5fb8f061a3acbd244eab2e01f5f263a2.jpg",
//       "https://i.pinimg.com/564x/fc/8f/73/fc8f7368a2e1a0cf7c1c21dbf10d53c9.jpg",
//       "https://i.pinimg.com/564x/30/d7/90/30d7906239400b7b0a9d4d5549a9377f.jpg",
//     ],
//     species: "Rabbit",
//   },
// ];

const LostFound = () => {
  const [search, setSearch] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState("");

  //for action modal
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const buttonRef = useRef(null);

  const openMenu = (id: any) => {
    setSelectedPost(id);
    console.log(selectedPost);
    if (buttonRef.current) {
      const handle = findNodeHandle(buttonRef.current);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          setPosition({
            x: pageX - 110, // adjust left/right
            y: pageY + height, // show below button
          });

          setVisible(true);
          // setSelectedPost(id);
          // console.log(selectedPost);
          // deleteMypost(id)
        });
      }
    }
  };
  const deleteMypost = async () => {
    // if (!selectedPost) {
    //   return;
    // }
    await remove("lost-and-found", selectedPost);
    Alert.alert("Item Deleted!");
    fetchLostAndFound();
  };

  //bagong code
  const [lostAndFoundItems, setLostAndFoundItems] = useState<any[]>([]);
  const { userId, userName, userImagePath } = useAppContext();
  const fetchLostAndFound = async () => {
    try {
      // setIsLoading(true);
      const snapshot = await all("lost-and-found");
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as any;

        let images: string[] = [];
        if (Array.isArray(d.petImages) && d.petImages.length > 0) {
          images = d.petImages;
        } else if (
          typeof d.petImages === "string" &&
          d.petImages.trim() !== ""
        ) {
          images = [d.petImages];
        } else if (d.petImages && typeof d.petImages === "object") {
          images = Object.values(d.petImages).filter(
            (url) => typeof url === "string",
          );
        }
        if (images.length === 0 && d.userImage) {
          images = [d.ownerImg];
        }

        return {
          id: doc.id,
          type: d.type,
          caption: d.caption,
          petImages: images,
          userId: d.userId,
          ownerName: d.userName,
          ownerAvatar: d.userImage,
          species: "undefined",
        };
      });
      setLostAndFoundItems(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      // setIsLoading(false);
    }
  };
  useOnFocusHook(() => {
    fetchLostAndFound();
  }, []);

  const handleChat = (name: string, userId: string, othersImage: string) => {
    router.push({
      pathname: "/pet-owner/(chat)/chat-field",
      params: {
        otherUserId: userId,
        otherUserName: name,
        otherUserImgPath: othersImage,
      },
    });
  };

  const filteredPosts = lostAndFoundItems.filter((p) => {
    const textToSearch = `${p.caption ?? ""} ${p.type ?? ""}`.toLowerCase();
    return textToSearch.includes(search.toLowerCase());
  });

  const renderPost = ({ item }: { item: (typeof lostAndFoundItems)[0] }) => {
    const postImages = (item.petImages ?? []).filter((d: any) => d);

    const maxImagesToShow = 3;
    const extraImages = postImages.length - maxImagesToShow;

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={{ uri: item.ownerAvatar }} style={styles.avatar} />
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              if (userId !== item.userId) {
                router.push({
                  pathname: "/usable/user-profile",
                  params: {
                    userToViewId: item.userId,
                  },
                });
              } else {
                router.push("/pet-owner/profile");
              }
            }}
          >
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            <Text style={styles.subtext}>Posted • {item.species}</Text>
            <Text style={styles.subtext}>Status: {item.type}</Text>
          </Pressable>
          {userId === item.userId ? (
            <Pressable
              ref={buttonRef}
              onPress={() => {
                // setSelectedPost(item.id);
                // console.log(selectedPost);
                openMenu(item.id);
              }}
            >
              <Feather name="more-horizontal" size={22} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.caption}>{item.caption}</Text>

        {/* 🧩 Image Grid */}
        {postImages && postImages.length > 0 && (
          <View style={styles.imageGrid}>
            {postImages
              .slice(0, maxImagesToShow)
              .map((img: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.imageWrapper}
                  onPress={() => {
                    setSelectedPostImages(postImages);
                    setSelectedIndex(idx);
                    setImageModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {idx === maxImagesToShow - 1 && extraImages > 0 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>+{extraImages}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        )}

        {item.userId !== userId && (
          <View style={styles.actionBar}>
            <Pressable
              style={styles.actionButton}
              onPress={() =>
                handleChat(item.ownerName, item.userId, item.ownerAvatar)
              }
            >
              <Feather name="message-circle" size={20} color={Colors.primary} />
              <Text style={[styles.actionLabel, { color: Colors.primary }]}>
                Chat
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Lost & Found"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#000" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lost or found pets..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      {/* ➕ Floating Button */}
      <Pressable
        style={styles.createButton}
        onPress={() =>
          router.push({
            pathname: "/usable/post-lost",
          })
        }
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
      {/* modal for delete or edit */}\{" "}
      <ActionMenuModal
        visible={visible}
        position={position}
        onClose={() => setVisible(false)}
        // onEdit={() =>
        //   router.push({
        //     pathname: "/usable/post-lost",
        //     params: { editPOst: "true" },
        //   })
        // }
        onDelete={() => deleteMypost()}
      />
      {/* 🖼️ Fullscreen Modal */}
      {imageModalVisible && (
        <Modal visible={imageModalVisible} transparent>
          <View style={styles.modalBackground}>
            <FlatList
              data={selectedPostImages}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: Dimensions.get("window").width,
                offset: Dimensions.get("window").width * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={styles.fullImageWrapper}>
                  <Image
                    source={{ uri: item }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              keyExtractor={(_, i) => i.toString()}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default LostFound;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  subtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  caption: {
    fontSize: 14,
    color: "#374151",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  imageWrapper: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  createButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageWrapper: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
