import { useAppContext } from "@/AppsProvider";
import { get, remove, where } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  findNodeHandle,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

const myFriends = () => {
  const { userId } = useAppContext();

  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<any>([
    // {
    //   id: "1",
    //   name: "Jane Smith",
    //   profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
    //   mutualFriends: 10,
    //   online: true,
    // },
    // {
    //   id: "2",
    //   name: "Michael Johnson",
    //   profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    //   mutualFriends: 5,
    //   online: false,
    // },
    // {
    //   id: "3",
    //   name: "Emily Davis",
    //   profilePic: "https://randomuser.me/api/portraits/women/68.jpg",
    //   mutualFriends: 8,
    //   online: true,
    // },
    // {
    //   id: "4",
    //   name: "David Wilson",
    //   profilePic: "https://randomuser.me/api/portraits/men/45.jpg",
    //   mutualFriends: 2,
    //   online: false,
    // },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const snap = await get("friends").where(
        where("users", "array-contains", userId),
        where("confirmed", "==", true)
      );
      setFriends(
        snap.docs.map((user: any) => {
          const data = user.data();
          const otherUserId =
            data.users[0] === userId ? data.users[1] : data.users[0];
          return {
            ...data.details[otherUserId],
            id: user.id,
          };
        })
      );
    };
    fetch();
  }, []);

  // open dropdown under tapped dots
  const openDropdown = (event: any, friend: any) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 }); // position below dots
        setSelectedFriend(friend);
        setShowDropdown(true);
      });
    }
  };

  const handleRemoveFriend = () => {
    if (!selectedFriend) return;

    remove("friends", selectedFriend.id);
    setFriends(friends.filter((f: any) => f.id !== selectedFriend.id));
    setSelectedFriend(null);
    setModalVisible(false);
  };

  const renderFriend = ({ item }: any) => (
    <View style={styles.friendCard}>
      <View>
        <Image source={{ uri: item.img_path }} style={styles.profilePic} />
        {/* {item.online && <View style={styles.onlineDot} />} */}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {/* <Text style={styles.mutual}>{item.mutualFriends} mutual friends</Text> */}
      </View>
      <TouchableOpacity onPress={(e) => openDropdown(e, item)}>
        <Entypo name="dots-three-vertical" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Friends"
          onBack={() => router.back()}
          onAction={() => router.push("/pet-owner/search")}
          actionIcon="search"
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#000" />
          <TextInput
            placeholder="Search Friends"
            placeholderTextColor="#808080"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends.filter((f: any) =>
          f.name.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={{
          padding: 15,
          backgroundColor: "#fff",
          marginTop: 5,
        }}
      />

      {/* Floating Dropdown */}
      {showDropdown && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdown,
              { top: dropdownPos.y, left: dropdownPos.x - 100 },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setShowDropdown(false);
                setModalVisible(true);
              }}
            >
              <Text style={styles.dropdownText}>Unfriend</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      {/* Confirm Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Remove {selectedFriend?.name} as a friend?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#000" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "red" }]}
                onPress={handleRemoveFriend}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default myFriends;

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
    flex: 1,
    marginLeft: 8,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginLeft: 12,
  },
  mutual: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#666",
    marginLeft: 12,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 5,
  },
  dropdownText: {
    fontSize: 14,
    color: "red",
    fontFamily: "RobotoSemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
