import { useAppContext } from "@/AppsProvider";
import { add, all, get, orderBy, serverTimestamp, set } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { router } from "expo-router";
import { limit } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  findNodeHandle,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

type FriendStatus = "Friend" | "Pending Friend Request" | "Not Friend";

const initialSearches = [
  {
    id: "1",
    name: "John Doe",
    img_path: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
    img_path: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "Alex Carter",
    img_path: "https://randomuser.me/api/portraits/men/12.jpg",
  },
];

const Search = () => {
  const { userId, userName, userImagePath } = useAppContext();

  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [recentSearches, setRecentSearches] = useState<any>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useOnFocusHook(() => {
    const fetchUsers = async () => {
      const snap = await all("users");
      setUsers(
        snap.docs.map((user: any) => {
          const d = user.data();
          return {
            id: user.id,
            name: `${d.firstname} ${d.lastname}`,
            img_path: d.img_path,
          };
        })
      );

      const rsnap = await get("users", userId, "recent_searches").where(
          orderBy("date", "desc"),
          limit(10),
        );

        setRecentSearches(
          rsnap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name,
              img_path: d.img_path ?? "",
            };
          }),
        );
    };
    fetchUsers();
  }, []);

  const handleDelete = (id: string) => {
    setRecentSearches((prev:any) => prev.filter((item:any) => item.id !== id));
    setShowDropdown(false);
  };

  const openDropdown = (
    event: any,
    id: string // item id
  ) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 }); // position below dots
        setSelected(id);
        setShowDropdown(true);
      });
    }
  };

  const handleSelectUser = async (otherUser: any) => {
    set("users", userId, "recent_searches", otherUser.id).value({
      name: otherUser.name,
      img_path: otherUser.img_path ?? null,
      date: serverTimestamp(),
    });
    router.push({
      pathname: "/pet-owner/chat-field",
      params: {
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        otherUserImgPath: otherUser.img_path,
      },
    });
  };

  const renderItem = ({ item }: { item: (typeof initialSearches)[0] }) => (
    <TouchableOpacity onPress={() => handleSelectUser(item)}>
      <View style={styles.item}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Image source={{ uri: item.img_path }} style={styles.avatar} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchedItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => handleSelectUser(item)}>
      <View style={styles.item}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Image source={{ uri: item.img_path }} style={styles.avatar} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleSearch = async () => {
    try {
      setSearched(
        users.filter(
          (user: any) =>
            user.name.toLowerCase().includes(search.toLowerCase()) &&
            user.id !== userId
        )
      );
    } catch (e) {
      Alert.alert("Error", e + "");
    }
  };

  const handleAddFriend = async (otherUser: any) => {
    try {
      add("users", userId, "recent_searches").value({
        id: otherUser.id,
        name: otherUser.name,
        img_path: otherUser.img_path ?? null,
        date: serverTimestamp(),
      });
      await add("friends").value({
        users: [userId, otherUser.id],
        date_requested: serverTimestamp(),
        requested_by_id: userId,
        confirmed: false,
        details: {
          [userId]: {
            name: userName,
            img_path: userImagePath ?? null,
          },
          [otherUser.id]: {
            name: otherUser.name,
            img_path: otherUser.img_path ?? null,
          },
        },
      });
    } catch (e) {
      Alert.alert("Error", e + "");
    }
  };

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions onBack={() => router.back()}>
          <TextInput
            placeholder="Search Pawsbook"
            value={search}
            onChangeText={setSearch}
            onEndEditing={handleSearch}
            style={styles.input}
            placeholderTextColor="#888"
          />
        </HeaderWithActions>
      </HeaderLayout>

      {searched.length > 0 ? (
        <FlatList
          data={searched}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchedItem}
          contentContainerStyle={{
            paddingVertical: 10,
            backgroundColor: "white",
            marginTop: 12,
          }}
          ListHeaderComponent={() => (
            <Text style={styles.recentTitle}>Search Results</Text>
          )}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
              No recent searches
            </Text>
          )}
        />
      ) : null}

      <FlatList
        data={recentSearches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingVertical: 10,
          backgroundColor: "white",
          marginTop: 12,
        }}
        ListHeaderComponent={() => (
          <Text style={styles.recentTitle}>Recent Searches</Text>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
            No recent searches
          </Text>
        )}
      />

      {/* Dropdown modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdown,
              { top: dropdownPos.y, left: dropdownPos.x - 120 },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => selected && handleDelete(selected)}
            >
              <Text style={{ color: "red", fontSize: 14 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#f0ededff",
    borderRadius: 20,
    fontSize: 14,
    paddingHorizontal: 15,
    height: 40,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginLeft: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    ...ShadowStyle,
    width: 120,
  },
  dropdownItem: {
    paddingVertical: 8,
    alignItems: "center",
  },
});
