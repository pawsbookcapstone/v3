import { useAppContext } from "@/AppsProvider";
import { Colors } from "@/shared/colors/Colors";
import { screens } from "@/shared/styles/styles";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ HEADER
import { add } from "@/helpers/db";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";

const CreateEvent = () => {
  const { userId } = useAppContext();
  const { groupId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title || !date || !location) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const data = {
      createdByGroupId: groupId,
      createdById: userId,
      title,
      location,
      date,
      description,
    };

    try {
      await add("events").value(data);
    } catch (e) {
      Alert.alert("Error", "Event creation failed!!!");
      return;
    }

    Alert.alert("Success", "Event created successfully!");

    router.back();
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* ✅ HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Create Event"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      <ScrollView contentContainerStyle={styles.container}>
        {/* TITLE */}
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          placeholder="Enter event title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* DATE */}
        <Text style={styles.label}>Date *</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />

        {/* LOCATION */}
        <Text style={styles.label}>Location *</Text>
        <TextInput
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />

        {/* DESCRIPTION */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Optional description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
