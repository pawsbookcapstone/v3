import { collectionName } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CreateAppointment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState<any>([])

  useOnFocusHook(() => {
    collectionName("users")
      .whereEquals("is_page", true)
      .whereNotEquals("allow_appointments", false)
      .getMapped((_, data) => ({
        id: data.id,
        name: data.firstname,
        img_path: data.img_path,
        type: data.categories.join(", ")
      }))
      .then(res => setPages(res))
  }, [])

  const filteredPages = pages.filter((page:any) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleAppointment = (page:any) => {
    // Navigate to set-appointment and pass page data
    router.push({
      pathname: "/usable/set-appointment",
      params: {
        providerId: page.id,
        providerName: page.name,
        providerType: page.type,
        providerImage: page.img_path,
      },
    });
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Make Appointment"
          onBack={() => router.back()}
        />
      </HeaderLayout>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={22} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for veterinarians, groomers, trainers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      {/* Provider List */}
      <FlatList
        data={filteredPages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handleAppointment(item)}
          >
            {/* ${item.id} */}
            <Image source={{ uri: item.img_path }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.type}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No providers found.</Text>
        }
      />
    </View>
  );
};

export default CreateAppointment;

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black || "#222",
  },
  type: {
    fontSize: 14,
    color: Colors.darkGray || "#666",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
    fontSize: 16,
  },
});
