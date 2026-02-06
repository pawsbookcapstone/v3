import { get } from "@/helpers/db";
import { useNotificationHook } from "@/hooks/notificationHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import SkeletonMarketCard from "@/shared/components/MarketSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Feather, Octicons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const marketPlace = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const hasNotif = useNotificationHook()
  // const onRefresh = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);
  // };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarketItems();
    setRefreshing(false);
  };

  useEffect(() => {
    setTimeout(() => {
      onRefresh();
      setLoading(false);
    }, 2000);
  }, []);

  // Categories
  const categories = ["Dogs", "Cats", "Food", "Accessories"];

  useFocusEffect(
    useCallback(() => {
      fetchMarketItems();
    }, []),
  );

  const [marketItems, setMarketItems] = useState<any[]>([]);
  const fetchMarketItems = async () => {
    try {
      setLoading(true);

      const query = await get("marketPlace").where(
        where("status", "==", "available"),
      );

      const items = query.docs.map((doc) => {
        const data = doc.data();

        let images: string[] = [];
        if (Array.isArray(data.images) && data.images.length > 0) {
          images = data.images;
        } else if (
          typeof data.images === "string" &&
          data.images.trim() !== ""
        ) {
          images = [data.images];
        } else if (data.images && typeof data.images === "object") {
          images = Object.values(data.images).filter(
            (url) => typeof url === "string",
          );
        }
        if (images.length === 0 && data.ownerImg) {
          images = [data.ownerImg];
        }

        return {
          id: doc.id,
          name: data.title || "No title",
          description: data.description || "",
          title: data.title || "",
          category: data.category || "Uncategorized",
          price: data.price || 0,
          image: images,
          ownerName: data.ownerName || "Unknown",
          ownerImg: data.ownerImg || null,
          ownerId: data.ownerId,
        };
      });

      setMarketItems(items);
      // console.log(
      //   "Fetched marketplace item ownerIds:",
      //   items.map((item) => item.ownerId),
      // );
    } catch (error) {
      console.log("Error fetching marketplace items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered items by search + category
  // const filteredItems = marketItems.filter(
  //   (item) =>
  //     (selectedCategory ? item.category === selectedCategory : true) &&
  //     (item.name.toLowerCase().includes(search.toLowerCase()) ||
  //       item.description.toLowerCase().includes(search.toLowerCase()))
  // );

  const filteredItems = marketItems.filter(
    (item) =>
      (selectedCategory ? item.category === selectedCategory : true) &&
      ((item.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.description?.toLowerCase() || "").includes(search.toLowerCase())),
  );

  const renderItem = ({ item }: { item: (typeof marketItems)[0] }) => {
    // Normalize image field
    // Normalize image
    let firstImage: string = "";

    if (Array.isArray(item.image)) {
      firstImage = item.image[0] || "";
    } else if (typeof item.image === "string") {
      firstImage = item.image;
    } else if (item.image && typeof item.image === "object") {
      // Convert object values to array and pick first
      firstImage = (Object.values(item.image)[0] as string) || "";
    }

    // Fallback placeholder
    if (!firstImage) firstImage = "https://via.placeholder.com/150";

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/pet-owner/item-details",
            params: {
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              image: Array.isArray(item.image)
                ? JSON.stringify(item.image)
                : typeof item.image === "object"
                  ? JSON.stringify(Object.values(item.image))
                  : item.image,
              location: "Manila, Philippines",
              seller: item.ownerName,
              sellerImage: item.ownerImg,
              otherUserId: item.ownerId,
            },
          })
        }
      >
        <Image
          source={{ uri: firstImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>₱{item.price.toLocaleString()}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <HeaderLayout withLogo noBorderRadius height={90}>
        <Text style={styles.title}>Market Place</Text>
        <View style={styles.iconWrapper}>
          <Link href="/pet-owner/(market)/sell" asChild>
            <Pressable style={styles.sellButton}>
              <Text style={styles.sellText}>Sell</Text>
            </Pressable>
          </Link>
          <Pressable onPress={() => router.push("/pet-owner/notifications")}>
            <Feather name="bell" size={24} color="black" />

                        {
                          hasNotif && 
                                <View
                                  style={{
                                    position: "absolute",
                                    top: -1,
                                    right: 1,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 5,
                                    backgroundColor: "red",
                                  }}
                                />}
          </Pressable>
        </View>
      </HeaderLayout>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={24} color="black" />
          <TextInput
            placeholder="Search Market Place"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>
        <Pressable style={styles.filter} onPress={() => setFilterVisible(true)}>
          <Octicons name="filter" size={24} color="black" />
        </Pressable>
      </View>

      {/* List with skeleton */}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={() => <SkeletonMarketCard />}
          keyExtractor={(item) => item.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ padding: 15 }}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            flexWrap: "wrap",
            paddingHorizontal: 5,
            gap: 0,
            marginHorizontal: 5,
          }}
          contentContainerStyle={{
            paddingBottom: 0,
            flexGrow: 1,
            marginTop: 15,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categorySelected,
                ]}
                onPress={() => {
                  setSelectedCategory(cat === selectedCategory ? null : cat);
                  setFilterVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.closeButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default marketPlace;

const styles = StyleSheet.create({
  iconWrapper: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    alignSelf: "flex-end",
    position: "absolute",
    top: 50,
    marginRight: 10,
  },
  sellButton: {
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
  },
  sellText: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#000",
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    // top: 10,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    flex: 1,
    padding: 8,
  },
  input: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#808080",
    flex: 1,
    paddingVertical: 4,
  },
  filter: {
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    ...ShadowStyle,
    width: "49%",
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 8,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#555",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginTop: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
    marginBottom: 15,
    textAlign: "center",
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  categorySelected: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#fff",
    fontFamily: "RobotoSemiBold",
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "RobotoSemiBold",
  },
});
