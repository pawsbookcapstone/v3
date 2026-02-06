import { Colors } from "@/shared/colors/Colors";
import SkeletalLoader from "@/shared/components/ChatSkeletal";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
};

const Chat = () => {
  // inside component
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  const [onlineUsers] = useState([
    {
      id: "1",
      name: "Sophia",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: "2",
      name: "James",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      id: "3",
      name: "Olivia",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    },
    {
      id: "4",
      name: "Liam",
      avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    },
    {
      id: "5",
      name: "Emma",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    {
      id: "6",
      name: "Emma",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    {
      id: "7",
      name: "Emma",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    {
      id: "8",
      name: "Emma",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
  ]);

  const messages: Tchat[] = [
    {
      id: "1",
      name: "Sophia Miller",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      lastMessage: "Hey, how are you?",
      time: "2m ago",
      message: "",
    },
    {
      id: "2",
      name: "James Anderson",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      lastMessage: "Let’s meet tomorrow.",
      time: "10m ago",
      message: "",
    },
    {
      id: "3",
      name: "Olivia Taylor",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
      lastMessage: "I sent the files.",
      time: "1h ago",
      message: "",
    },
    {
      id: "4",
      name: "Liam Martinez",
      avatar: "https://randomuser.me/api/portraits/men/50.jpg",
      lastMessage: "See you soon!",
      time: "3h ago",
      message: "",
    },
  ];

  const handleChat = (messages: Tchat) => {
    router.navigate({
      pathname: "/pet-owner/(chat)/chat-field",
      params: {
        id: messages.id,
        name: messages.name,
        avatar: messages.avatar,
      },
    });
  };

  const renderMessage = ({ item }: { item: (typeof messages)[0] }) => (
    <Pressable style={styles.messageCard} onPress={() => handleChat(item)}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
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
          <Pressable onPress={() => router.push("/pet-owner/notifications")}>
            <Feather name="bell" size={24} color="black" />
          </Pressable>
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

      <FlatList
        data={loading ? [] : messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListHeaderComponent={
          loading ? (
            <SkeletalLoader />
          ) : (
            <>
              {/* Online users + section title */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.onlineRow}
                style={{ marginBottom: 8 }}
              >
                {onlineUsers.map((user) => (
                  <Pressable
                    key={user.id}
                    style={styles.onlineUser}
                    onPress={() =>
                      handleChat({
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        message: "",
                        lastMessage: "",
                        time: "",
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
    // marginTop: 30,
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
    alignItems: "center", // keeps row compact
    marginTop: 15,
  },

  onlineUser: {
    alignItems: "center",
    marginRight: 5,
    width: 60,
  },
  avatarWrapper: {
    position: "relative", // needed for absolute positioning
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
    bottom: 2, // overlap bottom
    right: 2, // overlap right
    borderWidth: 2,
    borderColor: "#fff", // clean border around dot
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
