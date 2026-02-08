import { serverTimestamp, set } from "@/helpers/db";
import { auth } from "@/helpers/firebase";
import { useLoadingHook } from "@/hooks/loadingHook";
import { Colors } from "@/shared/colors/Colors";
import { screens } from "@/shared/styles/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Register = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const renderLoadingButton = useLoadingHook(true)

  const handleBack = () => {
    router.replace("/StartScreen");
  };
  const validateForm = () => {
    if (!firstname.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return false;
    }
    if (!lastname.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const onSignUp = async () => {
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await set("users", userCredential.user.uid).value({
        id: userCredential.user.uid,
        firstname: firstname,
        lastname: lastname,
        email: email,
        is_page: false,
        createdAt: serverTimestamp(),
        online_status: true,
        img_path:
          "https://res.cloudinary.com/diwwrxy8b/image/upload/v1769641991/jzibxr8wuvqhfqwcnusm.jpg",
      });

      router.replace("/auth/Login");
    } catch (e) {
      console.log(e);
    }
  };

  const onLogin = () => {
    router.replace("/auth/Login");
  };

  return (
    <View style={screens.screen}>
      <View style={{ marginBottom: 10, marginTop: 55, marginLeft: 20 }}>
        {/* You can re-enable this if you want a back icon */}
        {/* <MaterialIcons name="arrow-back-ios" size={24} color="black" onPress={handleBack} /> */}
      </View>

      <Image
        source={require("../../assets/images/logo/headerlogo.png")}
        style={styles.logo}
      />

      <View style={styles.wrapper}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join us and start caring for your pets today!
        </Text>
      </View>

      {/* First Name */}
      <View style={{ flexDirection: "column", gap: 5, marginTop: 40 }}>
        <Text style={styles.label}>First Name</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color={Colors.primary} />
          <TextInput
            placeholder="Enter your first name"
            value={firstname}
            onChangeText={setFirstname}
            style={styles.input}
          />
        </View>
      </View>

      {/* Last Name */}
      <View style={{ flexDirection: "column", gap: 5 }}>
        <Text style={styles.label}>Last Name</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="person-outline"
            size={20}
            color={Colors.primary}
          />
          <TextInput
            placeholder="Enter your last name"
            value={lastname}
            onChangeText={setLastname}
            style={styles.input}
          />
        </View>
      </View>

      {/* Email */}
      <View style={{ flexDirection: "column", gap: 5 }}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color={Colors.primary} />
          <TextInput
            placeholder="Enter your email"
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
            placeholder="Enter your password"
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
              <View style={{ width: 15 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Button */}
      {/* <Link href="/pet-owner/(tabs)/home" asChild> */}
      {renderLoadingButton({
        style: styles.buttonContainer,
        children: <Text style={styles.buttonText}>Sign Up</Text>,
        onPress: onSignUp
      })}
      {/* <Pressable onPress={onSignUp} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable> */}
      {/* </Link> */}

      {/* Already have an account */}
      {/* <Link href="/auth/Login" asChild> */}
      <Text style={styles.signupText}>
        Already have an account?{" "}
        <Pressable onPress={onLogin}>
          <Text
            style={{
              fontFamily: "RobotoMedium",
              fontSize: 15,
              color: Colors.primary,
            }}
          >
            Login
          </Text>
        </Pressable>
      </Text>
      {/* </Link> */}
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: "RobotoSemiBold",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Roboto",
  },
  wrapper: {
    flexDirection: "column",
    marginHorizontal: 20,
    marginTop: 80,
  },
  logo: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    width: 140,
    height: 20,
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
  buttonContainer: {
    backgroundColor: Colors.primary,
    width: "80%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Sans",
  },
  signupText: {
    position: "absolute",
    bottom: 40,
    fontFamily: "Roboto",
    fontSize: 14,
    alignSelf: "center",
  },
});
