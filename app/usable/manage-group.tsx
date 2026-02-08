import { all, get, update } from "@/helpers/db";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { router, useLocalSearchParams } from "expo-router";
import { documentId, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
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

export default function CreatePageScreen() {
  const [pageName, setPageName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const { groupId } = useLocalSearchParams();
  const groupidStr = String(groupId);

  useEffect(() => {
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

    fetchGroupDetails();
  }, []);

  // MEMBERS STATE
  const [members, setMembers] = useState([
    { id: "1", name: "Juan Dela Cruz", role: "Admin" },
    { id: "2", name: "Maria Santos", role: "Member" },
  ]);

  // USERS WAITING FOR APPROVAL
  const [requests, setRequests] = useState([
    { id: "3", name: "Ana Lopez" },
    { id: "4", name: "Carlos Mendoza" },
  ]);

  // APPROVE USER
  const handleApprove = (user: any) => {
    setMembers((prev) => [...prev, { ...user, role: "Member" }]);
    setRequests((prev) => prev.filter((u) => u.id !== user.id));
  };

  // REJECT USER
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.role}</Text>
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
              <View style={[styles.card, styles.requestCard]}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.approveBtn]}
                    onPress={() => handleApprove(item)}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
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
  requestCard: {
    backgroundColor: "#fff7ed",
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  cardSub: {
    color: "#6b7280",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 10,
  },
  approveBtn: {
    backgroundColor: "#16a34a",
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  createBtn: {
    backgroundColor: "#2563eb",
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
});
