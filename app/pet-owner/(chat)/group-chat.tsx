import { useAppContext } from "@/AppsProvider";
import { uploadImageUri } from "@/helpers/cloudinary";
import { add, collectionName, set } from "@/helpers/db";
import { db } from "@/helpers/firebase";
import { useNotifHook } from "@/helpers/notifHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const GroupChat = () => {
  const { userId } = useAppContext();

  const { chatDetailsStr }: { chatDetailsStr: string } = useLocalSearchParams();
  const [chatDetails] = useState(JSON.parse(chatDetailsStr));
  const { group_name } = useLocalSearchParams();

  // const [users, setUsers] = useState<any>({})

  const [messages, setMessages] = useState<any>([]);

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const addNotif = useNotifHook();

  useEffect(() => {
    // console.log("Chat Details:", group_name);
    if (!userId) return;

    let unsubscribe: any = null;

    collectionName("users")
      .whereNotEquals("id", userId)
      .whereIn("id", chatDetails.users)
      .get()
      .then(({ docs }) => {
        let users: any = {};

        for (const u of docs) {
          const h = u.data();
          users[u.id] = {
            name: `${h.firstname} ${h.lastname}`,
            avatar: h.img_path,
          };
        }

        const messageQuery = query(
          collection(db, "chats", chatDetails.id, "messages"),
          orderBy("sent_at", "asc"),
        );
        unsubscribe = onSnapshot(messageQuery, (snapshot) => {
          setMessages(
            snapshot.docs.map((f) => {
              const a = f.data();

              const yourMessage = a.sender_id === userId;
              const _user = yourMessage ? {} : users[a.sender_id];
              return {
                id: f.id,
                message: a.message,
                img_path: a.img_path,
                yourMessage: yourMessage,
                ..._user,
              };
            }),
          );
        });
      });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    set("chats", chatDetails.id).value({
      last_message: input.trim(),
      last_sent_at: serverTimestamp(),
    });
    add("chats", chatDetails.id, "messages").value({
      message: input.trim(),
      sender_id: userId,
      sent_at: serverTimestamp(),
    });

    for (const id of chatDetails.users) {
      if (id === userId) continue;

      addNotif({
        receiver_id: id,
        href: "/pet-owner/chat-field",
        type: "Sent a Message",
        params: {
          groupChatId: chatDetails.id,
        },
      });
    }
    setInput("");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    set("chats", chatDetails.id).value({
      last_message: "Sent an image.",
      last_sent_at: serverTimestamp(),
    });
    const img_path = await uploadImageUri(result.assets[0].uri);
    add("chats", chatDetails.id, "messages").value({
      img_path: img_path,
      sender_id: userId,
      sent_at: serverTimestamp(),
    });

    for (const id of chatDetails.users) {
      if (id === userId) continue;

      addNotif({
        receiver_id: id,
        href: "/pet-owner/chat-field",
        type: "Sent a Image",
        params: {
          groupChatId: chatDetails.id,
          groupChatName: chatDetails.name,
        },
      });
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.messageRow,
        item.yourMessage
          ? { justifyContent: "flex-end" }
          : { justifyContent: "flex-start" },
      ]}
    >
      {!item.yourMessage && item.avatar && (
        <Image source={{ uri: item.avatar }} style={styles.senderAvatar} />
      )}

      <View>
        {!item.yourMessage && item.name && (
          <Text style={styles.senderName}>{item.name}</Text>
        )}

        <View
          style={[
            styles.bubble,
            item.yourMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {item.message ? (
            <Text
              style={[
                styles.bubbleText,
                item.yourMessage ? styles.myText : styles.otherText,
              ]}
            >
              {item.message}
            </Text>
          ) : null}

          {item.img_path && (
            <Image source={{ uri: item.img_path }} style={styles.chatImage} />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[screens.screen, { backgroundColor: Colors.white }]}>
      {/* Header */}
      <HeaderLayout noBorderRadius height={75} bottomBorder>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="black" />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            {/* <Image
              source={{ uri: avatar as string }}
              style={styles.groupAvatar}
            />
            <Text style={styles.groupName}>{name}</Text> */}
            <Text style={styles.groupName}>{group_name}</Text>
          </View>
        </View>
      </HeaderLayout>

      {/* Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              padding: 10,
            }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={{ color: "#aaa", fontSize: 14 }}>
                  No messages yet 👋
                </Text>
              </View>
            )}
          />

          {/* Input */}
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

export default GroupChat;

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
  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  senderName: {
    fontSize: 11,
    color: "#777",
    marginLeft: 4,
    marginBottom: 2,
  },

  bubble: {
    width: "100%",
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

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
