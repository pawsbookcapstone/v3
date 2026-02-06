import { Colors } from "@/shared/colors/Colors";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface GroomerSignupProps {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onFinish: () => void;
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
};

const GroomerSignup: React.FC<GroomerSignupProps> = ({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  onFinish,
}) => (
  <View style={{ flex: 1, justifyContent: "center" }}>
    <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 20 }}>
      Groomer Signup
    </Text>
    <TextInput
      placeholder="Full Name"
      value={fullName}
      onChangeText={setFullName}
      style={styles.input}
    />
    <TextInput
      placeholder="Phone Number"
      value={phone}
      onChangeText={setPhone}
      style={styles.input}
    />
    <TextInput
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      style={styles.input}
    />
    <TextInput
      placeholder="Password"
      value={password}
      secureTextEntry
      onChangeText={setPassword}
      style={styles.input}
    />
    <TouchableOpacity style={styles.button} onPress={onFinish}>
      <Text style={{ color: "#fff", textAlign: "center" }}>Finish</Text>
    </TouchableOpacity>
  </View>
);

export default GroomerSignup;
