import { Colors } from "@/shared/colors/Colors";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface PetOwnerSignupProps {
  step: number;
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  petName: string;
  setPetName: (val: string) => void;
  species: string;
  setSpecies: (val: string) => void;
  breed: string;
  setBreed: (val: string) => void;
  age: string;
  setAge: (val: string) => void;
  speciesList: string[];
  breedList: string[];
  onNext: () => void;
}

type Pet = {
  name: string;
  species: string;
  breed: string;
  age: string;
  image: string | null; // allow string OR null
};

const PetOwnerSignup: React.FC<PetOwnerSignupProps> = ({
  step,
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  petName,
  setPetName,
  species,
  setSpecies,
  breed,
  setBreed,
  age,
  setAge,
  speciesList,
  breedList,
  onNext,
}) => {
  const [speciesModal, setSpeciesModal] = useState(false);
  const [breedModal, setBreedModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Separate animations for each modal
  const speciesAnim = useRef(new Animated.Value(300)).current;
  const breedAnim = useRef(new Animated.Value(300)).current;
  const [pets, setPets] = useState<Pet[]>([
    { name: "", species: "", breed: "", age: "", image: null },
  ]);
  const openModal = (setter: any, anim: any, index: number) => {
    setter(true);
    setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, 50);
  };

  const closeModal = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    anim: Animated.Value
  ) => {
    Animated.timing(anim, {
      toValue: 300,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => setter(false));
  };

  if (step === 2) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>
              Let’s set up your account so you can easily manage your pets.{" "}
            </Text>
            <Text style={styles.subTitle}>
              Please provide the following details
            </Text>
            <View style={{ flexDirection: "column", gap: 5 }}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <FontAwesome5
                  name="user-alt"
                  size={20}
                  color={Colors.primary}
                />
                <TextInput
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 5 }}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <FontAwesome6 name="phone" size={20} color={Colors.primary} />
                <TextInput
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={{ flexDirection: "column", gap: 5 }}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color={Colors.primary} />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ flexDirection: "column", gap: 5 }}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <FontAwesome5
                  name="lock"
                  size={20}
                  color={Colors.primary}
                  marginLeft={25}
                />

                <TextInput
                  placeholder="Password"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  style={[styles.input, { flex: 1 }]}
                />

                <TouchableOpacity
                  disabled={password.length === 0}
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={{ padding: 5 }}
                >
                  {password.length > 0 ? (
                    <FontAwesome5
                      name={showPassword ? "eye-slash" : "eye"}
                      size={15}
                      color="#ccc"
                      marginRight={10}
                    />
                  ) : (
                    <View style={{ width: 15 }} /> // placeholder keeps layout stable
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ flexDirection: "column", gap: 5 }}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <FontAwesome6
                  name="lock"
                  size={20}
                  color={Colors.primary}
                  marginLeft={25}
                />

                <TextInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { flex: 1 }]}
                />

                <TouchableOpacity
                  disabled={confirmPassword.length === 0}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={{ padding: 5 }}
                >
                  {confirmPassword.length > 0 ? (
                    <FontAwesome5
                      name={showConfirmPassword ? "eye-slash" : "eye"}
                      size={15}
                      marginRight={10}
                      color="#ccc"
                    />
                  ) : (
                    <View style={{ width: 15 }} /> // placeholder keeps layout stable
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={onNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { fontSize: 20 }]}>
          You can add one or more pets to your account.
        </Text>
        <Text style={[styles.subTitle, { fontSize: 14 }]}>
          Please provide the following details
        </Text>

        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {pets.map((pet, index) => (
            <View
              key={index}
              style={{
                borderRadius: 12,
                marginBottom: 40,
              }}
            >
              {/* Pet Image Picker */}
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });

                  if (!result.canceled) {
                    const updatedPets = [...pets];
                    updatedPets[index].image = result.assets[0].uri;
                    setPets(updatedPets);
                  }
                }}
              >
                {pet.image ? (
                  <Image
                    source={{ uri: pet.image }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "#eee",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5 name="camera" size={24} color="#999" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Pet Name */}
              <View style={{ flexDirection: "column", gap: 5 }}>
                <Text style={styles.label}>Pet Name</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5
                    name="user-alt"
                    size={20}
                    color={Colors.primary}
                  />
                  <TextInput
                    placeholder="Pet Name"
                    value={pet.name}
                    onChangeText={(text) => {
                      const updatedPets = [...pets];
                      updatedPets[index].name = text;
                      setPets(updatedPets);
                    }}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Species Dropdown */}
              <View style={{ flexDirection: "column", gap: 5 }}>
                <Text style={styles.label}>Species</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="paw" size={20} color={Colors.primary} />
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() =>
                      openModal(setSpeciesModal, speciesAnim, index)
                    }
                  >
                    <Text style={{ color: pet.species ? "#000" : "#C3C0C0" }}>
                      {pet.species || "Select Species"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Breed Dropdown */}
              <View style={{ flexDirection: "column", gap: 5 }}>
                <Text style={styles.label}>Breed</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="dog" size={20} color={Colors.primary} />
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => openModal(setBreedModal, breedAnim, index)}
                  >
                    <Text style={{ color: pet.breed ? "#000" : "#C3C0C0" }}>
                      {pet.breed || "Select Breed"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Age */}
              <View style={{ flexDirection: "column", gap: 5 }}>
                <Text style={styles.label}>Age</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5
                    name="calendar"
                    size={20}
                    color={Colors.primary}
                  />
                  <TextInput
                    placeholder="Age"
                    value={pet.age}
                    onChangeText={(text) => {
                      const updatedPets = [...pets];
                      updatedPets[index].age = text;
                      setPets(updatedPets);
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Add + Delete Buttons Row */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginHorizontal: 20,
                  marginTop: 10,
                }}
              >
                {/* Add Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#f0f0f0",
                    flex: 1,
                    height: 40,
                    borderRadius: 19,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (pets.length >= 3) {
                      ToastAndroid.show(
                        "You can only add up to 3 pets.",
                        ToastAndroid.SHORT
                      );
                      return;
                    }
                    setPets([
                      ...pets,
                      {
                        name: "",
                        species: "",
                        breed: "",
                        age: "",
                        image: null,
                      },
                    ]);
                  }}
                >
                  <Text style={{ color: Colors.primary, textAlign: "center" }}>
                    + Add Another Pet
                  </Text>
                </TouchableOpacity>

                {/* Delete Button */}
                {pets.length > 1 && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ffcccc",
                      width: "40%",
                      height: 40,
                      borderRadius: 19,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      const updatedPets = pets.filter((_, i) => i !== index);
                      setPets(updatedPets);
                      ToastAndroid.show(
                        "Pet removed successfully.",
                        ToastAndroid.SHORT
                      );
                    }}
                  >
                    <Text style={{ color: "red", textAlign: "center" }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Add Pet Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 15,
            paddingVertical: 30,
          }}
        >
          {/* Skip Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#E9E9E9",
                width: "40%",
                marginTop: 0,
                top: 0,
              },
            ]}
            onPress={onNext}
          >
            <Text style={[styles.buttonText, { color: "#000" }]}>Skip</Text>
          </TouchableOpacity>

          {/* Finish Button */}
          <TouchableOpacity
            style={[styles.button, { width: "40%", marginTop: 0, top: 0 }]}
            onPress={onNext}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: "RobotoMedium",
    marginBottom: 20,
    maxWidth: "100%",
    marginHorizontal: 20,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: "Roboto",
    marginBottom: 30,
    maxWidth: "100%",
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "white",
    borderWidth: 1.3,
    borderColor: Colors.primary,
    borderRadius: 24,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    height: 50,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
    marginLeft: 30,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    width: "80%",
    fontFamily: "Roboto",
    color: "#C3C0C0",
  },
  dropdown: {
    // borderWidth: 1,
    // borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    // marginBottom: 10,
    width: "80%",
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    top: "10%",
    width: "85%",
    alignSelf: "center",
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
  },
});

export default PetOwnerSignup;
