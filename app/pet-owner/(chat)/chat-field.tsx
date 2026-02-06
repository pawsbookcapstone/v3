import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, find, set } from "@/helpers/db";
import { db } from "@/helpers/firebase";
import { generateChatId } from "@/helpers/helper";
import { useNotifHook } from "@/helpers/notifHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// const chatId = "1MpmIvxBRbSYXbmsPLQb";

const ChatField = () => {
  const { userId, userImagePath, userName} = useAppContext();
  const addNotif = useNotifHook();

  const {
    otherUserId,
    otherUserName,
    otherUserImgPath,
  }: { otherUserId: string; otherUserName: string; otherUserImgPath: string;  } =
    useLocalSearchParams();

  const [chatId] = useState(generateChatId(userId, otherUserId));

  const [messages, setMessages] = useState<any>([
    // { id: "1", text: "Hey, how are you?", sender: "other" },
    // { id: "2", text: "I'm good, just working on the app.", sender: "me" },
    // { id: "3", text: "Nice! Keep it up 🚀", sender: "other" },
  ]);
  const [input, setInput] = useState("");

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!userId) return
    
    const createDetails = async () => {
      const snap = await find("chats", chatId);

      if (snap.exists() && snap.data().last_sent_at) return;

      set("chats", chatId).value({
        users: [userId, otherUserId],
        [userId]: {
          name: userName,
          img_path: userImagePath ?? null,
        },
        [otherUserId.toString()]: {
          name: otherUserName,
          img_path: otherUserImgPath ?? null,
        },
      });
    };
    createDetails();

    const messageQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("sent_at", "asc"),
    );
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      setMessages(snapshot.docs.map((f) => ({ id: f.id, ...f.data() })));
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    set("chats", chatId).value({
      last_message: input.trim(),
      last_sent_at: serverTimestamp(),
    });
    add("chats", chatId, "messages").value({
      message: input.trim(),
      sender_id: userId,
      sent_at: serverTimestamp(),
    });
    addNotif({
      receiver_id: otherUserId,
      href: "/pet-owner/chat-field",
      type: "Sent a Message",
      params: {
        otherUserId,
        otherUserName,
        otherUserImgPath: otherUserImgPath ?? null,
      },
    });
    setInput("");

    // const newMessage: TMessage = {
    //   id: Date.now().toString(),
    //   text: input,
    //   sender: "me",
    // };
    // setMessages((prev) => [...prev, newMessage]); // append, not prepend
    // setInput("");

    // setTimeout(() => {
    //   flatListRef.current?.scrollToEnd({ animated: true });
    // }, 100);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    set("chats", chatId).value({
      last_message: "Sent an image.",
      last_sent_at: serverTimestamp(),
    });
    const img_path = await uploadImageUri(result.assets[0].uri);
    add("chats", chatId, "messages").value({
      img_path: img_path,
      sender_id: userId,
      sent_at: serverTimestamp(),
    });
    addNotif({
      receiver_id: otherUserId,
      href: "/pet-owner/chat-field",
      type: "Sent a Image",
      params: {
        otherUserId,
        otherUserName,
        otherUserImgPath: otherUserImgPath ?? null,
      },
    });

    // const newMessage: TMessage = {
    //   id: Date.now().toString(),
    //   image: result.assets[0].uri,
    //   sender: "me",
    //   text: "",
    // };
    // setMessages((prev) => [...prev, newMessage]); // append

    // setTimeout(() => {
    //   flatListRef.current?.scrollToEnd({ animated: true });
    // }, 100);
  };

  const handleSeeProfile = () => {
    if (otherUserId === userId) {
      router.push("/pet-owner/profile");
      return;
    }

    router.push({
      pathname: "/usable/user-profile",
      params: { userToViewId: otherUserId },
    });
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === userId;
    return (
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
      >
        {item.message ? (
          <Text
            style={[styles.bubbleText, isMe ? styles.myText : styles.otherText]}
          >
            {item.message}
          </Text>
        ) : null}

        {
          item.img_path ? (
            <Image source={{ uri: item.img_path }} style={styles.chatImage} />
          ) : null
          // <Image
          //   source={{
          //     uri: "https://res.cloudinary.com/diwwrxy8b/image/upload/v1769641991/jzibxr8wuvqhfqwcnusm.jpg",
          //   }}
          //   style={styles.chatImage}
          // />
        }
      </View>
    );
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.white }]}>
      {/* Header */}
      <HeaderLayout noBorderRadius height={75} bottomBorder>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="black" />
          </TouchableOpacity>

          <Pressable
            onPress={() => handleSeeProfile()}
            // style={styles.followButton}
          >
            <View style={styles.userInfo}>
              <Image source={{ uri: otherUserImgPath }} style={styles.avatar} />
              <Text style={styles.userName}>{otherUserName}</Text>
            </View>
          </Pressable>

          <FontAwesome6
            name="video"
            size={20}
            color={Colors.primary}
            style={{ position: "absolute", right: 10, marginTop: 10 }}
          />
        </View>
      </HeaderLayout>

      {/* Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end", // 👈 keeps messages at bottom
              padding: 10,
            }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#aaa", fontSize: 14 }}>
                  No messages yet 👋
                </Text>
              </View>
            )}
          />

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <MaterialIcons
                name="photo-camera"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <MaterialIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatField;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    gap: 5,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },

  // Chat bubbles
  bubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
    ...ShadowStyle,
  },
  otherBubble: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
    ...ShadowStyle,
  },
  bubbleText: {
    fontSize: 14,
  },
  myText: {
    color: "white",
  },
  otherText: {
    color: Colors.primary,
  },
  chatImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 5,
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 0.3,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },

  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  iconButton: {
    marginRight: 8,
  },
});
