import { useAppContext } from "@/AppsProvider";
import { add, collectionName, serverTimestamp } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CreateGc = () => {
  const {userId} = useAppContext()

  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [users, setUsers] = useState<any>([]);

  useOnFocusHook(() => {
    collectionName('users')
    .whereNotEquals('id', userId)
    .get()
    .then(({docs}) => {
      const _users = []
      for (const dc of docs) {
        const d = dc.data()
        if (d.is_page) continue

        _users.push({
          id:d.id,
          name: `${d.firstname} ${d.lastname}`,
          img_path: d.img_path,
          is_page: d.is_page ?? false
        })
      }
      
      setUsers(_users)
    })
  }, [])

  const filteredUsers = users.filter((u:any) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (groupName.trim().length == 0){
      Alert.alert("Error", "Please provide a group name!!!")
      return
    }
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select users to create group!!!")
      return;
    }

      add("chats").value({
        users: [userId, ...selectedUsers],
        group:true,
        group_name: groupName.trim(),
        created_at: serverTimestamp(),
        last_sent_at: serverTimestamp(),
      });
    router.back();
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <View style={styles.headerRow}>
          <HeaderWithActions
            title="Create Group"
            onBack={() => router.back()}
          />
          <Pressable
            onPress={handleCreate}
            disabled={selectedUsers.length === 0}
            style={[styles.createButton]}
          >
            <Text
              style={[
                styles.createButtonText,
                selectedUsers.length === 0 && styles.disabledButtonText,
              ]}
            >
              Create
            </Text>
          </Pressable>
        </View>
      </HeaderLayout>

      <View style={styles.container}>
        {/* Group Name */}
        {/* Group Name */}
        <View style={styles.groupNameInput}>
          <FontAwesome6
            name="users"
            size={18}
            color={Colors.primary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Group Name"
            placeholderTextColor="#A0A0A0"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.groupNameTextInput}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color="#888"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Suggested */}
        <Text style={styles.suggestedTitle}>Suggested</Text>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = selectedUsers.includes(item.id);
            return (
              <Pressable
                onPress={() => toggleUserSelection(item.id)}
                style={[
                  styles.userRow,
                  selected && styles.userRowSelected,
                  selected && styles.shadow,
                ]}
              >
                <Image source={{ uri: item.img_path }} style={styles.avatar} />
                <Text style={styles.userName}>{item.name}</Text>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default CreateGc;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createButton: {
    marginRight: 5,
    marginTop: 20,
  },
  createButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
  },

  disabledButtonText: {
    color: "#94A3B8",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  groupNameInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  groupNameTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontFamily: "Roboto",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonlogin,
    borderRadius: 25,
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10,
    height: 45,
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000",
  },
  suggestedTitle: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    marginTop: 22,
    marginBottom: 10,
    color: "#1E293B",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  userRowSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: Colors.primary,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "bold",
  },
  shadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
