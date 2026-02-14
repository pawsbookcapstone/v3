import { useAppContext } from "@/AppsProvider";
import MapComponent from "@/components/MapComponent";
import { remove } from "@/helpers/db";
import { saveItemForUser } from "@/helpers/savedItems";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const ItemDetails = () => {
  const router = useRouter();
  const {
    id,
    name,
    price,
    description,
    image,
    location,
    seller,
    sellerImage,
    saveCategory,
    otherUserId,
  } = useLocalSearchParams();

  const idSTR = id as string;

  const [activeIndex, setActiveIndex] = useState(0);

  // Handle multiple or single images
  const images = (() => {
    try {
      const parsed = JSON.parse(image as string);
      return Array.isArray(parsed) ? parsed : [image];
    } catch {
      return [image];
    }
  })();

  const { userId } = useAppContext(); // current logged-in user

  const handleSaveItem = async () => {
    if (!userId) {
      alert("You must be logged in to save items.");
      return;
    }

    await saveItemForUser(userId, {
      id: id as string,
      title: name as string,
      price: Number(price),
      images: images as string[],
      ownerId: otherUserId as string,
      ownerName: seller as string,
      ownerImage: sellerImage as string,
      saveCategory: saveCategory as string,
      description: description as string,
    });

    alert("Item saved to your collection!");
  };

  const handleChat = () => {
    console.log(id, seller, sellerImage);
    router.push({
      pathname: "/pet-owner/(chat)/chat-field",
      params: {
        // userId: userId,
        // userImagePath: ownerImage,
        // userName: ownerName,
        otherUserId: otherUserId,
        otherUserName: seller,
        otherUserImgPath: sellerImage,
      },
    });
  };

  const handleDelete = () => {
    try {
      remove("marketPlace", idSTR);
      router.push("/pet-owner/(tabs)/market-place");
    } catch {
      console.error();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions onBack={() => router.back()} />
      </HeaderLayout>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel with Dots */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const scrollX = event.nativeEvent.contentOffset.x;
              const index = Math.round(scrollX / screenWidth);
              setActiveIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img as string }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dot Indicators */}
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { opacity: index === activeIndex ? 1 : 0.3 },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Info */}
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemPrice}>₱{Number(price).toLocaleString()}</Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.Button, { backgroundColor: Colors.buttonlogin }]}
            onPress={handleSaveItem}
          >
            <FontAwesome name="bookmark" size={20} color={"#000"} />
            <Text style={[styles.buttonText, { color: "#000" }]}>Save</Text>
          </Pressable>

          {otherUserId === userId ? (
            <Pressable style={styles.deleteBTN} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.Button} onPress={handleChat}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.buttonText}>Message</Text>
            </Pressable>
          )}

          {/* <Pressable style={styles.Button} onPress={handleChat}>
            <Ionicons name="chatbubble" size={20} color={"#fff"} />
            <Text style={styles.buttonText}>Message</Text>
          </Pressable> */}
        </View>

        <View style={styles.devider} />

        {/* Description */}
        <Text style={styles.title}>Description</Text>
        <Text style={styles.itemDesc}>{description}</Text>

        <View style={styles.devider} />

        {/* Seller Information */}
        <Text style={styles.title}>Seller Information</Text>
        <View style={styles.sellerRow}>
          <Image
            source={{
              uri:
                (sellerImage as string) ||
                "https://via.placeholder.com/100x100.png?text=User",
            }}
            style={styles.sellerAvatar}
          />
          <Text style={styles.infoValue}>{seller}</Text>
        </View>

        <View style={styles.devider} />

        {/* Location */}
        <Text style={styles.title}>Meetup Preference</Text>
        <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
          <Octicons name="location" size={22} color={Colors.primary} />
          <Text style={[styles.infoValue, { fontFamily: "Roboto" }]}>
            {location}
          </Text>
        </View>

        <View style={styles.mapcontainer}>
          <MapComponent address={location as string} />
        </View>

        <Text style={styles.bottomNote}>
          If you’re interested or have any questions about this item, feel free
          to message the seller for more details and meetup arrangements.
        </Text>
      </ScrollView>

      {/* Bottom note */}
    </View>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: "white",
    borderRadius: 25,
    width: "95%",
    alignSelf: "center",
    marginTop: 5,
    paddingBottom: 70,
  },

  // 🔹 Image Carousel Styles
  carouselContainer: {
    position: "relative",
    width: "100%",
    height: 230,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  itemImage: {
    width: screenWidth * 0.95,
    height: 230,
    borderRadius: 12,
    marginRight: 5,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  itemName: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 5,
    alignSelf: "center",
    gap: 10,
    marginBottom: 20,
  },
  Button: {
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBTN: {
    borderRadius: 10,
    backgroundColor: Colors.red,
    paddingHorizontal: 50,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Roboto",
  },
  title: {
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginTop: 10,
    marginBottom: 5,
  },
  itemDesc: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#555",
    marginBottom: 20,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray,
  },
  devider: {
    borderWidth: 0.2,
    borderColor: "#ccc",
    alignSelf: "center",
    width: "100%",
  },
  mapcontainer: {
    marginTop: 10,
    borderRadius: 30,
    marginBottom: 20,
    width: "100%",
    height: 200,
  },
  bottomNote: {
    fontSize: 13,
    color: "#acacacff",
    textAlign: "center",
    fontFamily: "Roboto",
    lineHeight: 18,
    position: "absolute",
    bottom: 10,
    marginHorizontal: 10,
    alignSelf: "center",
  },
});
