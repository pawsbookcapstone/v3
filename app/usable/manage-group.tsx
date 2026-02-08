import { add, all, get, remove, update } from "@/helpers/db";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { router, useLocalSearchParams } from "expo-router";
import { documentId, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Group {
  title: string;
  privacy: "Private" | "Public";
  // add other fields if needed
}
type Member = {
  id: string;
  userName: string;
  role: "Admin" | "Member";
  userImagePath?: string;
};

type JoinRequest = {
  id: string;
  userName: string;
  answers: [String];
  userImagePath?: string;
};

export default function CreatePageScreen() {
  const [pageName, setPageName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const { groupId, membersNumber } = useLocalSearchParams();
  const groupidStr = String(groupId);

  // Fetch group details using the groupId
  const fetchGroupDetails = async () => {
    const snapshot = await get("groups").where(
      where(documentId(), "==", groupidStr),
    );

    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Group),
    }));

    if (groups.length > 0) {
      const group = groups[0];
      setPageName(group.title);
      setIsPrivate(group.privacy === "Private");
    }
    console.log("Fetched group details:", pageName);
  };

  //fetch members List
  const fetchGroupMembers = async () => {
    const snapshot = await all("groups", groupidStr, "members");

    const members = snapshot.docs.map((doc) => {
      const data = doc.data() as Member;
      return {
        id: doc.id, // React key
        // memberId: data.memberId, // Firestore ID
        userName: data.userName,
        role: data.role,
        userImagePath: data.userImagePath,
      };
    });
    setMembers(members);
    console.log("Fetched group members:", members);
  };

  //fetch members List
  const fetchJoinRequests = async () => {
    const snapshot = await all("groups", groupidStr, "join-request");

    const requests = snapshot.docs.map((doc) => {
      const data = doc.data() as JoinRequest;
      return {
        id: doc.id, // React key
        answers: data.answers,
        userName: data.userName,
        userImagePath: data.userImagePath,
      };
    });
    setRequests(requests);
    console.log("Fetched group join requests:", requests);
  };
  useEffect(() => {
    fetchGroupMembers();
    fetchGroupDetails();
    fetchJoinRequests();
  }, []);

  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  //approve
  const handleApprove = (user: any) => {
    add("groups", groupidStr, "members").value({
      userId: user.id,
      userName: user.userName,
      userImagePath: user.userImagePath,
      role: "Member",
    });
    remove("groups", groupidStr, "join-request", user.id);
    update("groups", groupidStr).value({
      members: Number(membersNumber) + 1,
    });

    add("users", user.id, "joined-groups").value({
      groupId: groupidStr,
      groupName: pageName,
      joinedAt: serverTimestamp(),
    });

    fetchGroupMembers();
    setMembers((prev) => [...prev, { ...user, role: "Member" }]);
    setRequests((prev) => prev.filter((u) => u.id !== user.id));
  };

  //reject
  const handleReject = (userId: string) => {
    setRequests((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSaveChanges = async () => {
    try {
      await update("groups", groupidStr).value({
        title: pageName,
        privacy: isPrivate ? "Private" : "Public",
      });
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to save changes. Try again.");
      return;
    }
    router.back();
    alert("Group details saved!");
  };

  return (
    <View style={styles.container}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Manage Group"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* PAGE INFO */}
      <Text style={styles.label}>Page Name</Text>
      <TextInput
        placeholder={pageName || "Enter page name"}
        value={pageName}
        onChangeText={setPageName}
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Private Group</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      {/* MEMBERS */}
      <Text style={styles.sectionTitle}>Members</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.userRow}>
              <Image
                source={{ uri: item.userImagePath }}
                style={styles.avatar}
              />

              <View style={styles.userInfo}>
                <Text style={styles.cardTitle}>{item.userName}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members yet</Text>
        }
      />

      {/* APPROVAL UI */}
      {isPrivate && (
        <>
          <Text style={styles.sectionTitle}>Needs Approval</Text>

          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={styles.userRow}>
                  <Image
                    source={{ uri: item.userImagePath }}
                    style={styles.avatar}
                  />

                  <View style={styles.userInfo}>
                    <Text style={styles.cardTitle}>{item.userName}</Text>
                    <Text style={styles.cardSub}>Request to join</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.approveBtn]}
                    onPress={() => handleApprove(item)}
                  >
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No pending requests</Text>
            }
          />
        </>
      )}

      {/* SAVE / CREATE */}
      <TouchableOpacity style={styles.createBtn} onPress={handleSaveChanges}>
        <Text style={styles.createBtnText}>Save Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    padding: 12,
    backgroundColor: "#f3f4f6",
    marginVertical: 6,
    borderRadius: 8,
  },
  // requestCard: {
  //   backgroundColor: "#fff7ed",
  // },
  // cardTitle: {
  //   fontWeight: "600",
  //   fontSize: 15,
  // },
  // cardSub: {
  //   color: "#6b7280",
  //   marginTop: 2,
  // },
  // actionsRow: {
  //   flexDirection: "row",
  //   marginTop: 10,
  // },
  // button: {
  //   paddingVertical: 8,
  //   paddingHorizontal: 14,
  //   borderRadius: 6,
  //   marginRight: 10,
  // },
  // approveBtn: {
  //   backgroundColor: "#16a34a",
  // },
  // rejectBtn: {
  //   backgroundColor: "#dc2626",
  // },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  createBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
  },
  createBtnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginVertical: 12,
  },
  // avatar: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   marginRight: 12,
  //   backgroundColor: Colors.lightGray,
  // },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
  },

  userInfo: {
    marginLeft: 12,
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  cardSub: {
    fontSize: 13,
    color: "#6b7280", // gray-500
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  approveBtn: {
    backgroundColor: "#16a34a", // green-600
  },

  rejectBtn: {
    backgroundColor: "#fee2e2", // red-100
  },

  approveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  rejectText: {
    color: "#dc2626", // red-600
    fontWeight: "600",
    fontSize: 14,
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  roleBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe", // light blue
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284c7", // blue-600
  },
});
