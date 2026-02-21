import { all } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
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
  const [gcashNumbers, setGcashNumber] = useState<
    { id: string; gcash_number: string }[]
  >([]);

  useEffect(() => {
    const fetchGcashNumber = async () => {
      try {
        const data = await all("admin_users");
        const finalData = data.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            gcash_number: docData.gcash_number || "",
          };
        });
        setGcashNumber(finalData);
      } catch (err) {
        console.error("Error fetching GCash numbers:", err);
      }
    };

    fetchGcashNumber();
  }, []);

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
          <Text style={styles.description}>
            Subscribe for only ₱99 per month to add your page.
          </Text>

          <Text style={styles.label}>Send payment to:</Text>

          <ScrollView style={styles.container}>
            {gcashNumbers.map((user) => (
              <Text key={user.id} style={styles.gcash}>
                {user.gcash_number}
              </Text>
            ))}
          </ScrollView>

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
    marginBottom: 8,

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
