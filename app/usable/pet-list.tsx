import { useAppContext } from "@/AppsProvider";
import { all } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const dummyPets = [
  { id: "1", name: "Bella", image: "https://i.pravatar.cc/100?img=12" },
  { id: "2", name: "Charlie", image: "https://i.pravatar.cc/100?img=15" },
  { id: "3", name: "Max", image: "https://i.pravatar.cc/100?img=20" },
  { id: "4", name: "Luna", image: "https://i.pravatar.cc/100?img=25" },
];

const PetList = () => {
  const { userId, func } = useAppContext();

  const [search, setSearch] = useState("");
  const [selectedPets, setSelectedPets] = useState<{ [key: string]: any }[]>(
    []
  );
  const [pets, setPets] = useState<{ [key: string]: any }[]>([]);

  const filteredPets = pets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchPets = async () => {
      const snap = await all("users", userId, "pets");

      setPets(
        snap.docs.map((pet) => {
          let data = pet.data();
          data.id = pet.id;
          return data;
        })
      );
    };
    fetchPets();
  }, []);

  const toggleSelect = (pet: any) => {
    if (selectedPets.some((p: any) => p.id === pet.id)) {
      setSelectedPets((prev) => prev.filter((p: any) => p.id !== pet.id));
    } else {
      setSelectedPets((prev) => [...prev, pet]);
    }
  };

  const handleDone = () => {
    func.call(selectedPets);
    router.back();
    // setTimeout(() => {
    //   router.push({
    //     pathname: "/pet-owner/(home)/post",
    //     params: { taggedPets: JSON.stringify(selectedPets) },
    //   });
    // }, 50);
  };

  return (
    <KeyboardAvoidingView
      style={[screens.screen, { backgroundColor: "#F9FAFB", flex: 1 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          onBack={() => router.back()}
          centerTitle
          title="Tag Pets"
        />
      </HeaderLayout>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#000"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search pets..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* PET LIST */}
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selectedPets.some((p) => p.id === item.id);
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.petCard, isSelected && styles.selectedCard]}
              onPress={() => toggleSelect(item)}
            >
              <Image source={{ uri: item.img_path }} style={styles.petAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petSubtext}>Tap to tag this pet</Text>
              </View>
              {isSelected && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No pets found</Text>}
      />

      {/* DONE BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.doneBtn,
            selectedPets.length === 0 && { opacity: 0.4 },
          ]}
          disabled={selectedPets.length === 0}
          onPress={handleDone}
        >
          <Text style={styles.doneText}>Done ({selectedPets.length || 0})</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PetList;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 4,
  },
  listContainer: {
    paddingHorizontal: 5,
    paddingTop: 15,
    paddingBottom: 120,
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedCard: {
    // borderColor: Colors.primary,
    // backgroundColor: "#F0F9FF",
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  petSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  checkCircle: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 60,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
