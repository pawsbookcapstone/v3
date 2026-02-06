import { useAppContext } from "@/AppsProvider";
import { add, serverTimestamp } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGroup = () => {
  const { userId, userName, userImagePath } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState(
    "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  );
  const [privacy, setPrivacy] = useState<"Public" | "Private">("Public");
  const [questions, setQuestions] = useState([""]);

  const handleAddQuestion = () => {
    if (questions.length >= 3) return; // Limit to 3 questions
    setQuestions([...questions, ""]);
  };

  const handleQuestionChange = (text: string, index: number) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    try {
      const newGroup = {
        id: Date.now().toString(),
        title: groupName,
        description,
        profile,
        groupOwnerId: userId,
        members: 1,
        privacy,
        questions:
          privacy === "Private" ? questions.filter((q) => q.trim()) : [],
        createdAt: serverTimestamp(),
      };

      await add("groups").value(newGroup);

      alert("Group published!");

      router.push({
        pathname: "/pet-owner/(menu)/community",
        params: { newGroup: JSON.stringify(newGroup) },
      });
    } catch (error) {
      console.error("Error publishing item:", error);
      alert("Failed to publish item. Try again.");
    }
  };

  return (
    <View style={screens.screen}>
      {/* Header */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Create Group"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Profile Image */}
          <View style={styles.profileContainer}>
            <Image source={{ uri: profile }} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => console.log("Change Profile Image")}
            >
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Group Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor="#888"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderRadius: 15 }]}
              placeholder="Enter group description"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Privacy */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Privacy</Text>
            <View style={styles.toggleRow}>
              {["Public", "Private"].map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.toggleBtn,
                    privacy === type && { backgroundColor: Colors.primary },
                  ]}
                  onPress={() => setPrivacy(type as "Public" | "Private")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      privacy === type && { color: "#fff" },
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Questions (only for Private groups) */}
          {privacy === "Private" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Membership Questions</Text>

              {questions.map((q, index) => (
                <TextInput
                  key={index}
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={`Question ${index + 1}`}
                  placeholderTextColor="#888"
                  value={q}
                  onChangeText={(text) => handleQuestionChange(text, index)}
                />
              ))}

              <Pressable
                style={[
                  styles.addQuestionBtn,
                  questions.length >= 3 && { opacity: 0.5 },
                ]}
                onPress={handleAddQuestion}
                disabled={questions.length >= 3}
              >
                <Text style={styles.addQuestionText}>
                  {questions.length >= 3
                    ? "Maximum 3 questions"
                    : "+ Add Question"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  changeText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "RobotoSemiBold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textArea: {
    height: 100,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  addQuestionBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  addQuestionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
  },
});
