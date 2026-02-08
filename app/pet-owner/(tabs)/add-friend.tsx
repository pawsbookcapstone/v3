import { useAppContext } from "@/AppsProvider";
import { all, collectionName, remove, saveBatch, set } from "@/helpers/db";
import { useNotifHook } from "@/helpers/notifHook";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import { FriendRequestSkeleton } from "@/shared/components/FriendRequestSkeleton";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { WriteBatch } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const addFriend = () => {
  const { userId } = useAppContext();

  const [status, setStatus] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const [friendRequests, setFriendRequests] = useState<any>([]);

  const addNotif = useNotifHook();

  useOnFocusHook(() => {
    collectionName("notifications")
      .whereEquals("receiver_id", userId)
      .whereEquals("seen", false)
      .whereEquals("href", "/pet-owner/add-friend")
      .get()
      .then((s) => {
        let v: ((batch: WriteBatch) => void)[] = [];
        s.docs.forEach(dc => {
          v.push((batch) => batch.update(dc.ref, {
            seen: true
          }))
        });
        saveBatch(v)
      })

    onRefresh();
  }, [userId]);

  // 🔄 Handle Pull-to-Refresh
  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   try {
  //     const snap = await all("friends");

  //     let _friendRequestsData: any[] = [];
  //     let _friends: any[] = [];
  //     let _usersFriends: Record<string, number> = {};

  //     for (const t of snap.docs) {
  //       const d = t.data();
  //       const [u1, u2] = d.users;

  //       // Safely get other user's info
  //       const otherUser = d.details?.[u1] ?? {
  //         name: d.userName,
  //         img_path: d.userImagePath,
  //       };

  //       // Only show requests where the current user is the receiver
  //       if (!d.confirmed && u2 === userId) {
  //         const requestTime = d.date_requested?.toDate
  //           ? computeTimePassed(d.date_requested.toDate())
  //           : "Just now";

  //         _friendRequestsData.push({
  //           id: t.id,
  //           other_user_id: u1,
  //           other_user: {
  //             name: otherUser.name,
  //             img_path: otherUser.img_path ?? "",
  //           },
  //           time: requestTime,
  //           mutual_friends: 0,
  //         });
  //         continue;
  //       }

  //       if (!d.confirmed) continue;

  //       // Track confirmed friends
  //       if (u1 === userId || u2 === userId) {
  //         _usersFriends[u1 === userId ? u2 : u1] = 1;
  //       } else {
  //         _friends.push(d.users);
  //       }
  //     }

  //     // Calculate mutual friends
  //     for (const fr of _friendRequestsData) {
  //       for (const usersPair of _friends) {
  //         if (!Array.isArray(usersPair)) continue;
  //         const [u1, u2] = usersPair;
  //         if (
  //           (u1 === fr.other_user_id && _usersFriends[u2]) ||
  //           (u2 === fr.other_user_id && _usersFriends[u1])
  //         ) {
  //           fr.mutual_friends++;
  //         }
  //       }
  //     }

  //     setFriendRequests(_friendRequestsData);
  //   } catch (e) {
  //     Alert.alert("Error", e + "");
  //     console.log("Error", e);
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };
  const onRefresh = async () => {
  setRefreshing(true);

  try {
    const snap = await all("friends");

    const _friendRequests: any[] = [];
    const myFriends = new Set<string>();
    const connections = new Map<string, Set<string>>();

    for (const doc of snap.docs) {
      const d = doc.data();
      const [u1, u2] = d.users;

      // Track confirmed friendships as graph
      if (d.confirmed) {
        if (!connections.has(u1)) connections.set(u1, new Set());
        if (!connections.has(u2)) connections.set(u2, new Set());

        connections.get(u1)!.add(u2);
        connections.get(u2)!.add(u1);

        if (u1 === userId) myFriends.add(u2);
        if (u2 === userId) myFriends.add(u1);

        continue;
      }

      // Incoming friend requests
      if (!d.confirmed && u2 === userId) {
        const otherUser = d.details?.[u1] ?? {
          name: d.userName,
          img_path: d.userImagePath,
        };

        _friendRequests.push({
          id: doc.id,
          other_user_id: u1,
          other_user: {
            name: otherUser.name,
            img_path: otherUser.img_path ?? "",
          },
          time: d.date_requested?.toDate
            ? computeTimePassed(d.date_requested.toDate())
            : "Just now",
          mutual_friends: 0,
        });
      }
    }

    // Calculate mutual friends efficiently
    for (const req of _friendRequests) {
      const requesterFriends = connections.get(req.other_user_id);
      if (!requesterFriends) continue;

      for (const mf of myFriends) {
        if (requesterFriends.has(mf)) {
          req.mutual_friends++;
        }
      }
    }

    setFriendRequests(_friendRequests);
  } catch (e) {
    console.error(e);
    Alert.alert("Error", String(e));
  } finally {
    setRefreshing(false);
  }
};


  const handleConfirm = (id: string) => {
    // setStatus((prev) => ({ ...prev, [id]: "confirmed" }));
    set("friends", id).value({
      confirmed: true,
    });
    setFriendRequests((prev: any) => prev.filter((f: any) => f.id !== id));
  };

  const handleDelete = (_friendRequestsData: any) => {
    // setStatus((prev) => ({ ...prev, [id]: "deleted" }));
    remove("friends", _friendRequestsData.id);
    addNotif({
      receiver_id: _friendRequestsData.other_user_id,
      href: "/pet-owner/add-friend",
      type: "Decline Friend Request",
      params: {},
    });
    setFriendRequests((prev: any) =>
      prev.filter((f: any) => f.id !== _friendRequestsData.id),
    );
  };

  const renderRequest = ({ item }: any) => (
    <View style={styles.requestCard}>
      <Image
        source={{ uri: item.other_user.img_path }}
        style={styles.profilePic}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.other_user.name}</Text>
        <Text style={styles.time}>{item.time}</Text>

        {item.mutual_friends > 0 && (
          <View style={styles.mutualRow}>
            {/* <View style={styles.mutualPics}>
              {item.mutualFriendImages.slice(0, 3).map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={[
                    styles.mutualPic,
                    { marginLeft: idx === 0 ? 0 : -10 },
                  ]}
                />
              ))}
            </View> */}
            <Text style={styles.mutualText}>
              {item.mutual_friends} mutual friend
              {item.mutual_friends > 1 ? "s" : ""}
            </Text>
          </View>
        )}

        <View style={styles.actionsColumn}>
          <Pressable
            style={[styles.button, styles.confirm]}
            onPress={() => handleConfirm(item.id)}
          >
            <Text style={styles.btnText}>Confirm</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.delete]}
            onPress={() => handleDelete(item)}
          >
            <Text style={[styles.btnText, { color: "#000" }]}>Delete</Text>
          </Pressable>
          {/* {status[item.id] === "confirmed" ? (
            <Text style={styles.confirmedText}>You are now friends</Text>
          ) : status[item.id] === "deleted" ? (
            <Text style={styles.deletedText}>Request deleted</Text>
          ) : (
            <>
              <Pressable
                style={[styles.button, styles.confirm]}
                onPress={() => handleConfirm(item.id)}
              >
                <Text style={styles.btnText}>Confirm</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.delete]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={[styles.btnText, { color: "#000" }]}>Delete</Text>
              </Pressable>
            </>
          )} */}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[screens.screen, { flex: 1 }]}>
      <HeaderLayout noBorderRadius height={90}>
        <Image
          source={require("../../../assets/images/logo/headerlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={() => router.push("/pet-owner/search")}>
          <Feather name="search" size={24} color="black" alignSelf="flex-end" />
        </Pressable>
      </HeaderLayout>

      <View
        style={{
          flexDirection: "row",
          marginLeft: 15,
          gap: 10,
          marginTop: 15,
          marginBottom: 10,
        }}
      >
        <Pressable
          style={styles.suggestions}
          onPress={() => router.push("/pet-owner/suggestions")}
        >
          <Text style={styles.text}>Suggestions</Text>
        </Pressable>
        <Pressable
          style={styles.yourfriend}
          onPress={() => router.push("/pet-owner/my-friends")}
        >
          <Text style={styles.text}>Your Friends</Text>
        </Pressable>
      </View>

      <Text
        style={{
          fontFamily: "RobotoSemiBold",
          fontSize: 16,
          color: "#000",
          alignSelf: "flex-start",
          marginLeft: 15,
          marginBottom: 5,
          marginTop: 10,
        }}
      >
        Friend Requests
      </Text>

      {/*  Make FlatList flex to fill remaining space */}
      {refreshing ? (
        // 🦴 Show skeletons while refreshing/loading
        <View style={{ padding: 15 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FriendRequestSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 15,
            backgroundColor: "#fff",
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

export default addFriend;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    top: 20,
    marginLeft: 10,
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: "flex-start",
    top: 30,
  },
  suggestions: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  yourfriend: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: "#d9d9d9",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000",
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  time: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#555",
  },
  mutualRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  mutualPics: {
    flexDirection: "row",
    marginRight: 5,
  },
  mutualPic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  mutualText: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: Colors.primary,
  },
  actionsColumn: {
    marginTop: 13,
    gap: 6,
    flexDirection: "row",
    width: "100%",
    // flexWrap: "wrap",
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 50,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  confirm: {
    backgroundColor: Colors.primary,
  },
  delete: {
    backgroundColor: Colors.buttonlogin,
  },
  btnText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "#fff",
  },
  confirmedText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginTop: 8,
  },
  deletedText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
    color: "red",
    marginTop: 8,
  },
});
