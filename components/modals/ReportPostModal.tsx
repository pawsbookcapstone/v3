import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type ReportPostModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

const ReportPostModal: React.FC<ReportPostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");

  const reasons = [
    "Spam or misleading",
    "Inappropriate content",
    "Harassment or bullying",
    "Hate speech",
    "Other",
  ];

  const handleSubmit = () => {
    if (!selectedReason) return;

    if (selectedReason === "Other" && !otherReason.trim()) {
      return;
    }

    const finalReason =
      selectedReason === "Other" ? otherReason.trim() : selectedReason;

    onSubmit(finalReason);

    // Reset states
    setSelectedReason("");
    setOtherReason("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.flexContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <Text style={styles.title}>Report Post</Text>

          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonItem,
                selectedReason === reason && styles.selectedReason,
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason && styles.selectedText,
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Show input if "Other" is selected */}
          {selectedReason === "Other" && (
            <TextInput
              placeholder="Please specify..."
              value={otherReason}
              onChangeText={setOtherReason}
              style={styles.input}
              multiline
            />
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!selectedReason ||
                (selectedReason === "Other" && !otherReason.trim())) && {
                backgroundColor: "#ccc",
              },
            ]}
            onPress={handleSubmit}
            disabled={
              !selectedReason ||
              (selectedReason === "Other" && !otherReason.trim())
            }
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReportPostModal;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
  },
  reasonItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedReason: {
    backgroundColor: "#e0e0e0",
  },
  reasonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    fontWeight: "600",
    color: "#000",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitBtn: {
    marginTop: 15,
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
