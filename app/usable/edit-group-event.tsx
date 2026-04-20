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
import { find, update } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";

const CreateEvent = () => {
  const { groupEventId }: { groupEventId: string } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useOnFocusHook(() => {
    find("events", groupEventId).then((s) => {
      if (!s.exists()) return;

      const data = s.data();
      setTitle(data.title);
      setDate(data.date);
      setLocation(data.location);
      setDescription(data.description);
    });
  });

  const handleUpdate = async () => {
    if (!title || !date || !location) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const data = {
      title,
      location,
      date,
      description,
    };

    try {
      await update("events", groupEventId).value(data);

      Alert.alert("Success", "Event updated successfully!");

      router.back();
    } catch (e) {
      Alert.alert("Error", "Event update failed!!!");
      return;
    }
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* ✅ HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Update Event"
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
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update Event</Text>
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
