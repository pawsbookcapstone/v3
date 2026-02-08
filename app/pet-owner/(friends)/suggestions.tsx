import { useAppContext } from "@/AppsProvider";
import { get, serverTimestamp, set, where } from "@/helpers/db";
import { generateChatId } from "@/helpers/helper";
import { useNotifHook } from "@/helpers/notifHook";
import { useLoadingHook } from "@/hooks/loadingHook";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Suggestions = () => {
  const {userId, userName, userImagePath} = useAppContext()

  const [people, setPeople] = useState<any>([]);

  // const [sentRequests, setSentRequests] = useState<string[]>([]);
  const addNotif = useNotifHook()
  const renderLoadingButton = useLoadingHook(true)

  useOnFocusHook(() => {
    const chunk = (arr: string[], size = 10) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const fetch = async () => {
      // 1️⃣ Get my friends
      const snap = await get("friends").where(
        where("users", "array-contains", userId),
        // where("confirmed", "==", true)
      );

      const friendIds = new Set<string>();
      const friendRequestedIds = new Set<string>();

      snap.docs.forEach((d) => {
        const [u1, u2] = d.data().users;
        if (d.data().confirmed)
          friendIds.add(u1 === userId ? u2 : u1);
        else
          friendRequestedIds.add(u1 === userId ? u2 : u1);
      });

      if (friendIds.size === 0) return;

      // 2️⃣ Query friends-of-friends safely (max 10)
      const mutuals = new Map<string, any>();

      const friendIdChunks = chunk([...friendIds]);

      for (const ids of friendIdChunks) {
        const fofSnap = await get("friends").where(
          where("users", "array-contains-any", ids),
          where("confirmed", "==", true)
        );

        fofSnap.docs.forEach((d) => {
          const data = d.data();
          const [u1, u2] = data.users;

          const candidate =
            friendIds.has(u1) ? u2 :
            friendIds.has(u2) ? u1 :
            null;

          if (!candidate) return;
          if (candidate === userId) return; 
          if (friendIds.has(candidate)) return; 
          if (friendRequestedIds.has(candidate)) return;

          const curr = mutuals.get(candidate) ?? {
            id: candidate,
            name: data.details[candidate].name,
            img_path: data.details[candidate].img_path,
            mutuals: 0,
            mutual_img_paths: []
          };

          curr.mutuals += 1;
          if (curr.mutuals < 3)
            curr.mutual_img_paths.push(data.details[candidate == u1 ? u2 : u1].img_path)
          mutuals.set(candidate, curr);
        });
        
      }
      setPeople([...mutuals.values()].sort(
        (a, b) => b.mutuals - a.mutuals
      ))
    };

    fetch();
  }, []);


  const handleAddFriend = async (item: any) => {
    // setSentRequests((prev) => [...prev, id]);
    const generatedId = generateChatId(userId, item.id)
    set("friends", generatedId).value({
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
    })
    handleRemove(item.id)
      
    addNotif({
      receiver_id: item.id,
      href: "/pet-owner/add-friend",
      type: "Sent Friend Request",
      params: {
        id: generatedId,
      }
    });
  };

  const handleRemove = (id: string) => {
    setPeople((prev:any) => prev.filter((p:any) => p.id !== id));
    // setSentRequests((prev) => prev.filter((reqId) => reqId !== id));
  };

  const renderPerson = ({ item }: { item: (typeof people)[0] }) => {
    // const isSent = sentRequests.includes(item.id);

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => {
          router.push({
            pathname: "/usable/user-profile",
            params: { userToViewId: item.id },
          });
        }}>
          <Image source={{ uri: item.img_path }} style={styles.profilePic} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>

          {item.mutuals > 0 && (
            <View style={styles.mutualRow}>
              <View style={styles.mutualPics}>
                {item.mutual_img_paths.map((uri:any, idx:number) => (
                  <Image
                    key={idx}
                    source={{ uri:uri }}
                    style={[
                      styles.mutualPic,
                      { marginLeft: idx === 0 ? 0 : -10 },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.mutual}>
                {item.mutuals} mutual friend
                {item.mutuals > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {/* {isSent ? (
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: "#ccc",
                    borderWidth: 1,
                    borderColor: "#bbb",
                  },
                ]}
              >
                <Text style={[styles.btnText, { color: "#555" }]}>
                  Cancel Request
                </Text>
              </View>
            ) : ( */}
            {renderLoadingButton({
              style: [styles.button, { backgroundColor: Colors.primary }],
              children: <Text style={[styles.btnText, { color: "#fff" }]}>
                  Add Friend
                </Text>,
              loadingText: 'Loading',
              onPress: () => handleAddFriend(item)
            })}
              {/* <Pressable
                style={[styles.button, { backgroundColor: Colors.primary }]}
                onPress={() => handleAddFriend(item)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  Add Friend
                </Text>
              </Pressable> */}
            {/* )} */}

            <Pressable
              style={[styles.button, { backgroundColor: "#E4E6EB" }]}
              onPress={() => handleRemove(item.id)}
            >
              <Text style={[styles.btnText, { color: "#000" }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[screens.screen]}>
      <HeaderLayout noBorderRadius>
        <HeaderWithActions
          title="Suggestions"
          onBack={() => router.back()}
          onAction={() => router.push("/pet-owner/search")}
          actionIcon="search"
          centerTitle={true}
        />
      </HeaderLayout>

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
        Pet owner you may know
      </Text>

      <FlatList
        data={people}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        contentContainerStyle={{ padding: 15, backgroundColor: "#fff" }}
      />
    </View>
  );
};

export default Suggestions;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "flex-start",
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: "#000",
  },
  mutualRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  mutualPics: {
    flexDirection: "row",
    marginRight: 6,
  },
  mutualPic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  mutual: {
    fontSize: 13,
    fontFamily: "Roboto",
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: {
    fontSize: 14,
    fontFamily: "RobotoSemiBold",
  },
});
