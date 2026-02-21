import { Colors } from "@/shared/colors/Colors";
import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
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

  const ADMIN_GCASH = "09021002020";

  const handleSubmit = () => {
    if (!referenceNumber.trim()) {
      alert("Please enter reference number");
      return;
    }

    onSubmit(referenceNumber);
    setReferenceNumber("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Subscription Required</Text>

          <Text style={styles.description}>
            You need to subscribe first before creating a page.
          </Text>

          <Text style={styles.label}>Send payment to:</Text>
          <Text style={styles.gcash}>{ADMIN_GCASH}</Text>

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
    marginBottom: 15,
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
});
