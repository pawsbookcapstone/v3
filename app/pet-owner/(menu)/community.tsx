import { Colors } from "@/shared/colors/Colors";
import { CommunitySkeleton } from "@/shared/components/CommunitySkeleton";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, RefreshControl } from "react-native";

import { useAppContext } from "@/AppsProvider";
import { all } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { TGroup } from "@/shared/Types/GroupType";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Community = () => {
  const { userId, userName, userImagePath } = useAppContext();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "Suggestion" | "JoinedGroup" | "MyGroup"
  >("Suggestion");
  const [search, setSearch] = useState("");

  // Dummy suggestion data
  // const suggestionData: TGroup[] = [
  //   // {
  //   //   id: "1",
  //   //   title: "Healthy Pet Food Ideas",
  //   //   members: 124,
  //   //   profile: "https://randomuser.me/api/portraits/women/32.jpg",
  //   //   privacy: "Private",
  //   // },
  //   // {
  //   //   id: "2",
  //   //   title: "Local Dog Walkers",
  //   //   members: 87,
  //   //   profile: "https://randomuser.me/api/portraits/men/46.jpg",
  //   //   privacy: "Private",
  //   // },
  //   // {
  //   //   id: "3",
  //   //   title: "Pet Training Tips",
  //   //   members: 210,
  //   //   profile: "https://randomuser.me/api/portraits/women/68.jpg",
  //   //   privacy: "public",
  //   // },
  // ];
  const [suggestionData, setSuggestionData] = useState<TGroup[]>([]);
  // Dummy Joined Groups
  const [joinedGroupData, setJoinedGroupData] = useState<TGroup[]>([
    // {
    //   id: "10",
    //   title: "Pet Grooming Hub",
    //   members: 120,
    //   profile: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   privacy: "public",
    // },
    // {
    //   id: "11",
    //   title: "Animal Rescue Volunteers",
    //   members: 80,
    //   profile: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   privacy: "private",
    // },
  ]);

  // Dummy My Groups
  const [myGroupData, setMyGroupData] = useState<TGroup[]>([
    // {
    //   id: "1",
    //   title: "Cat Lovers PH",
    //   members: 56,
    //   profile: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   privacy: "public",
    // },
    // {
    //   id: "2",
    //   title: "Vet Finder",
    //   members: 32,
    //   profile: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    //   privacy: "public",
    // },
  ]);

  useOnFocusHook(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const query = await all("groups");

      const items = query.docs.map((doc) => {
        const data = doc.data();

        let image: string | null = null;

        if (typeof data.profile === "string" && data.profile.trim() !== "") {
          image = data.profile;
        } else if (data.images && typeof data.images === "object") {
          const values = Object.values(data.images).filter(
            (url) => typeof url === "string",
          );
          if (values.length > 0) {
            image = values[0];
          }
        }

        return {
          id: doc.id,
          title: data.title,
          members: data.members,
          profile: image,
          privacy: data.privacy,
          questions: data.questions || [],
          description: data.description,
          createdAt: data.createdAt,
          groupOwnerId: data.groupOwnerId,
        };
      });

      const queryJoined = await all("users", userId, "joined-groups");
      const joinedGroupIds = queryJoined.docs.map((doc) => doc.id);
      const myJoined = items.filter((group) =>
        joinedGroupIds.includes(group.id),
      );

      const myGroups = items.filter((group) => group.groupOwnerId === userId);
      const suggestions = items.filter(
        (group) =>
          group.groupOwnerId !== userId && !joinedGroupIds.includes(group.id),
      );

      setSuggestionData(suggestions);
      setMyGroupData(myGroups);
      setJoinedGroupData(myJoined);

      // console.log("Fetched groups:", queryMyGroup);
    } catch (error) {
      console.log("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setRefreshing(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  };

  // Handle new group passed from create-group
  useEffect(() => {
    if (params.newGroup) {
      try {
        const newGroup = JSON.parse(params.newGroup as string);
        setMyGroupData((prev) => {
          const exists = prev.some((g) => g.id === newGroup.id);
          return exists ? prev : [newGroup, ...prev];
        });
        setActiveTab("MyGroup");
      } catch (e) {
        console.warn("Invalid group data", e);
      }
    }
  }, [params.newGroup]);

  // Filter data based on active tab and search
  const filteredData = useMemo(() => {
    let data: TGroup[] = [];

    if (activeTab === "Suggestion") data = suggestionData;
    else if (activeTab === "JoinedGroup") data = joinedGroupData;
    else data = myGroupData;

    if (!search.trim()) return data;

    const lowerSearch = search.toLowerCase();
    return data.filter((item) =>
      item.title.toLowerCase().includes(lowerSearch),
    );
  }, [activeTab, search, myGroupData, joinedGroupData]);

  const groupProfile = (item: TGroup) => {
    router.navigate({
      pathname: "/usable/group-profile",
      params: {
        id: item.id,
        title: item.title,
        members: item.members.toString(),
        profile: item.profile,
        privacy: item.privacy,
        questions: item.questions,
        type:
          activeTab === "MyGroup"
            ? "MyGroup"
            : activeTab === "JoinedGroup"
              ? "JoinedGroup"
              : "Suggestion",
      },
    });
  };

  const renderCard = (item: TGroup) => (
    <Pressable style={styles.card} onPress={() => groupProfile(item)}>
      <Image source={{ uri: item.profile }} style={styles.profileImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.members} members</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Community"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* 🔹 Tabs Section */}
      <View style={styles.tabsContainer}>
        {/* Suggestion Tab */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Suggestion" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Suggestion")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Suggestion" && styles.activeTabText,
            ]}
          >
            Suggestion
          </Text>
        </TouchableOpacity>

        {/* Joined Group Tab */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "JoinedGroup" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("JoinedGroup")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "JoinedGroup" && styles.activeTabText,
            ]}
          >
            Joined Group
          </Text>
        </TouchableOpacity>

        {/* Your Group Tab */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "MyGroup" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("MyGroup")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "MyGroup" && styles.activeTabText,
            ]}
          >
            Your Group
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={22} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search group"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 🔹 Create Group Row (only visible in MyGroup tab) */}
      {activeTab === "MyGroup" && (
        <TouchableOpacity
          style={styles.createGroupRow}
          onPress={() => router.push("/pet-owner/(menu)/create-group")}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={Colors.primary}
          />
          <Text style={styles.createGroupText}>Create Group</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <CommunitySkeleton />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderCard(item)}
            ListEmptyComponent={
              <Text style={styles.placeholderText}>No groups found.</Text>
            }
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default Community;

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    marginLeft: 15,
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  activeTabText: {
    color: Colors.white,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 30,
    backgroundColor: Colors.buttonlogin,
    ...ShadowStyle,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  createGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 8,
  },
  createGroupText: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 1,
    paddingTop: 5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 5,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 50,
  },
});
