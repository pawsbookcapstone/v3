import { useAppContext } from "@/AppsProvider";
import { db } from "@/helpers/firebase";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useNotificationHook } from "@/hooks/notificationHook";
import { Colors } from "@/shared/colors/Colors";
import SkeletalLoader from "@/shared/components/ChatSkeletal";
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
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Tchat = {
  id: string;
  name: string;
  message: string;
  avatar: string;
  time: string;
  lastMessage: string;
  type: "personal" | "group"; // ✅ Added type field
};

const Chat = () => {
  const { userId, isPage } = useAppContext();

  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const [onlineUsers, setOnlineUsers] = useState<any>([
    // {
    //   id: "1",
    //   name: "Sophia",
    //   avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    // },
    // {
    //   id: "2",
    //   name: "James",
    //   avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    // },
    // {
    //   id: "3",
    //   name: "Olivia",
    //   avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    // },
    // {
    //   id: "4",
    //   name: "Liam",
    //   avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    // },
    // {
    //   id: "5",
    //   name: "Emma",
    //   avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    // },
    // {
    //   id: "6",
    //   name: "Noah",
    //   avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    // },
    // {
    //   id: "7",
    //   name: "Ava",
    //   avatar: "https://randomuser.me/api/portraits/women/37.jpg",
    // },
    // {
    //   id: "8",
    //   name: "Mason",
    //   avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    // },
  ]);

  const [messages, setMessages] = useState<any>([
    // {
    //   id: "1",
    //   name: "Sophia Miller",
    //   avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    //   lastMessage: "Hey, how are you?",
    //   time: "2m ago",
    //   message: "",
    //   type: "personal",
    // },
    // {
    //   id: "2",
    //   name: "James Anderson",
    //   avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    //   lastMessage: "Let’s meet tomorrow.",
    //   time: "10m ago",
    //   message: "",
    //   type: "personal",
    // },
    // {
    //   id: "gc1",
    //   name: "Pet Lovers",
    //   avatar: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   lastMessage: "New meetup this weekend!",
    //   time: "1h ago",
    //   message: "",
    //   type: "group",
    // },
    // {
    //   id: "gc2",
    //   name: "Vet Team",
    //   avatar: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   lastMessage: "Patient update shared.",
    //   time: "3h ago",
    //   message: "",
    //   type: "group",
    // },
    // {
    //   id: "3",
    //   name: "Olivia Taylor",
    //   avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    //   lastMessage: "I sent the files.",
    //   time: "1h ago",
    //   message: "",
    //   type: "personal",
    // },
    // {
    //   id: "4",
    //   name: "Liam Martinez",
    //   avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    //   lastMessage: "See you soon!",
    //   time: "3h ago",
    //   message: "",
    //   type: "personal",
    // },
  ]);

  const hasNotif = useNotificationHook()

  useEffect(() => {
    if (!userId) return

    const messageQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", userId),
      orderBy("last_sent_at", "desc"),
    );
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((d) => {
          const t = d.data();
          if (t.group){
            return {
              id: d.id,
              name: t.group_name,
              users: t.users,
              group: true,
              img_path: '',
              last_message: t.last_message ?? 'No message yet.',
              time: computeTimePassed(t.last_sent_at?.toDate())
            }
          }
          const otherUserId = t.users[0] === userId ? t.users[1] : t.users[0];
          return {
            id: otherUserId,
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
        where('active_status', '!=', 'inactive'),
    );
    const unsubscribeOnline = onSnapshot(onlineQuery, ({docs}) => {
        setOnlineUsers(
          docs
            .map((res) => {
              const d = res.data();
              return {
                id: res.id,
                name: `${d.firstname} ${d.lastname}`,
                avatar: d.img_path,
                active_status: d.active_status,
                last_online_at: d.last_online_at
              };
            })
            .filter((v) => v.id !== userId),
        )
    })

    return () => {
      unsubscribeOnline();
      unsubscribe();
    };
  }, [userId]);

  const handleChat = (chat: any) => {
    if (chat.group) {
      router.push({
        pathname: "/pet-owner/(chat)/group-chat",
        params: { chatDetailsStr:JSON.stringify(chat) },
      });
    } else {
      router.navigate({
        pathname: "/pet-owner/(chat)/chat-field",
        params: {
          otherUserId: chat.id,
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
        <Text style={styles.lastMessage}>{item.last_message}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </Pressable>
  );

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <HeaderLayout withLogo noBorderRadius height={90}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Inbox</Text>
          <View style={styles.headerActions}>
            {
              !isPage &&  
              <Pressable
                onPress={() => router.push("/pet-owner/(chat)/create-gc")}
              >
                <Feather name="users" size={24} color="black" />
              </Pressable>
            }
            <Pressable
              onPress={() => router.push("/pet-owner/(chat)/search-users")}
            >
              <Feather name="edit" size={24} color="black" />
            </Pressable>
            <Pressable onPress={() => router.push("/pet-owner/notifications")}>
              <Feather name="bell" size={24} color="black" />
                          {
                            hasNotif && 
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
                                  />}
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
        data={loading ? [] : messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListHeaderComponent={
          loading ? (
            <SkeletalLoader />
          ) : (
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
                    key={user.id}
                    style={styles.onlineUser}
                    onPress={() =>
                      handleChat({
                        id: user.id,
                        name: user.name,
                        img_path: user.avatar,
                        message: "",
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
          )
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
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
