import { useAppContext } from "@/AppsProvider";
import { all } from "@/helpers/db";
import { saveAdoptPet } from "@/helpers/savedItems";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const dummyPosts = [
  {
    id: "1",
    ownerName: "Sophie Carter",
    ownerAvatar: "https://randomuser.me/api/portraits/women/47.jpg",
    caption: "Milo is a friendly pup looking for a loving home 🐕💛",
    species: "Dog",
    saved: false,
    images: [
      "https://i.pinimg.com/564x/42/5f/a8/425fa8e6e5e004ae3a4d226fa93e9aeb.jpg",
      "https://i.pinimg.com/564x/59/0f/73/590f73fdc18a5c34c702d4f6b067bfb5.jpg",
      "https://i.pinimg.com/564x/66/32/14/6632149c8c71cfaa31910f8ff3d7f630.jpg",
      "https://i.pinimg.com/564x/27/a4/f0/27a4f0a2d85a3d21c80e7a04127195e1.jpg",
    ],
  },
  {
    id: "2",
    ownerName: "Daniel Smith",
    ownerAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    caption: "Luna is gentle and loves cuddles 🐾",
    species: "Cat",
    saved: false,
    images: [
      "https://i.pinimg.com/564x/f8/f6/36/f8f636eb8032c6850865b4b3cf2e7ef2.jpg",
    ],
  },
];

const Adapt = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    id,
    caption,
    petCategory,
    petImage,
    ownerId,
    ownerName,
    ownerImage,
    saveCategory,
  } = useLocalSearchParams();

  const { userId, userName, userImagePath } = useAppContext();

  //bagong code
  React.useEffect(() => {
    const fetchAdoptionPosts = async () => {
      try {
        // setIsLoading(true);
        const snapshot = await all("post-adopt");
        const data = snapshot.docs.map((doc) => {
          const d = doc.data() as any;

          let image: string | null = null;

          if (typeof d.petImage === "string" && d.petImage.trim() !== "") {
            image = d.petImage;
          } else if (
            typeof d.ownerImg === "string" &&
            d.ownerImg.trim() !== ""
          ) {
            // fallback image
            image = d.ownerImg;
          }

          return {
            id: doc.id,
            category: d.petCategory,
            caption: d.caption,
            petImage: image,
            ownerId: d.userId,
            ownerName: d.userName,
            ownerImage: d.userImage,
          };
        });
        setPosts(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchAdoptionPosts();
  }, []);

  // const toggleSave = (id: string) => {
  //   setPosts((prev) =>
  //     prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
  //   );
  // };
  // const { userId } = useAppContext();
  const handleSaveItem = async (item: (typeof posts)[0]) => {
    if (!userId) {
      alert("You must be logged in to save items.");
      return;
    }

    if (!item.id) {
      alert("Post ID is missing!");
      return;
    }

    await saveAdoptPet(userId, {
      id: item.id,
      caption: item.caption,
      petCategory: item.category,
      petImage: item.petImage,
      ownerId: item.ownerId,
      ownerName: item.ownerName,
      ownerImage: item.ownerImage,
      saveCategory: item.saveCategory,
    });

    alert("Item saved to your collection!");
  };

  const handleChat = (name: string, ownerId: string, ownerImage: string) => {
    router.push({
      pathname: "/pet-owner/(chat)/chat-field",
      params: {
        // userId: userId,
        // userImagePath: ownerImage,
        // userName: ownerName,
        otherUserId: ownerId,
        otherUserName: name,
        otherUserImgPath: ownerImage,
      },
    });
  };

  const speciesList = ["All", "Dog", "Cat", "Rabbit"];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.caption.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies =
      selectedSpecies === "All" || p.category === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const renderPost = ({ item }: { item: (typeof posts)[0] }) => {
    const postImage = item.petImage;
    // const maxImagesToShow = 3;
    // const extraImages = postImages.length - maxImagesToShow;

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: item.ownerImage }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            <Text style={styles.subtext}>
              Posted a pet for adoption • {item.category}
            </Text>
          </View>
          <Entypo name="dots-three-horizontal" size={18} color="#555" />
        </View>

        {/* Caption */}
        {item.caption ? (
          <Text style={styles.captionText}>{item.caption}</Text>
        ) : null}

        {/* Image Grid */}
        {postImage && (
          <View style={styles.imageGrid}>
            <Pressable
              style={styles.imageWrapper}
              onPress={() => {
                setSelectedPostImages([postImage]); // for modal compatibility
                setSelectedIndex(0);
                setImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: postImage }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        )}

        {/* Actions */}

        {item.ownerId !== userId && 
          <View style={styles.actionBar}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleSaveItem(item)}
            >
              <Feather
                name="bookmark"
                size={20}
                color={item.saved ? Colors.primary : "#374151"}
              />
              <Text
                style={[
                  styles.actionLabel,
                  { color: item.saved ? Colors.primary : "#374151" },
                ]}
              >
                {item.saved ? "Saved" : "Save"}
              </Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                handleChat(item.ownerName, item.ownerId, item.ownerImage)
              }
            >
              <Ionicons name="chatbubble-outline" size={20} color="#374151" />
              <Text style={styles.actionLabel}>Chat</Text>
            </Pressable>
          </View>
        }
      </View>
    );
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Adoption Feed"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#000" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets or owners..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={speciesList}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedSpecies(item)}
              style={[
                styles.filterPill,
                selectedSpecies === item && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSpecies === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Post List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
      />

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{
              x: selectedIndex * Dimensions.get("window").width,
              y: 0,
            }}
          >
            {selectedPostImages.map((img, idx) => (
              <View key={idx} style={styles.fullImageWrapper}>
                <Image source={{ uri: img }} style={styles.fullImage} />
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </Modal>

      {/*  Moda for deletion*/}
      {/* <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    {selectedPet
                      ? `What do you want to do with ${selectedPet.name}?`
                      : "Pet Actions"}
                  </Text>
      
                  <TouchableOpacity onPress={handleEdit} style={styles.modalButton}>
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text style={[styles.modalButtonText, { color: Colors.primary }]}>
                      Edit Pet
                    </Text>
                  </TouchableOpacity>
      
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setModalVisible(false);
                      setConfirmVisible(true);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    <Text style={[styles.modalButtonText, { color: "#E74C3C" }]}>
                      Delete Pet
                    </Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal> */}

      {/* Floating Create Post Button */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/usable/post-adapt")}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

export default Adapt;

const styles = StyleSheet.create({
  searchFilterContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  filterPill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: "#374151",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  postList: {
    padding: 16,
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 10
  },
  postHeader: {
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
  captionText: {
    fontSize: 14,
    color: "#1F2937",
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 5,
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  actionBar: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
    alignItems: "center",
    paddingVertical: 8,
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
  divider: {
    width: 1,
    height: 20,
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
