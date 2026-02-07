import { useAppContext } from "@/AppsProvider";
import { all, get, remove, where } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BlockList = () => {
  const {userId} = useAppContext()
  
  const [blockedUsers, setBlockedUsers] = useState<any>([
    // {
    //   id: "1",
    //   name: "Jane Doe",
    //   avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    // },
    // {
    //   id: "2",
    //   name: "John Smith",
    //   avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    // },
    // {
    //   id: "3",
    //   name: "Emily Johnson",
    //   avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    // },
  ]);

  const [message, setMessage] = useState("");
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useOnFocusHook(() => {
    const fetch = async () => {
      const snap = await all("users", userId, "blocked_users")
      if (snap.empty) return
      
      const userIds = snap.docs.map(d => d.id)
      const userSnap = await get("users").where(where("id", "in", userIds))
      setBlockedUsers(userSnap.docs.map(d => {
        const v = d.data()
        return{
          id: d.id,
          name:`${v.firstname} ${v.lastname}`,
          avatar: v.img_path ?? ''
        }
      }))
    }

    fetch()
  }, [])

  const showMessage = (msg: string) => {
    setMessage(msg);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMessage(""));
    }, 2500);
  };

  const handleUnblock = (user: any) => {
    if (user) showMessage(`${user.name} has been unblocked.`);
    setBlockedUsers(blockedUsers.filter((_user:any) => _user.id !== user.id));
    remove("users", userId, "blocked_users", user.id)
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={24} color="#888" />
          </View>
        )}
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subtext}>Blocked user</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleUnblock(item)}
        activeOpacity={0.8}
        style={styles.unblockButton}
      >
        <FontAwesome name="unlock" size={16} color="#fff" />
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Blocked Users"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Animated message bar */}
      {message ? (
        <Animated.View
          style={[
            styles.messageBar,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.container}>
        {blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={64}
              color={Colors.gray}
              style={{ opacity: 0.5 }}
            />
            <Text style={styles.emptyTitle}>No Blocked Users</Text>
            <Text style={styles.emptySubtitle}>
              You haven’t blocked anyone yet.{"\n"}Blocked users will appear
              here once added.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  messageText: {
    color: "#fff",
    fontSize: 14.5,
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 12,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  subtext: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  unblockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  unblockText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#eaeaea",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
});
