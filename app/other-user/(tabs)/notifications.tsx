import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import NotificationSkeleton from "@/shared/components/NotificationSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
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

// Dummy notifications data
const notificationsData = [
  {
    id: "1",
    name: "John Doe",
    profile: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "liked your post",
    type: "like",
    time: "2025-09-19T21:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    profile: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "commented on your photo",
    type: "comment",
    time: "2025-09-19T20:30:00Z",
  },
  {
    id: "3",
    name: "Alex Carter",
    profile: "https://randomuser.me/api/portraits/men/12.jpg",
    description: "Started following you",
    type: "friend_request",
    time: "2025-09-19T19:30:00Z",
  },
  {
    id: "4",
    name: "Emma Wilson",
    profile: "https://randomuser.me/api/portraits/women/22.jpg",
    description: "mentioned you in a comment",
    type: "mention",
    time: "2025-09-15T10:00:00Z",
  },
];

const Notifications = () => {
  const [data, setData] = useState(notificationsData);
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownPos, setDropdownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(notificationsData);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    // simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Sort notifications latest first
  const sortedNotifications = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [data]);

  const latest = sortedNotifications.filter(
    (n) => new Date(n.time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const previous = sortedNotifications.filter(
    (n) => new Date(n.time) <= new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((n) => n.id !== id));
    setSelected(null);
    setDropdownPos(null);
  };

  const handleFriendRequest = (id: string, accepted: boolean) => {
    setData((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              description: accepted
                ? "You Followed back"
                : "You declined the request",
              type: "info",
            }
          : n
      )
    );
  };

  const openDropdown = (event: any, id: string) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 });
        setSelected(id);
      });
    }
  };

  const renderItem = ({ item }: { item: (typeof data)[0] }) => (
    <View style={styles.notificationItem}>
      <Image source={{ uri: item.profile }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Friend request buttons */}
        {item.type === "friend_request" && (
          <View style={styles.friendButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
              onPress={() => handleFriendRequest(item.id, true)}
            >
              <Text style={{ color: "white", fontSize: 13 }}>Follow back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ddd" }]}
              onPress={() => handleFriendRequest(item.id, false)}
            >
              <Text style={{ color: "#333", fontSize: 13 }}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.time}>
        {new Date(item.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      {item.type !== "friend_request" && (
        <TouchableOpacity onPress={(e) => openDropdown(e.nativeEvent, item.id)}>
          <Entypo name="dots-three-vertical" size={18} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius height={90}>
        <Image
          source={require("../../../assets/images/logo/headerlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Notifications</Text>
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
            marginTop: 25,
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
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    top: 10,
    marginLeft: 10,
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: "flex-start",
    top: 30,
    marginBottom: 10,
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
    fontWeight: "600",
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
