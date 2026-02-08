import { useAppContext } from "@/AppsProvider";
import { collectionGroupName, collectionName, remove } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Entypo, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

const Followers = () => {
  const {userId} = useAppContext()

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    "followers"
  );
  const [search, setSearch] = useState("");

  // followers
  const [followers, setFollowers] = useState<any>([]);

  // following
  const [following, setFollowing] = useState<any>([]);

  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  useOnFocusHook(() => {
    const fetch = async() => {
      const followerIds = await collectionName("users", userId, "followers")
        .getMapped((id, _) => id)
      const followingIds = (await collectionGroupName("followers")
        .whereEquals("follower_id", userId)
        .get()).docs.map(d => d.ref.parent.parent?.id)
        
        if (followerIds.length > 0){
          const _followers = await collectionName("users")
            .whereIn("id", followerIds)
            .getMapped((_, data) => ({
              id: data.id, 
              name: `${data.firstname} ${data.lastname}`,
              img_path: data.img_path
            })) 
          setFollowers(_followers)
        }

      if (followingIds.length == 0) return

      collectionName("users")
        .whereEquals("is_page", true)
        .whereIn("id", followingIds)
        .getMapped((_, data) => ({
          id: data.id, 
          name: `${data.firstname} ${data.lastname}`,
          img_path: data.img_path
        })) 
        .then(res => {
          setFollowing(res)
        })
    }
    fetch()
  }, [])

  const openDropdown = (event: any, friend: any) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 });
        setSelectedFriend(friend);
        setShowDropdown(true);
      });
    }
  };

  const handleRemove = () => {
    if (selectedFriend) {
      if (activeTab === "followers") {
        setFollowers(followers.filter((f:any) => f.id !== selectedFriend.id));
        remove("users", userId, "followers", selectedFriend.id)
      } else {
        setFollowing(following.filter((f:any) => f.id !== selectedFriend.id));
        remove("users", selectedFriend.id, "followers", userId)
      }
      setSelectedFriend(null);
      setModalVisible(false);
    }
  };

  const renderFriend = ({ item }: { item: any }) => (
    <View style={styles.friendCard}>
      <View>
        <Image source={{ uri: item.img_path }} style={styles.profilePic} />
        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
      </View>

      <TouchableOpacity onPress={(e) => openDropdown(e, item)}>
        <Entypo name="dots-three-vertical" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );

  const data =
    activeTab === "followers"
      ? followers.filter((f:any) =>
          f.name.toLowerCase().includes(search.toLowerCase())
        )
      : following.filter((f:any) =>
          f.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Connections"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* Tabs */}

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#000" />
          <TextInput
            placeholder={`Search ${activeTab}`}
            placeholderTextColor="#808080"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "followers" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("followers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "followers" && styles.activeTabText,
            ]}
          >
            Followers
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "following" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("following")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following" && styles.activeTabText,
            ]}
          >
            Following
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={{
          padding: 15,
          backgroundColor: "#fff",
          marginTop: 5,
        }}
      />

      {/* Dropdown */}
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
              <Text style={styles.dropdownText}>Remove</Text>
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
              Remove {selectedFriend?.name} from your {activeTab}?
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
                onPress={handleRemove}
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

export default Followers;

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginLeft: 15,
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    color: "#666",
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  activeTabText: {
    color: "#fff",
  },
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
