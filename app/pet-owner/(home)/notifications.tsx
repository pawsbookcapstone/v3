import { useAppContext } from "@/AppsProvider";
import { find, get, remove, set, update, where } from "@/helpers/db";
import { NotifType, useNotifHook } from "@/helpers/notifHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import NotificationSkeleton from "@/shared/components/NotificationSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Entypo } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  findNodeHandle,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

type NotificationItem = {
  id: string;
  name: string;
  profile: string;
  href: Href;
  sender_id: string;
  accepted:boolean;
  description: string;
  type: NotifType;
  time: string; // ISO string
  seen: boolean;
  params?: any; // ISO string
};

const descriptions: any = {
  Like: "Liked your post",
  Comment: "Commented on your post",
  "Sent Friend Request": "Sent you a friend request",
  "Confirm Friend Request": "Accepted your friend request",
  "Sent a Message": "Sent you a message",
  "Sent a Image": "Sent you an image",
  "Share": "Shared your post",
};

const Notifications = () => {
  const [data, setData] = useState<NotificationItem[]>([]);

  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const addNotif = useNotifHook()

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const { userId } = useAppContext();
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const snapshot = await get("notifications").where(
        where("receiver_id", "==", userId),
      );

      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();

        let desc
        if (data.friend_request_accepted != undefined){
          desc = data.friend_request_accepted ? "You accepted the request"
                : "You declined the request"
        }
        else desc = descriptions[data.type] ?? ''

        return {
          id: doc.id,
          name: data.sender_name || "Unknown",
          profile: data.sender_img_path || "",
          description: desc,
          sender_id: data.sender_id,
          seen: data.seen,
          href: data.href,
          accepted: data.friend_request_accepted,
          type: data.type || "info",
          time: data.sent_at.toDate(),
          params: data.params
        };
      });

      setData(notifications);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useOnFocusHook(() => {
    fetchNotifications();
  }, []);

  // Sort notifications latest first
  const sortedNotifications = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }, [data]);

  const latest = sortedNotifications.filter(
    (n) => new Date(n.time) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  );
  const previous = sortedNotifications.filter(
    (n) => new Date(n.time) <= new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((n) => n.id !== id));
    setSelected(null);
    setDropdownPos(null);
  };

  const handleFriendRequest = async (item:any, accepted: boolean) => {
    const friendSnap = await find('friends', item.params?.id)

    if (accepted && !friendSnap.exists())
    {
      Alert.alert("Error", "You already declined this request or this request was cancelled!!!")
      setFriendReqData(item.id, false)
      return
    }
    if (!accepted && friendSnap.exists() && friendSnap.data().confirmed)
    {
      Alert.alert("Error", "You already confirmed this request!!!")
      setFriendReqData(item.id, true)
      return
    }
    setFriendReqData(item.id, accepted)
    
    if (accepted){
      set('friends', item.params?.id).value({confirmed: true})
      addNotif({
        receiver_id: item.sender_id,
        href: "/usable/user-profile",
        type: "Confirm Friend Request",
        params: {userToViewId: userId},
      });
    }
    else
      remove("friends", item.params?.id);
  };

  const setFriendReqData = (id:string, accepted:boolean) => {
    set('notifications',id).value({
      friend_request_accepted: accepted,
      seen: true
    })
    setData((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              seen: true,
              accepted: accepted,
              description: accepted
                ? "You accepted the request"
                : "You declined the request",
            }
          : n,
      ),
    ); 
  }

  const openDropdown = (event: any, id: string) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 });
        setSelected(id);
      });
    }
  };

  const navigate = (item:any) => {
    update('notifications', item.id).value({
      seen: true
    })

    if (item.type === 'Sent a Message' && item.params.groupChatId){
      find('chats', item.params.groupChatId).then(g => {
        router.push({
          pathname: '/pet-owner/group-chat',
          params: {
            chatDetailsStr: JSON.stringify({
              id: g.id,
              ...g.data()
            })
          }
        })
      })
      return
    }
    
    router.push({
      pathname: item.href,
      params: item.params
    })
  }

  const seeProfile = (sender_id:string) => {
    if (sender_id === userId) {
      router.push('/pet-owner/profile')
      return
    }
    router.push({
      pathname: '/usable/user-profile',
      params: {
        userToViewId: sender_id,
      }
    })
  }

  const renderItem = ({ item }: { item: (typeof data)[0] }) => (
        <TouchableOpacity onPress={() => navigate(item)}>
    <View style={[styles.notificationItem, (!item.seen && {backgroundColor: Colors.veryLightGray} )]}>
      <TouchableOpacity onPress={() => seeProfile(item.sender_id)}>
        <Image source={{ uri: item.profile }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.description, (!item.seen && {fontWeight: "800"} )]}>{item.description}</Text>

        {/* Friend request buttons */}
        {item.type === "Sent Friend Request" && item.accepted == undefined && (
          <View style={styles.friendButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
              onPress={() => handleFriendRequest(item, true)}
            >
              <Text style={{ color: "white", fontSize: 13 }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ddd" }]}
              onPress={() => handleFriendRequest(item, false)}
            >
              <Text style={{ color: "#333", fontSize: 13 }}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{alignItems:'flex-end'}}>
        <Text style={styles.time}>
          {new Date(item.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {!item.seen && <View style={{backgroundColor: Colors.red, width: 8, height: 8, borderRadius: "50%", marginTop: 5, marginRight: 8}}/>}
      </View>

      {item.type !== "Sent Friend Request" && (
        <TouchableOpacity onPress={(e) => openDropdown(e.nativeEvent, item.id)}>
          <Entypo name="dots-three-vertical" size={18} color="gray" />
        </TouchableOpacity>
      )}
    </View>
    </TouchableOpacity>
  );

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Notifications"
          onBack={() => router.back()}
          onAction={() => router.push("/pet-owner/search")}
          actionIcon="search"
          centerTitle={true}
        />
      </HeaderLayout>
      {loading ? (
        <FlatList
          data={Array.from({ length: 6 })} // 6 skeleton rows
          keyExtractor={(_, i) => i.toString()}
          renderItem={() => <NotificationSkeleton />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <FlatList
          data={latest}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 20,
            backgroundColor: "white",
            marginTop: 5,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
              No recent notifications
            </Text>
          )}
          ListHeaderComponent={
            latest.length > 0 ? (
              <Text style={styles.sectionTitle}>Latest</Text>
            ) : null
          }
          ListFooterComponent={
            previous.length > 0 ? (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Previous Notifications</Text>
                <FlatList
                  data={previous}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                />
              </View>
            ) : null
          }
        />
      )}

      {/* Dropdown menu */}
      {selected && dropdownPos && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setSelected(null);
            setDropdownPos(null);
          }}
        >
          <View
            style={[
              styles.dropdown,
              { top: dropdownPos.y, left: dropdownPos.x - 100 },
            ]}
          >
            <Pressable
              style={styles.dropdownItem}
              onPress={() => handleDelete(selected)}
            >
              <Text style={styles.dropdownText}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 55,
    marginLeft: 15,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },
  description: {
    fontSize: 13,
    color: "#555",
  },
  time: {
    fontSize: 12,
    color: "gray",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
    marginVertical: 10,
    color: "#111",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 6,
    ...ShadowStyle,
    paddingVertical: 5,
    minWidth: 120,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 14,
    color: "red",
    fontWeight: "500",
  },
  friendButtons: {
    flexDirection: "row",
    marginTop: 5,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 35,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
