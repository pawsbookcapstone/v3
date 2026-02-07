import { useAppContext } from "@/AppsProvider";
import {
  add,
  collectionName,
  get,
  orderBy,
  remove,
  serverTimestamp,
  set,
  where
} from "@/helpers/db";
import { useNotifHook } from "@/helpers/notifHook";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { limit } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

// const initialSearches = [
// {
//   id: string;
//   name: string;
//   img_path: string | null;
// }
// ];
type RecentSearch = {
  id: string;
  name: string;
  img_path: string | null;
};
const initialSearches: RecentSearch[] = [];

const Search = () => {
  const { userId, userName, userImagePath } = useAppContext();
  const [resultText, setResultText] = useState("");
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [recentSearches, setRecentSearches] = useState(initialSearches);
  const [selected, setSelected] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const addNotif = useNotifHook();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await get("users", userId, "recent_searches").where(
          orderBy("date", "desc"),
          limit(10),
        );

        setRecentSearches(
          snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              is_page: d.is_page,
              name: d.name,
              img_path: d.img_path ?? "",
            };
          }),
        );
      } catch (e) {
        console.log("Failed to fetch recent searches:", e);
      }


      const snap = await collectionName("users").get();
      const friendsSnap = await get("friends").where(
        where("users", "array-contains", userId),
      );
      let friendsData: { [key: string]: { id: string; status: FriendStatus } } =
        {};
      for (const i in friendsSnap.docs) {
        const sn = friendsSnap.docs[i];
        const _temp = sn.data();
        const otherUserId =
          _temp.users[0] === userId ? _temp.users[1] : _temp.users[0];
        friendsData[otherUserId] = {
          id: sn.id,
          status: _temp.confirmed ? "Friend" : "Pending Friend Request",
        };
      }
      setUsers(
        snap.docs.map((user: any) => {
          const d = user.data();
          const _friend = friendsData[user.id];
          return {
            id: user.id,
            is_page: d.is_page,
            name: `${d.firstname} ${d.lastname}`,
            img_path: d.img_path,
            status: _friend?.status ?? "Not Friend",
            friend_id: _friend?.id,
          };
        }),
      );
    };
    fetchUsers();
  }, []);

  const handleDelete = (id: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
    remove("users", userId, "recent_searches", id)
    setShowDropdown(false);
  };

  const openDropdown = (
    event: any,
    id: string, // item id
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

  // const handleSeeProfile = (item: any) => {
  //   router.push({
  //     pathname: "/usable/user-profile",
  //     params: { userToViewId: item },
  //   });
  // };

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      {/* Left side: pressable to view profile */}
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        activeOpacity={0.7}
        onPress={() => handleSeeProfile(item)
        }
      >
        <Image
          source={
            item.img_path
              ? { uri: item.img_path }
              : {
                  uri: "https://res.cloudinary.com/diwwrxy8b/image/upload/v1769641991/jzibxr8wuvqhfqwcnusm.jpg",
                }
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>

      {/* Right side: three-dot menu */}
      <TouchableOpacity onPress={(e) => openDropdown(e.nativeEvent, item.id)}>
        <Entypo name="dots-three-vertical" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchedItem = ({ item }: any) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.7}
        onPress={() => handleSeeProfile(item)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: item.img_path }} style={styles.avatar} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </TouchableOpacity>

      {/* {item.status === "Not Friend" && (
        <TouchableOpacity onPress={() => handleAddFriend(item)}>
          <Text>Add Friend</Text>
        </TouchableOpacity>
      )}
      {item.status === "Pending Friend Request" && (
        <TouchableOpacity onPress={() => handleCancelFriendRequest(item)}>
          <Text>Cancel Request</Text>
        </TouchableOpacity>
      )}
      {item.status === "Friend" && (
        <TouchableOpacity onPress={() => handleCancelFriendRequest(item)}>
          <Text>Unfriend</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  const handleSearch = async () => {
    try {
      setSearched(
        users.filter(
          (user: any) =>
            user.name.toLowerCase().includes(search.toLowerCase()) &&
            user.id !== userId,
        ),
      );
      // if (searched.length == 0) {
      //   setResultText("No search result");
      // }
    } catch (e) {
      Alert.alert("Error", e + "");
    }
  };

  const handleSeeProfile = (item:any) => {
    saveRecentSearch(item);

    if (item.is_page){
      router.push({
        pathname: "/other-user/profile",
        params: {
          pageId: item.id
        }
      });
      return
    }
    router.push({
      pathname: "/usable/user-profile",
      params: { userToViewId: item.id },
    })
  }

  const saveRecentSearch = async (item: any) => {
    if (!userId) return;

    try {
      await set("users", userId, "recent_searches", item.id).value({
        name: item.name,
        is_page: item.is_page,
        img_path: item.img_path ?? null,
        date: serverTimestamp(),
      });
    } catch (e) {
      console.log("Failed to save recent search:", e);
    }
  };

  const handleAddFriend = async (item: any) => {
    saveRecentSearch(item);

    // ✅ change text immediately
    setUsers((prev: any) =>
      prev.map((u: any) =>
        u.id === item.id ? { ...u, status: "Pending Friend Request" } : u,
      ),
    );

    try {
      const res = await add("friends").value({
        users: [userId, item.id],
        date_requested: serverTimestamp(),
        requested_by_id: userId,
        confirmed: false,
        details: {
          // Save info of the friend you are requesting
          [item.id]: {
            name: item.name,
            img_path: item.img_path ?? "",
          },
          // Optionally, save current user info too
          [userId]: {
            name: userName,
            img_path: userImagePath ?? "",
          },
        },
      });
      console.log(res.id);
      
      addNotif({
        receiver_id: item.id,
        href: "/pet-owner/add-friend",
        type: "Sent Friend Request",
        params: {
          id: res.id,
        }
      });
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  };

  const handleCancelFriendRequest = async (item: any) => {
    saveRecentSearch(item);
    setUsers((prev: any) =>
      prev.map((u: any) =>
        u.id === item.id ? { ...u, status: "Not Friend" } : u,
      ),
    );

    try {
      await remove("friends", item.friend_id);
    } catch (e) {
      Alert.alert("Error", String(e));
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

      {
        searched.length > 0 ? (
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
              <Text
                style={{ textAlign: "center", color: "gray", marginTop: 20 }}
              >
                No recent searches
              </Text>
            )}
          />
        ) : null

        // <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
        //   {resultText}
        // </Text>
      }

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
            No Recent Searches
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
