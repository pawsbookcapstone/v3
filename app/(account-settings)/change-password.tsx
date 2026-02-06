import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const auth = getAuth();

  async function changePassword() {
    const user = auth.currentUser;
    if (!user) return;

    const credential = EmailAuthProvider.credential(
      user.email ?? "",
      currentPassword,
    );

    try {
      // ✅ THIS checks the current password
      await reauthenticateWithCredential(user, credential);

      // ✅ Only runs if password is correct
      await updatePassword(user, newPassword);

      console.log("Password changed successfully");
      return true;
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        console.error("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        console.error("New password is too weak");
      } else if (error.code === "auth/requires-recent-login") {
        console.error("Please login again");
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (!changePassword()) return;

    alert("Your password has been successfully updated!");
    router.back();
  };

  return (
    <View style={[screens.screen, { backgroundColor: "#fff" }]}>
      {/* Header */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Change Password"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Body */}
      <View style={styles.container}>
        <Text style={styles.title}>Update Your Password</Text>
        <Text style={styles.subtitle}>
          For your account’s security, please enter your current password and a
          new one below.
        </Text>

        {/* Current Password */}
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Pressable onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons
              name={showCurrent ? "eye" : "eye-off"}
              size={22}
              color="#777"
            />
          </Pressable>
        </View>

        {/* New Password */}
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Pressable onPress={() => setShowNew(!showNew)}>
            <Ionicons
              name={showNew ? "eye" : "eye-off"}
              size={22}
              color="#777"
            />
          </Pressable>
        </View>

        {/* Confirm New Password */}
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons
              name={showConfirm ? "eye" : "eye-off"}
              size={22}
              color="#777"
            />
          </Pressable>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    fontFamily: "Roboto",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontFamily: "RobotoMedium",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "RobotoMedium",
  },
});
