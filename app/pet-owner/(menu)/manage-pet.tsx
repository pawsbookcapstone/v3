import { useAppContext } from "@/AppsProvider";
import { all, remove } from "@/helpers/db";
import { useLoadingHook } from "@/hooks/loadingHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import SkeletonPetCard from "@/shared/components/PetSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Entypo, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const ManagePet = () => {
  const [pets, setPets] = useState<{ [key: string]: any }[]>([
    // {
    //   id: 1,
    //   name: "Buddy",
    //   species: "Dog",
    //   breed: "Golden Retriever",
    //   gender: "Male",
    //   age: "3 years",
    //   vaccines: "Rabies, Parvo, Distemper",
    //   photo: "https://placedog.net/800/600?id=1",
    // },
    // {
    //   id: 2,
    //   name: "Mittens",
    //   species: "Cat",
    //   breed: "Persian",
    //   gender: "Female",
    //   age: "2 years",
    //   vaccines: "Feline Viral, Rabies",
    //   photo: "",
    // },
    // {
    //   id: 3,
    //   name: "Chirpy",
    //   species: "Bird",
    //   breed: "Parakeet",
    //   gender: "Male",
    //   age: "1 year",
    //   vaccines: "Avian Pox",
    //   photo:
    //     "https://upload.wikimedia.org/wikipedia/commons/4/45/Budgerigar_1.jpg",
    // },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { userId } = useAppContext();

  const renderLoadingButton = useLoadingHook(true)

  useOnFocusHook(() => {
    onRefresh();
  }, []);

  const handleDelete = async () => {
    await remove("users", userId, "pets", selectedPet.id);
    await onRefresh();
    // setPets((prev) => prev.filter((p) => p.id !== id));
    setConfirmVisible(false);
    setModalVisible(false);
    ToastAndroid.show("Pet deleted successfully!", ToastAndroid.SHORT);
  };

  const handleAddPet = () => {
    router.push("/pet-owner/add-pet");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const petsSnap = await all("users", userId, "pets");

      setPets(
        petsSnap.docs.map((pet) => {
          let data = pet.data();
          data.id = pet.id;
          if (data.vaccines && data.vaccines.length > 0) {
            data.vaccine_names = data.vaccines
              .map((vaccine: any) => vaccine.name)
              .join(", ");
          }
          return data;
        })
      );
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // setTimeout(() => {
    //   setLoading(false);
    //   setRefreshing(false);
    // }, 1200);
  };

  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) return pets;
    const lower = searchQuery.toLowerCase();
    return pets.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.species.toLowerCase().includes(lower) ||
        p.breed.toLowerCase().includes(lower)
    );
  }, [searchQuery, pets]);

  const handleEdit = () => {
    setModalVisible(false);
    router.push({
      pathname: "/pet-owner/edit-pet",
      params: {
        ...selectedPet,
        vaccines: JSON.stringify(selectedPet.vaccines),
      },
    });
  };

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Manage Pets"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={24} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pets by name, species, or breed..."
          placeholderTextColor={Colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {loading ? (
          <>
            <SkeletonPetCard />
            <SkeletonPetCard />
            <SkeletonPetCard />
          </>
        ) : filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <View key={pet.name} style={[styles.postCard]}>
              {pet.img_path ? (
                <Image source={{ uri: pet.img_path }} style={styles.petPhoto} />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <FontAwesome name="paw" size={48} color={Colors.white} />
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}

              <View style={styles.infoSection}>
                <View style={styles.headerRow}>
                  <Text style={styles.petName}>
                    {pet.name}{" "}
                    <Text style={styles.petBreed}>({pet.breed})</Text>
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPet(pet);
                      setModalVisible(true);
                    }}
                  >
                    <Entypo name="dots-three-vertical" size={18} color="#777" />
                  </TouchableOpacity>
                </View>

                <View style={styles.speciesTag}>
                  <FontAwesome
                    name="paw"
                    size={12}
                    color={Colors.white}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.speciesText}>{pet.species}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.detailText}>{pet.gender}, </Text>
                  <Text style={styles.detailText}>{pet.age}</Text>
                </View>

                {pet.vaccine_names ? (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Vaccines: </Text>
                    <Text style={styles.italic}>{pet.vaccine_names}</Text>
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="search" size={50} color={Colors.gray} />
            <Text style={styles.emptyText}>No pets match your search.</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPet}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Main Action Modal */}
      <Modal
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
      </Modal>

      {/* Confirmation Modal */}
      {confirmVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Confirm Deletion</Text>
              <Text style={styles.confirmText}>
                Are you sure you want to delete{" "}
                <Text style={{ fontWeight: "700" }}>{selectedPet?.name}</Text>?
              </Text>

              <View style={styles.confirmActions}>
                {renderLoadingButton({
                  style: [
                    styles.confirmBtn,
                    { backgroundColor: Colors.primary },
                  ],
                  children: <Text style={styles.confirmBtnText}>Yes, Delete</Text>,
                  loadingText: "Deleting",
                  onPress: handleDelete
                })}
                {/* <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: Colors.primary },
                  ]}
                  onPress={handleDelete}
                >
                  <Text style={styles.confirmBtnText}>Yes, Delete</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setConfirmVisible(false)}
                >
                  <Text style={[styles.confirmBtnText, { color: "#333" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ManagePet;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    margin: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#808080",
    flex: 1,
    paddingVertical: 4,
  },
  postCard: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: "hidden",
    padding: 10,
  },
  petPhoto: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  placeholderPhoto: {
    width: "100%",
    height: 220,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  placeholderText: {
    marginTop: 6,
    color: Colors.white,
    fontSize: 14,
    opacity: 0.9,
  },
  infoSection: {
    padding: 0,
    marginTop: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.darkGray,
  },
  petBreed: {
    fontSize: 14,
    color: Colors.gray,
  },
  speciesTag: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "flex-start",
    marginVertical: 8,
  },
  speciesText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13.5,
    color: Colors.black,
  },
  label: {
    fontWeight: "600",
  },
  italic: {
    fontStyle: "italic",
    color: Colors.darkGray,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    ...ShadowStyle,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.white,
    // borderRadius: 20,
    padding: 20,
    width: "85%",
    ...ShadowStyle,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: Colors.darkGray,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  confirmCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 15,
    textAlign: "center",
    color: Colors.darkGray,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
