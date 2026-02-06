import StepIndicator from "@/components/StepIndicator";
import GroomerSignup from "@/components/UserComponent/GroomerSignup";
import PetOwnerSignup from "@/components/UserComponent/PetOwnerSignup";
import VetSignup from "@/components/UserComponent/VetSignup";
import { Colors } from "@/shared/colors/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<string | null>(null);

  // Shared states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Pet states
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");

  const speciesList = [
    "Dog",
    "Cat",
    "Bird",
    "Reptile",
    "Fish",
    "asdasd",
    "adsad",
    "adsasdasda",
  ];
  const breedList = ["Labrador", "Bulldog", "Persian", "Siamese"];

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (userType === "Pet Owner") {
      if (step < 3) {
        setStep(step + 1);
      } else {
        console.log("Pet Owner Signup Success", {
          userType,
          fullName,
          petName,
        });
        router.replace("/pet-owner/(tabs)/home");
      }
    } else if (userType === "Veterinarian" || userType === "Groomer") {
      if (step < 2) {
        setStep(step + 1);
      } else {
        console.log("Signup Success", { userType, fullName, email });
        router.replace("/pet-owner/(tabs)/home");
      }
    }
  };

  const steps = userType === "Pet Owner" ? [1, 2, 3] : userType ? [1, 2] : [1];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        style={{ marginBottom: 10, marginTop: 55, marginLeft: 20 }}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color="black" />
      </TouchableOpacity>

      <StepIndicator step={step} steps={steps} />

      {/* Step 1: User Type Selection */}
      {step === 1 && (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "RobotoMedium",
              maxWidth: "65%",
              alignSelf: "flex-start",
              textAlign: "left",
              marginBottom: 20,
              marginLeft: 20,
            }}
          >
            Welcome! To get started, tell us who you are.
          </Text>

          <Text
            style={{
              fontSize: 14,
              marginBottom: 30,
              fontFamily: "Roboto",
              marginLeft: 20,
            }}
          >
            Choose the option that best describes you
          </Text>

          {/* Row for Pet Owner + Veterinarian */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 20,
            }}
          >
            {["Pet Owner", "Veterinarian"].map((type) => (
              <TouchableOpacity
                key={type}
                style={{
                  flex: 1,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  backgroundColor: userType === type ? Colors.primary : "#fff",
                  borderRadius: 20,
                  marginBottom: 10,
                  marginRight: type === "Pet Owner" ? 10 : 0, // spacing between buttons
                }}
                onPress={() => {
                  setUserType(type);
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "RobotoMedium",
                    color: userType === type ? "#fff" : Colors.primary,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Groomer in its own column */}
          <TouchableOpacity
            style={{
              padding: 10,
              borderWidth: 1,
              width: "45%",
              borderColor: Colors.primary,
              backgroundColor: userType === "Groomer" ? Colors.primary : "#fff",
              borderRadius: 20,
              marginBottom: 10,
              marginTop: 10,
              marginLeft: "10%",
            }}
            onPress={() => {
              setUserType("Groomer");
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "RobotoMedium",
                color: userType === "Groomer" ? "#fff" : Colors.primary,
              }}
            >
              Groomer
            </Text>
          </TouchableOpacity>

          <Pressable
            style={{
              backgroundColor: Colors.primary,
              padding: 15,
              borderRadius: 25,
              position: "absolute",
              bottom: 30,
              width: "85%",
              marginTop: 10,
              alignSelf: "center",
            }}
            onPress={() => {
              if (!userType) {
                ToastAndroid.show(
                  "Please select a user type first.",
                  ToastAndroid.SHORT
                );
                return;
              }
              setStep(2);
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>Next</Text>
          </Pressable>
        </View>
      )}

      {/* Pet Owner Signup */}
      {userType === "Pet Owner" && (
        <PetOwnerSignup
          step={step}
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          petName={petName}
          setPetName={setPetName}
          species={species}
          setSpecies={setSpecies}
          breed={breed}
          setBreed={setBreed}
          age={age}
          setAge={setAge}
          speciesList={speciesList}
          breedList={breedList}
          onNext={handleNext}
        />
      )}

      {/* Vet Signup */}
      {userType === "Veterinarian" && step === 2 && (
        <VetSignup
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onFinish={handleNext}
        />
      )}

      {/* Groomer Signup */}
      {userType === "Groomer" && step === 2 && (
        <GroomerSignup
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onFinish={handleNext}
        />
      )}
    </View>
  );
};

export default Signup;
