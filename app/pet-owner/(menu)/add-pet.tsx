import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add } from "@/helpers/db";
import { useLoadingHook } from "@/hooks/loadingHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const AddPet = () => {
  const { userId } = useAppContext();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [species, setSpecies] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [hasVaccine, setHasVaccine] = useState(false);

  // Vaccine State
  const [vaccines, setVaccines] = useState<{ name: string; date: string }[]>([
    { name: "", date: "" },
  ]);
  const [showDatePicker, setShowDatePicker] = useState<{
    visible: boolean;
    index: number | null;
  }>({ visible: false, index: null });

  // Modals
  const [speciesModal, setSpeciesModal] = useState(false);
  const [breedModal, setBreedModal] = useState(false);

  // Animations
  const speciesAnim = useRef(new Animated.Value(400)).current;
  const breedAnim = useRef(new Animated.Value(400)).current;

  const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit"];
  const breedOptions: Record<string, string[]> = {
    Dog: ["Labrador", "German Shepherd", "Bulldog", "Poodle"],
    Cat: ["Persian", "Siamese", "Maine Coon", "Bengal"],
    Bird: ["Parrot", "Canary", "Finch"],
    Rabbit: ["Holland Lop", "Lionhead", "Mini Rex"],
  };

  const renderLoadingButton = useLoadingHook(true)

  // Animations for modals
  const openModal = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    anim: Animated.Value
  ) => {
    setter(true);
    setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 50);
  };

  const closeModal = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    anim: Animated.Value
  ) => {
    Animated.timing(anim, {
      toValue: 400,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setter(false));
  };

  // Image Picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Vaccine Handlers
  const addVaccine = () => setVaccines([...vaccines, { name: "", date: "" }]);

  const removeVaccine = (index: number) => {
    setVaccines(vaccines.filter((_, i) => i !== index));
  };

  const updateVaccineName = (text: string, index: number) => {
    const updated = [...vaccines];
    updated[index].name = text;
    setVaccines(updated);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (showDatePicker.index === null) return;
    setShowDatePicker({ visible: false, index: null });

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      const updated = [...vaccines];
      updated[showDatePicker.index].date = formatted;
      setVaccines(updated);
    }
  };

  const handleSave = async () => {
    if (!name || !species || !breed || !gender || !profileImage) throw "Please fill all fields!!!"

    let data: any = {};
    if (hasVaccine) {
      const _vaccines = vaccines.filter(
        (vaccine) => vaccine.name && vaccine.date
      );
      if (_vaccines.length == 0)
        throw "Please provide vaccine name and date!!!";
        
      data.vaccines = _vaccines;
    }

    if (profileImage) {
      const imgUrl = await uploadImageUri(profileImage);
      data.img_path = imgUrl;
    }

    await add("users", userId, "pets").value({
      name: name,
      species: species,
      breed: breed,
      age: age,
      gender: gender,
      ...data,
    });
    router.back()
  };

  return (
    <View style={[screens.screen, { backgroundColor: "#fff" }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Add Pet"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileWrapper}>
          <TouchableOpacity onPress={pickImage} style={styles.profileContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <FontAwesome5 name="paw" size={40} color={Colors.primary} />
            )}
          </TouchableOpacity>
          <Text style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
            Tap to add profile photo
          </Text>
        </View>

        {/* Pet Name */}
        <Text style={styles.label}>Pet Name</Text>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="paw" size={18} color={Colors.primary} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter pet name"
            style={styles.input}
          />
        </View>

        {/* Species Dropdown */}
        <Text style={styles.label}>Species</Text>
        <TouchableOpacity
          style={[styles.inputContainer, { height: 65 }]}
          onPress={() => openModal(setSpeciesModal, speciesAnim)}
        >
          <FontAwesome5 name="dog" size={18} color={Colors.primary} />
          <Text style={styles.dropdownText}>{species || "Select Species"}</Text>
        </TouchableOpacity>

        {/* Breed Dropdown */}
        <Text style={styles.label}>Breed</Text>
        <TouchableOpacity
          style={[styles.inputContainer, { height: 65 }]}
          onPress={() => openModal(setBreedModal, breedAnim)}
          disabled={!species}
        >
          <FontAwesome5 name="bone" size={18} color={Colors.primary} />
          <Text style={styles.dropdownText}>{breed || "Select Breed"}</Text>
        </TouchableOpacity>

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="calendar" size={18} color={Colors.primary} />
          <TextInput
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {["Male", "Female"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderOption,
                gender === g && styles.genderSelected,
              ]}
              onPress={() => setGender(g as "Male" | "Female")}
            >
              <FontAwesome5
                name={g === "Male" ? "mars" : "venus"}
                size={18}
                color={gender === g ? "#fff" : Colors.primary}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === g && { color: "#fff", fontWeight: "600" },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vaccine Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setHasVaccine(!hasVaccine)}
        >
          <FontAwesome5
            name={hasVaccine ? "check-square" : "square"}
            size={20}
            color={Colors.primary}
          />
          <Text style={{ marginLeft: 8 }}>Has Vaccine?</Text>
        </TouchableOpacity>

        {/* Vaccines */}
        {hasVaccine && (
          <>
            <Text style={styles.label}>Vaccines</Text>
            {vaccines.map((v, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <View style={styles.inputContainer}>
                  <FontAwesome5
                    name="syringe"
                    size={18}
                    color={Colors.primary}
                  />
                  <TextInput
                    placeholder={`Vaccine ${index + 1} Name`}
                    value={v.name}
                    onChangeText={(text) => updateVaccineName(text, index)}
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.inputContainer, { marginTop: 5 }]}
                  onPress={() => setShowDatePicker({ visible: true, index })}
                >
                  <FontAwesome5
                    name="calendar-alt"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text
                    style={[styles.input, { color: v.date ? "#000" : "#888" }]}
                  >
                    {v.date || "Select vaccination date"}
                  </Text>
                  {vaccines.length > 1 && (
                    <TouchableOpacity onPress={() => removeVaccine(index)}>
                      <FontAwesome5 name="trash" size={18} color="red" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={addVaccine}>
              <FontAwesome5
                name="plus-circle"
                size={18}
                color={Colors.primary}
              />
              <Text style={{ marginLeft: 6, color: Colors.primary }}>
                Add Another Vaccine
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* -------- Species Modal -------- */}
      <Modal visible={speciesModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: speciesAnim }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Species</Text>
              <TouchableOpacity
                onPress={() => closeModal(setSpeciesModal, speciesAnim)}
              >
                <FontAwesome5 name="times" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {speciesOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  setSpecies(item);
                  setBreed("");
                  closeModal(setSpeciesModal, speciesAnim);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* -------- Breed Modal -------- */}
      <Modal visible={breedModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: breedAnim }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Breed</Text>
              <TouchableOpacity
                onPress={() => closeModal(setBreedModal, breedAnim)}
              >
                <FontAwesome5 name="times" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {(breedOptions[species] || []).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  setBreed(item);
                  closeModal(setBreedModal, breedAnim);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker.visible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {
          renderLoadingButton({
            style: styles.saveBtn,
            children: <Text style={styles.saveBtnText}>Save</Text>,
            onPress: handleSave
          })
        }
        {/* <TouchableOpacity style={styles.saveBtn} onPressIn={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default AddPet;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  profileWrapper: { alignItems: "center", marginBottom: 20 },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 50 },
  label: { fontSize: 14, marginTop: 12, marginBottom: 6, fontWeight: "500" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, marginLeft: 10 },
  dropdownText: { marginLeft: 10, color: "#444" },
  addBtn: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 0.48,
    justifyContent: "center",
  },
  genderSelected: { backgroundColor: Colors.primary },
  genderText: { marginLeft: 8, color: Colors.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
