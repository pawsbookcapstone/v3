import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  // onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number }; // 👈 adjustable position
};

const ActionMenuModal: React.FC<Props> = ({
  visible,
  onClose,
  // onEdit,
  onDelete,
  position,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.menu,
            {
              top: position.y,
              left: position.x,
            },
          ]}
        >
          {/* <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onEdit();
              onClose();
            }}
          >
            <Text style={styles.text}>Edit</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Text style={[styles.text, { color: "red" }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ActionMenuModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: "absolute", // 👈 important
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 5,
  },
  option: {
    padding: 12,
  },
  text: {
    fontSize: 14,
  },
});
