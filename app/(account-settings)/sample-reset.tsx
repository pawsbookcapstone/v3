// import { Colors } from "@/shared/colors/Colors";
// import HeaderWithActions from "@/shared/components/HeaderSet";
// import HeaderLayout from "@/shared/components/MainHeaderLayout";
// import { screens } from "@/shared/styles/styles";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Pressable,
//   Alert,
// } from "react-native";

// import { auth } from "@/firebaseConfig";
// import {
//   EmailAuthProvider,
//   reauthenticateWithCredential,
//   updatePassword,
// } from "firebase/auth";

// const ChangePassword = () => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const handleChangePassword = async () => {
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       Alert.alert("Error", "Please fill out all fields.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert("Error", "New passwords do not match.");
//       return;
//     }

//     const user = auth.currentUser;
//     if (!user || !user.email) {
//       Alert.alert("Error", "User not logged in.");
//       return;
//     }

//     try {
//       const credential = EmailAuthProvider.credential(
//         user.email,
//         currentPassword
//       );
//       await reauthenticateWithCredential(user, credential);
//       await updatePassword(user, newPassword);
//       Alert.alert("Success", "Your password has been updated.");
//       router.back();
//     } catch (error: any) {
//       console.error("Error updating password:", error);
//       if (error.code === "auth/wrong-password") {
//         Alert.alert("Error", "Incorrect current password.");
//       } else if (error.code === "auth/weak-password") {
//         Alert.alert("Error", "New password is too weak.");
//       } else {
//         Alert.alert("Error", "Failed to update password. Try again later.");
//       }
//     }
//   };

//   return (
//     <View style={[screens.screen, { backgroundColor: "#fff" }]}>
//       <HeaderLayout noBorderRadius bottomBorder>
//         <HeaderWithActions
//           title="Change Password"
//           onBack={() => router.back()}
//         />
//       </HeaderLayout>

//       <View style={styles.container}>
//         <Text style={styles.title}>Update Your Password</Text>
//         <Text style={styles.subtitle}>
//           For your account’s security, please enter your current password and a
//           new one below.
//         </Text>

//         {/* Current Password */}
//         <Text style={styles.label}>Current Password</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter current password"
//             placeholderTextColor="#aaa"
//             secureTextEntry={!showCurrent}
//             value={currentPassword}
//             onChangeText={setCurrentPassword}
//           />
//           <Pressable onPress={() => setShowCurrent(!showCurrent)}>
//             <Ionicons
//               name={showCurrent ? "eye" : "eye-off"}
//               size={22}
//               color="#777"
//             />
//           </Pressable>
//         </View>

//         {/* New Password */}
//         <Text style={styles.label}>New Password</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter new password"
//             placeholderTextColor="#aaa"
//             secureTextEntry={!showNew}
//             value={newPassword}
//             onChangeText={setNewPassword}
//           />
//           <Pressable onPress={() => setShowNew(!showNew)}>
//             <Ionicons
//               name={showNew ? "eye" : "eye-off"}
//               size={22}
//               color="#777"
//             />
//           </Pressable>
//         </View>

//         {/* Confirm Password */}
//         <Text style={styles.label}>Confirm New Password</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             style={styles.input}
//             placeholder="Re-enter new password"
//             placeholderTextColor="#aaa"
//             secureTextEntry={!showConfirm}
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//           />
//           <Pressable onPress={() => setShowConfirm(!showConfirm)}>
//             <Ionicons
//               name={showConfirm ? "eye" : "eye-off"}
//               size={22}
//               color="#777"
//             />
//           </Pressable>
//         </View>

//         {/* Save Button */}
//         <TouchableOpacity
//           style={styles.saveButton}
//           onPress={handleChangePassword}
//         >
//           <Text style={styles.saveButtonText}>Save Changes</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ChangePassword;

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: {
//     fontSize: 20,
//     fontFamily: "RobotoSemiBold",
//     color: "#000",
//     marginBottom: 5,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#555",
//     fontFamily: "Roboto",
//     marginBottom: 25,
//   },
//   label: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 8,
//     fontFamily: "RobotoMedium",
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F8F8",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     paddingHorizontal: 12,
//     marginBottom: 15,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 14,
//     fontFamily: "Roboto",
//     color: "#000",
//   },
//   saveButton: {
//     backgroundColor: Colors.primary,
//     borderRadius: 10,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontFamily: "RobotoMedium",
//   },
// });

import React from "react";
import { Text, View } from "react-native";

const sampleReset = () => {
  return (
    <View>
      <Text>sample-reset</Text>
    </View>
  );
};

export default sampleReset;
