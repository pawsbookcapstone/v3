import { useAppContext } from "@/AppsProvider";
import { get, where } from "@/helpers/db";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type PostDropdownProps = {
  postId: string;
  x: number;
  y: number;
  onSave: (unSaveId: string | null) => void;
  onReport: (postId: string) => void;
  onClose: () => void;
  isMyPost: boolean; // ✅ you already have this prop
};

const PostDropdown: React.FC<PostDropdownProps> = ({
  postId,
  x,
  y,
  onSave,
  onReport,
  onClose,
  isMyPost, // ✅ destructure it
}) => {
  const dropdownWidth = 140;
  const offset = 5;

  const { userId } = useAppContext();

  const [unSaveId, setUnSaveId] = useState<string | null>(null);

  useEffect(() => {
    get("users", userId, "saved")
      .where(where("saved_id", "==", postId))
      .then((c) => {
        for (const d of c.docs) {
          setUnSaveId(d.id);
          break;
        }
      });
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable
          style={[
            styles.dropdown,
            { top: y, left: x - dropdownWidth + offset },
          ]}
        >
          {/* ✅ Change label and icon based on ownership */}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onSave(unSaveId);
              onClose();
            }}
          >
            {isMyPost ? (
              <MaterialIcons name="edit" size={18} color="#333" />
            ) : (
              <MaterialIcons
                name={unSaveId ? "bookmark" : "bookmark-border"}
                size={18}
                color="#333"
              />
            )}
            <Text style={styles.dropdownText}>
              {isMyPost ? "Edit Post" : "Save Post"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onReport(postId);
              onClose();
            }}
          >
            {isMyPost ? (
              <MaterialIcons name="delete-outline" size={18} color="red" />
            ) : (
              <FontAwesome name="flag" size={16} color="#333" />
            )}
            <Text style={[styles.dropdownText, isMyPost && { color: "red" }]}>
              {isMyPost ? "Delete Post" : "Report Post"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PostDropdown;

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 999,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: 140,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
});
