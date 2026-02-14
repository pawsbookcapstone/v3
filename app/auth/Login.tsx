import { useAppContext } from "@/AppsProvider";

import { find, serverTimestamp, update } from "@/helpers/db";
import { auth } from "@/helpers/firebase";
import { useLoadingHook } from "@/hooks/loadingHook";
import { Colors } from "@/shared/colors/Colors";
import { screens } from "@/shared/styles/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const { email: emailToSwitch }: any = useLocalSearchParams();

  // const [email, setemail] = useState(emailToSwitch ?? "");
  // const [password, setpassword] = useState("");
  const [email, setemail] = useState(emailToSwitch ?? "email@gmail.com");
  const [password, setpassword] = useState("PASSWORD");
  //ad's account
  // const [email, setemail] = useState("adrianfegalan@gmail.com");
  // const [password, setpassword] = useState("PASSWORD");
  const [showPassword, setShowPassword] = useState(false);

  const renderLoadingButton = useLoadingHook(true);

  const {
    setUserId,
    setUserFirstName,
    setUserLastName,
    setUserEmail,
    setUserImagePath,
  } = useAppContext();

  const onLogin = async () => {
    if (!email || !password) {
      throw "Please fill in all fields!!!";
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const userId = userCredential.user.uid;

      const userDoc = await find("users", userId);

      if (!userDoc.exists()) {
        await auth.signOut();
        throw "Account not found!!!";
      }

      let profiles = await AsyncStorage.getItem("profiles");
      let changed = true;
      if (!profiles) profiles = userId;
      else {
        if (!profiles.includes(userId)) profiles += "," + userId;
        else changed = false;
      }
      if (changed) AsyncStorage.setItem("profiles", profiles);

      update("users", userId).value({
        last_online_at: serverTimestamp(),
        active_status: "active",
      });
      //until here
      const user = userDoc.data();
      setUserId(userId);
      setUserFirstName(user.firstname);
      setUserLastName(user.lastname);
      setUserEmail(user.email);
      setUserImagePath(user.img_path);
      router.replace({
        pathname: "/pet-owner/(tabs)/home",
        params: { imagepath: setUserImagePath },
      });
    } catch (e) {
      // Alert.alert("Error", e + "");
      const error = e + "";
      if (error.includes("(auth/network-request-failed)"))
        throw "No internet connection";
      if (error.includes("(auth/invalid-credential)"))
        throw "Incorrect credentials";

      throw error;
    }
  };

  const onSignUp = () => {
    router.replace("/auth/register");
  };

  return (
    <View style={screens.screen}>
      <View
        // onPress={handleBack}
        style={{ marginBottom: 10, marginTop: 55, marginLeft: 20 }}
      >
        {/* <MaterialIcons name="arrow-back-ios" size={24} color="black" /> */}
      </View>

      <Image
        source={require("../../assets/images/logo/headerlogo.png")}
        style={styles.logo}
      />
      <View style={styles.wrapper}>
        <Text style={styles.title}>Glad to see you again!</Text>
        <Text style={styles.subtitle}>log in to access your pets.</Text>
      </View>

      <View style={{ flexDirection: "column", gap: 5, marginTop: 35 }}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color={Colors.primary} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setemail}
            style={styles.input}
          />
        </View>
      </View>
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
            onChangeText={setpassword}
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

      <Text style={styles.forgotPassword}>Forgot password?</Text>

      {renderLoadingButton({
        style: styles.buttonContainer,
        children: <Text style={styles.buttonText}>Login</Text>,
        onPress: onLogin,
      })}

      {/* </Link> */}

      {/* <Link href="/auth/register" asChild> */}
      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Pressable onPress={onSignUp}>
          <Text
            style={{
              fontFamily: "RobotoMedium",
              fontSize: 15,
              color: Colors.primary,
            }}
          >
            Sign up
          </Text>
        </Pressable>
      </Text>
      {/* </Link> */}
    </View>
  );
};

export default Login;

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
  forgotPassword: {
    alignSelf: "center",
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginTop: 20,
    fontSize: 13,
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
