import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

// HEADER
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";

// DB
import { all, collectionName } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";

const JoinedUsersScreen = () => {
  const { eventId, title, description, date, location } =
    useLocalSearchParams();

  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const fetchAttendees = async () => {
    try {
      // 1️⃣ get attendee IDs
      const membersSnap = await all("events", String(eventId), "attendees");

      const attendeeIds = membersSnap.docs.map((m) => m.data().userId || m.id);

      if (attendeeIds.length === 0) {
        setAttendees([]);
        return;
      }

      // 2️⃣ fetch users using whereIn
      const snap = await collectionName("users")
        .whereIn("id", attendeeIds)
        .get();

      // 3️⃣ map final data
      const data = snap.docs.map((user: any) => {
        const d = user.data();

        return {
          id: user.id,
          name: `${d.firstname ?? ""} ${d.lastname ?? ""}`.trim() || d.name,
          image: d.img_path || d.profileImage,
          role: d.role || "Member",
        };
      });

      setAttendees(data);
    } catch (error) {
      console.log("Error fetching attendees:", error);
    }
  };

  const fetchAttendeeCount = async () => {
    try {
      const snap = await all("events", String(eventId), "attendees");

      setAttendeeCount(snap.docs.length);
    } catch (error) {
      console.log("Error fetching attendee count:", error);
    }
  };

  // auto fetch on focus
  useOnFocusHook(() => {
    fetchAttendees();
    fetchAttendeeCount();
  }, []);

  // 🔥 RENDER USER
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="verified-user" size={14} color="gray" />
          <Text style={styles.role}>{item.role}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Joined Users"
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* EVENT INFO */}
      <View style={styles.eventCard}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.row}>
          <MaterialIcons name="description" size={16} color="gray" />
          <Text style={styles.text}>{description}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="event" size={16} color="gray" />
          <Text style={styles.text}>{date}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="location-on" size={16} color="gray" />
          <Text style={styles.text}>{location}</Text>
        </View>
      </View>

      {/* HEADER */}
      <View style={styles.sectionHeader}>
        <MaterialIcons name="groups" size={18} color="#6c5ce7" />

        <Text style={styles.sectionTitle}>People Who Joined the Event</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{attendeeCount}</Text>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No attendees yet
          </Text>
        }
      />
    </View>
  );
};

export default JoinedUsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  eventCard: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  text: {
    marginLeft: 5,
    color: "#444",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },

  sectionTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  role: {
    fontSize: 12,
    color: "gray",
    marginLeft: 5,
  },
  countBadge: {
    marginLeft: "auto",

    backgroundColor: "#6c5ce7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
