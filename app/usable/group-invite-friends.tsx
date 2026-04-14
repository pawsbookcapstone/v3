import { Colors } from "@/shared/colors/Colors";
import { screens } from "@/shared/styles/styles";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ HEADER
import { useAppContext } from "@/AppsProvider";
import { all, collectionName, set } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";

const InviteFriends = () => {
  const { userId } = useAppContext();
  const { groupId }: { groupId: string } = useLocalSearchParams();

  const [search, setSearch] = useState("");

  // ✅ STATIC FRIEND LIST
  const [friends] = useState<any>([]);

  const [friendList, setFriendList] = useState(friends);

  useOnFocusHook(() => {
    const fetch = async () => {
      const members = await all("groups", groupId, "members");
      const memberIds = members.docs.map((m) => {
        return m.data().userId;
      });
      const invited = await collectionName(
        "groups",
        groupId,
        "invites",
      ).getMapped((id, data) => data.userId);

      const snap = await collectionName("users")
        .whereNotIn("id", [...memberIds, userId])
        .get();
      setFriendList(
        snap.docs.map((user: any) => {
          const d = user.data();
          return {
            id: user.id,
            name: `${d.firstname} ${d.lastname}`,
            image: d.img_path,
            invited: invited.includes(user.id),
          };
        }),
      );
    };
    fetch();
  });

  // ✅ INVITE ACTION (STATIC)
  const handleInvite = (id: string) => {
    set("groups", groupId, "invites", id).value({ userId: id });
    setFriendList((prev: any) =>
      prev.map((f: any) => (f.id === id ? { ...f, invited: true } : f)),
    );
  };

  // ✅ FILTER SEARCH
  const filtered = friendList.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Profile */}
      <Image source={{ uri: item.image }} style={styles.avatar} />

      {/* Name */}
      <Text style={styles.name}>{item.name}</Text>

      {/* Invite Button */}
      <TouchableOpacity
        style={[
          styles.inviteBtn,
          item.invited && { backgroundColor: "#94A3B8" },
        ]}
        onPress={() => handleInvite(item.id)}
        disabled={item.invited}
      >
        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* ✅ HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Invite Friends"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search friends..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* FRIEND LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No friends found
          </Text>
        }
      />
    </View>
  );
};

export default InviteFriends;
const styles = StyleSheet.create({
  searchContainer: {
    margin: 15,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  searchInput: {
    height: 40,
    fontSize: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },

  name: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
  },

  inviteBtn: {
    backgroundColor: "#38BDF8",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  inviteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
