import { collectionName } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (referenceNumber: string) => void; // callback to parent
}

export default function SubscribeModal({ visible, onClose, onSubmit }: Props) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [number, setNumber] = useState("");
  const [qr, setQR] = useState(null);

  useOnFocusHook(() => {
    collectionName("admin_users")
      .get()
      .then(({ docs }) => {
        if (docs.length == 0) return;

        const data = docs[0].data();
        setNumber(data.gcash_number);
        setQR(data.gcash_qr);
      });
  });

  const handleSubmit = () => {
    if (!referenceNumber.trim()) {
      alert("Please enter reference number");
      return;
    }

    onSubmit(referenceNumber);
    setReferenceNumber("");
    onClose();
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(number);
    ToastAndroid.show("Copied!", ToastAndroid.SHORT);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Subscription Required</Text>

          <Text style={styles.description}>
            You need to subscribe first before creating a page.
          </Text>
          <Text style={styles.description}>
            Subscribe for only ₱99 per month to add your page.
          </Text>

          <Text style={styles.label}>Send through GCash to:</Text>
          <View
            style={{
              marginBottom: 8,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <Text style={styles.gcash}>{number}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather name="copy" size={24} color={Colors.lightGray} />
            </TouchableOpacity>
          </View>

          {qr && (
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: 5,
                marginBottom: 10,
              }}
            >
              <Image
                source={{ uri: qr }}
                style={{
                  width: 200,
                  height: 200,
                  resizeMode: "cover",
                }}
              />
            </View>
          )}

          <TextInput
            placeholder="Enter GCash Reference Number"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            style={styles.input}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
  },
  gcash: {
    fontSize: 16,

    color: "#007AFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancel: {
    marginTop: 15,
    textAlign: "center",
    color: "red",
  },
  container: {
    padding: 16,
  },
});
