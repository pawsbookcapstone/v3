import { Colors } from "@/shared/colors/Colors";
import { screens } from "@/shared/styles/styles";
import { Link, router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const StartScreen = () => {
  return (
    <View style={[screens.screen, { justifyContent: "center" }]}>
      <Image
        source={require("../assets/images/logo/toplogo.png")}
        style={styles.logo}
      />

      <Image
        source={require("../assets/images/frontImage.png")}
        style={styles.frontImage}
      />

      <Text style={styles.caption} numberOfLines={2}>
        Start your new pets social journey
      </Text>
      <Text style={styles.subcaption} numberOfLines={2}>
        Post, react, and start conversation that brings good vibes only
      </Text>

      <View
        style={{
          marginTop: 20,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          gap: 10,
          bottom: 30,
          width: "100%",
        }}
      >
        <Link href="/auth/register" asChild>
          <Pressable style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Create account</Text>
          </Pressable>
        </Link>

        <Pressable
          style={[
            styles.buttonContainer,
            { backgroundColor: Colors.buttonlogin },
          ]}
          onPress={() => {
            router.push("/auth/Login");
          }}
        >
          <Text style={[styles.buttonText, { color: Colors.black }]}>
            Login
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  logo: {
    position: "absolute",
    top: 0,
    marginTop: 50,
    alignSelf: "center",
    width: 140,
    height: 20,
  },
  frontImage: {
    width: "90%",
    height: "30%",
    resizeMode: "cover",
    alignSelf: "center",
  },
  caption: {
    fontSize: 36,
    fontFamily: "SansBold",
    alignSelf: "center",
    textAlign: "center",
    marginTop: 20,
    maxWidth: "75%",
  },
  subcaption: {
    fontFamily: "Sans",
    fontSize: 14,
    marginTop: 20,
    color: "#1e1e1e",
    maxWidth: "75%",
    alignSelf: "center",
    textAlign: "center",
  },
  buttonContainer: {
    backgroundColor: Colors.primary,
    width: "80%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",

    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Sans",
  },
});
