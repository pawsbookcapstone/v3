import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FAQS = [
  {
    id: "1",
    question: "How do I reset my password?",
    answer: "Go to Settings > Change Password, and follow the instructions.",
  },
  {
    id: "2",
    question: "How can I update my profile?",
    answer: "Navigate to your Profile > Edit Profile to update your details.",
  },
  {
    id: "3",
    question: "How do I block or unblock a user?",
    answer: "Go to Blocked Users under Settings to manage blocked accounts.",
  },
  {
    id: "4",
    question: "How do I create a post?",
    answer:
      "1. Tap the '+' button on the home screen.\n" +
      "2. Add images or videos you want to share.\n" +
      "3. Write a description and select relevant tags.\n" +
      "4. Press 'Post' to publish it.",
  },
  {
    id: "5",
    question: "How do I chat with other users?",
    answer:
      "1. Go to the user’s profile or your messages section.\n" +
      "2. Tap 'Message' to start a conversation.\n" +
      "3. Type your message and press send.\n" +
      "4. You can also send images or emojis in the chat.",
  },
  {
    id: "6",
    question: "How do I sell an item in the marketplace?",
    answer:
      "1. Navigate to the Marketplace tab.\n" +
      "2. Tap 'Sell' and add a title, description, price, and images of your item.\n" +
      "3. Choose relevant categories and tags.\n" +
      "4. Press 'Publish' to list your item for sale.",
  },
];

const Help = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.questionRow}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <Ionicons
          name={expandedId === item.id ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.gray}
        />
      </TouchableOpacity>

      {expandedId === item.id && (
        <Text style={styles.answerText}>{item.answer}</Text>
      )}
    </View>
  );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Help"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      <FlatList
        data={FAQS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...ShadowStyle,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    flex: 1,
    marginRight: 10,
  },
  answerText: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 10,
    lineHeight: 20,
  },
});
