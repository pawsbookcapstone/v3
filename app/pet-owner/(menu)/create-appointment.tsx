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

type TProviders = {
  id: string;
  name: string;
  type: string;
  image: string;
};

const dummyProviders: TProviders[] = [
  {
    id: "1",
    name: "Happy Paws Veterinary Clinic",
    type: "Veterinarian",
    image:
      "https://images.unsplash.com/photo-1612831455543-43a0b47c923e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "FurEver Grooming Hub",
    type: "Groomer",
    image:
      "https://images.unsplash.com/photo-1601758123927-1965c9b7a4b1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Pawsitive Training Center",
    type: "Trainer",
    image:
      "https://images.unsplash.com/photo-1598133894008-1a94c7dd6c4c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Healthy Tails Pet Spa",
    type: "Groomer",
    image:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80",
  },
];

const CreateAppointment = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = dummyProviders.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleAppointment = (provider: TProviders) => {
    // Navigate to set-appointment and pass provider data
    router.push({
      pathname: "/usable/set-appointment",
      params: {
        providerId: provider.id,
        providerName: provider.name,
        providerType: provider.type,
        providerImage: provider.image,
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
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handleAppointment(item)}
          >
            {/* ${item.id} */}
            <Image source={{ uri: item.image }} style={styles.image} />
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
