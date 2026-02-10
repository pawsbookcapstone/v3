import { useAppContext } from "@/AppsProvider";
import { db } from "@/helpers/firebase";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useNotificationHook } from "@/hooks/notificationHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Chat = () => {
  const { userId, isPage } = useAppContext();

  const [onlineUsers, setOnlineUsers] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);

  const hasNotif = useNotificationHook();

  useOnFocusHook(() => {
    if (!userId) return;

    const messageQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", userId),
      orderBy("last_sent_at", "desc"),
    );
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((d) => {
          const t = d.data();
          const seen = (t.seen_by_ids ?? []).some(
            (user_id: string) => userId === user_id,
          );

          if (t.group) {
            return {
              id: d.id,
              name: t.group_name,
              users: t.users,
              group: true,
              seen,
              img_path: "",
              last_message: t.last_message ?? "No message yet.",
              time: computeTimePassed(t.last_sent_at?.toDate()),
            };
          }

          const otherUserId = t.users[0] === userId ? t.users[1] : t.users[0];
          return {
            user_id: otherUserId,
            id: d.id,
            seen,
            ...t[otherUserId],
            last_message: t.last_message,
            time: computeTimePassed(t.last_sent_at?.toDate()),
          };
        }),
      );
    });

    const onlineQuery = query(
      collection(db, "users"),
      where("online_status", "==", true),
      where("active_status", "!=", "inactive"),
    );
    const unsubscribeOnline = onSnapshot(onlineQuery, ({ docs }) => {
      setOnlineUsers(
        docs
          .map((res) => {
            const d = res.data();
            return {
              user_id: res.id,
              name: `${d.firstname} ${d.lastname}`,
              group: d.is_page ?? false,
              avatar: d.img_path,
              active_status: d.active_status,
              last_online_at: d.last_online_at,
            };
          })
          .filter((v) => v.user_id !== userId),
      );
    });

    return () => {
      unsubscribeOnline();
      unsubscribe();
    };
  }, [userId]);

  const handleChat = (chat: any) => {
    if (chat.group) {
      router.push({
        pathname: "/pet-owner/(chat)/group-chat",
        params: { chatDetailsStr: JSON.stringify(chat) },
      });
    } else {
      router.navigate({
        pathname: "/pet-owner/(chat)/chat-field",
        params: {
          otherUserId: chat.user_id,
          otherUserName: chat.name,
          otherUserImgPath: chat.img_path ?? null,
        },
      });
    }
  };

  const renderMessage = ({ item }: any) => (
    <Pressable style={styles.messageCard} onPress={() => handleChat(item)}>
      <Image source={{ uri: item.img_path }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.lastMessage, !item.seen && { fontWeight: "800" }]}>
          {item.last_message}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.time}>{item.time}</Text>
        {!item.seen && (
          <View
            style={{
              backgroundColor: Colors.secondary,
              width: 7,
              height: 7,
              borderRadius: "50%",
              marginTop: 5,
            }}
          />
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <HeaderLayout withLogo noBorderRadius height={90}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Inbox</Text>
          <View style={styles.headerActions}>
            {!isPage && (
              <Pressable
                onPress={() => router.push("/pet-owner/(chat)/create-gc")}
              >
                <Feather name="users" size={24} color="black" />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/pet-owner/(chat)/search-users")}
            >
              <Feather name="edit" size={24} color="black" />
            </Pressable>
            <Pressable onPress={() => router.push("/pet-owner/notifications")}>
              <Feather name="bell" size={24} color="black" />
              {hasNotif && (
                <View
                  style={{
                    position: "absolute",
                    top: -1,
                    right: 1,
                    width: 8,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: "red",
                  }}
                />
              )}
            </Pressable>
          </View>
        </View>
      </HeaderLayout>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather
          name="search"
          size={18}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput placeholder="Search" style={styles.searchInput} />
      </View>

      {/* Chat List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListHeaderComponent={
          // loading ? (
          //   <SkeletalLoader />
          // ) : (
          <>
            {/* Online users */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.onlineRow}
              style={{ marginBottom: 8 }}
            >
              {onlineUsers.map((user: any) => (
                <Pressable
                  key={user.user_id}
                  style={styles.onlineUser}
                  onPress={() =>
                    handleChat({
                      user_id: user.user_id,
                      name: user.name,
                      img_path: user.avatar,
                      message: "",
                      group: user.group,
                      lastMessage: "",
                      time: "",
                      type: "personal",
                    })
                  }
                >
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.onlineAvatar}
                    />
                    <View style={styles.onlineDot} />
                  </View>
                  <Text style={styles.onlineName}>{user.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
              Messages
            </Text>
          </>
        }
        // refreshControl={
        //   <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        // }
        contentContainerStyle={{ paddingBottom: 20, marginTop: 5 }}
      />
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    width: "95%",
    paddingHorizontal: 10,
    marginTop: 10,
    height: 40,
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    marginLeft: 12,
    color: "#000",
  },
  onlineRow: {
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 15,
  },
  onlineUser: {
    alignItems: "center",
    marginRight: 5,
    width: 60,
  },
  avatarWrapper: {
    position: "relative",
  },
  onlineAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineName: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: Colors.lightGray,
  },
  name: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  lastMessage: {
    fontSize: 13,
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
});
