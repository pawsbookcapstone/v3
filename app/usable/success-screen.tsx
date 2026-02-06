import { Colors } from "@/shared/colors/Colors";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SuccessScreen = () => {
  const { name, provider, date, time } = useLocalSearchParams();
  const formattedDate = date ? new Date(date as string).toDateString() : "";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="check" size={50} color={Colors.white} />
        </View>

        <Text style={styles.title}>Appointment Confirmed!</Text>

        <Text style={styles.message}>
          Thank you, <Text style={styles.highlight}>{name}</Text>!{"\n"}
          Your appointment with <Text style={styles.highlight}>
            {provider}
          </Text>{" "}
          has been scheduled on{" "}
          <Text style={styles.highlight}>{formattedDate}</Text> at{" "}
          <Text style={styles.highlight}>{time}</Text>.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/pet-owner/(menu)/appointment")}
        >
          <Text style={styles.buttonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f3f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: Colors.primary,
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 25,
  },
  message: {
    fontSize: 16,
    color: Colors.black,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  highlight: {
    fontWeight: "700",
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
