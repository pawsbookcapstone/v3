import { useAppContext } from "@/AppsProvider";
import { Colors } from "@/shared/colors/Colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ✅ HEADER
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";

const GroupEvents = () => {
  const { userId } = useAppContext();
  const { groupId, groupOwnerId, title } = useLocalSearchParams();

  // ✅ STATIC EVENTS
  const [events, setEvents] = useState<any[]>([
    {
      id: "1",
      groupId: groupId,
      title: "Pet Vaccination Day",
      date: "2026-05-10",
      location: "Manila Vet Clinic",
      attendees: [],
      savedBy: [],
    },
    {
      id: "2",
      groupId: groupId,
      title: "Dog Training Workshop",
      date: "2026-05-15",
      location: "Quezon City Park",
      attendees: [],
      savedBy: [],
    },
  ]);

  // ✅ JOIN EVENT (LOCAL ONLY)
  const joinEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          if (event.attendees.includes(userId)) return event;

          return {
            ...event,
            attendees: [...event.attendees, userId],
          };
        }
        return event;
      }),
    );
  };

  // ✅ SAVE EVENT (LOCAL ONLY)
  const saveEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          if (event.savedBy.includes(userId)) return event;

          return {
            ...event,
            savedBy: [...event.savedBy, userId],
          };
        }
        return event;
      }),
    );
  };

  const renderItem = ({ item }: any) => {
    const isJoined = item.attendees.includes(userId);
    const isSaved = item.savedBy.includes(userId);

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.date}</Text>
        <Text>{item.location}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => joinEvent(item.id)}
          >
            <Text>{isJoined ? "Joined" : "Join"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => saveEvent(item.id)}
          >
            <Text>{isSaved ? "Saved" : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isOwner = String(groupOwnerId) === String(userId);

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      {/* ✅ HEADER */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title={"Group Events"}
          onBack={() => router.back()}
          centerTitle
        />
      </HeaderLayout>

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {/* ✅ CREATE EVENT (OWNER ONLY) */}
        {isOwner && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() =>
              router.push({
                pathname: "/usable/create-group-event" as any,
                params: { groupId },
              })
            }
          >
            <Text style={{ color: "#fff" }}>+ Create Event</Text>
          </TouchableOpacity>
        )}

        {/* EVENTS LIST */}
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No events yet.
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default GroupEvents;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  btn: {
    backgroundColor: Colors.buttonlogin,
    padding: 8,
    borderRadius: 6,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     margin: 10,
//     borderRadius: 10,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   actions: {
//     flexDirection: "row",
//     marginTop: 10,
//     gap: 10,
//   },
//   btn: {
//     backgroundColor: Colors.buttonlogin,
//     padding: 8,
//     borderRadius: 6,
//   },
//   createBtn: {
//     backgroundColor: Colors.primary,
//     padding: 12,
//     margin: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });
