import { getUserSavedItems, remove } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppContext } from "@/AppsProvider";
import { useOnFocusHook } from "@/hooks/onFocusHook";

type BaseSavedItem = {
  id: string;
  saveCategory: "posts" | "marketplace" | "adopt";
  images: string[];
};

type PostItem = BaseSavedItem & {
  saveCategory: "posts";
  title: string;
  description: string;
  time: string;
};

type MarketplaceItem = BaseSavedItem & {
  saveCategory: "marketplace";
  name: string;
  price: string;
  description: string;
  ownerId?: string;
  ownerName: string;
  ownerImage: string;
};

type AdoptItem = BaseSavedItem & {
  saveCategory: "adopt";
  caption: string;
  petCategory: string;
  petImage: string;
  ownerId?: string;
  ownerName: string;
  ownerImage: string;
};

type SavedItem = PostItem | MarketplaceItem | AdoptItem;

const Saved = () => {
  const router = useRouter();
  const { userId } = useAppContext();

  const [activeTab, setActiveTab] = useState<
    "Posts" | "Marketplace" | "Adoption"
  >("Posts");

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [adopt, setAdopt] = useState<AdoptItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  // Fetch saved marketplace items
  useOnFocusHook(() => {
    const fetchSavedItems = async () => {
      if (!userId) return;

      try {
        setLoadingMarketplace(true);

        const snapshot = await getUserSavedItems(userId).where();

        const normalizeImages = (data: any): string[] => {
          if (Array.isArray(data.images) && data.images.length > 0) {
            return data.images;
          }

          if (typeof data.images === "string" && data.images.trim() !== "") {
            return [data.images];
          }

          if (data.images && typeof data.images === "object") {
            return Object.values(data.images).filter(
              (url) => typeof url === "string",
            );
          }

          if (data.petImage) return [data.petImage];
          if (data.ownerImage) return [data.ownerImage];

          return [];
        };

        const items: SavedItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const images = normalizeImages(data);

          switch (data.saveCategory) {
            case "marketplace":
              return {
                id: doc.id,
                saveCategory: "marketplace",
                images,
                name: data.title ?? "No title",
                price: data.price ? String(data.price) : "0",
                description: data.description ?? "",
                ownerId: data.ownerId,
                ownerName: data.ownerName ?? "",
                ownerImage: data.ownerImage ?? "",
              };

            case "posts":
              return {
                id: doc.id,
                saveCategory: "posts",
                images,
                title: data.title ?? "",
                description: data.description ?? "",
                time: data.time ?? "",
              };

            case "adopt":
              return {
                id: doc.id,
                saveCategory: "adopt",
                images,
                caption: data.caption ?? "",
                petCategory: data.petCategory ?? "",
                petImage: data.petImage ?? "",
                ownerId: data.ownerId,
                ownerName: data.ownerName ?? "",
                ownerImage: data.ownerImage ?? "",
              };

            default:
              throw new Error(`Unknown saveCategory: ${data.saveCategory}`);
          }
        });
        console.log(items);
        setSavedItems(items);
      } catch (error) {
        console.error("Error fetching saved items:", error);
      } finally {
        setLoadingMarketplace(false);
      }
    };

    fetchSavedItems();
  }, []);

  const openImageModal = (images: string[], index: number) => {
    setSelectedPostImages(images);
    setSelectedIndex(index);
    setImageModalVisible(true);
  };

  const removeItem = (id: string) => {
    try {
      // Delete from Firestore
      remove("users", userId, "savedItems", id);

      // Remove locally
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
      alert("Saved removed!");
    } catch (error) {
      console.error("Failed to delete saved item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const renderItem = ({ item }: { item: SavedItem }) => {
    let images: string[] = [];
    let title = "";
    let description = "";
    let extraInfo: React.ReactNode = null;

    switch (item.saveCategory) {
      case "posts": {
        const post = item as PostItem;
        images = post.images;
        title = post.title;
        description = post.description;
        extraInfo = <Text style={styles.time}>{post.time}</Text>;
        break;
      }

      case "marketplace": {
        const market = item as MarketplaceItem;
        images = market.images;
        title = market.name;
        description = market.description;
        extraInfo = (
          <View style={styles.ownerRow}>
            <Image
              source={{ uri: market.ownerImage }}
              style={styles.ownerImage}
            />
            <Text style={styles.price}>{market.price}</Text>;
            <Text style={styles.ownerName}>{market.ownerName}</Text>
          </View>
        );

        break;
      }

      case "adopt": {
        const adopt = item as AdoptItem;
        images = adopt.petImage ? [adopt.petImage] : [];
        title = adopt.caption;
        description = adopt.petCategory;
        extraInfo = (
          <View style={styles.ownerRow}>
            <Image
              source={{ uri: adopt.ownerImage }}
              style={styles.ownerImage}
            />
            <Text style={styles.ownerName}>{adopt.ownerName}</Text>
          </View>
        );
        break;
      }
    }

    return (
      <View style={styles.card}>
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.slice(0, 3).map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.imageWrapper}
                onPress={() => openImageModal(images, idx)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          {extraInfo}
        </View>

        <TouchableOpacity
          style={styles.trashButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Saved"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Posts" && styles.activeTab]}
          onPress={() => setActiveTab("Posts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Posts" && styles.activeTabText,
            ]}
          >
            Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Marketplace" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Marketplace")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Marketplace" && styles.activeTabText,
            ]}
          >
            Marketplace
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Adoption" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Adoption")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Adoption" && styles.activeTabText,
            ]}
          >
            Adopt
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={savedItems.filter((item) => {
          switch (activeTab) {
            case "Posts":
              return item.saveCategory === "posts";
            case "Marketplace":
              return item.saveCategory === "marketplace";
            case "Adoption":
              return item.saveCategory === "adopt";
            default:
              return false;
          }
        })}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No saved items in this category.
            </Text>
          </View>
        }
      />

      {/* Image Modal */}
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
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.fullImageWrapper}>
                  <Image
                    source={{ uri: item }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              )}
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

export default Saved;

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    marginLeft: 15,
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  activeTabText: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    ...ShadowStyle,
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.black,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 6,
  },
  trashButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 6,
    ...ShadowStyle,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 16,
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
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  ownerImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#E5E7EB", // placeholder gray
  },

  ownerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151", // neutral dark
  },
});
