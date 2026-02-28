import { Colors } from "@/shared/colors/Colors";
import { useLocalSearchParams } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { Text, ToastAndroid, View } from "react-native";

export function VerifyEmail() {
  const { user }: { user: string } = useLocalSearchParams();
  const [parsedUser] = useState(JSON.parse(user ?? ""));

  const handleSendVerfication = () => {
    console.log(parsedUser);

    sendEmailVerification(parsedUser);
    ToastAndroid.show("Verification sent.", ToastAndroid.SHORT);
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        backgroundColor: Colors.lightGray,
      }}
    >
      <View style={{ padding: 10, borderRadius: 5 }}>
        <Text>Email Verification</Text>
      </View>
    </View>
  );
}
