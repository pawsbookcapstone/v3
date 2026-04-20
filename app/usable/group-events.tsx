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
import { collectionName, remove, set } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";

const GroupEvents = () => {
  const { userId } = useAppContext();
  const { groupId, groupOwnerId, title } = useLocalSearchParams();
  const [attendeeCount, setAttendeeCount] = useState(0);

  // ✅ STATIC EVENTS
  const [events, setEvents] = useState<any[]>([]);

  useOnFocusHook(() => {
    const fetch = async () => {
      const _events = await collectionName("events")
        .whereEquals("createdByGroupId", groupId)
        .getMapped();
      const u = await Promise.all(
        _events.map(async (ev) => {
          const attendees = await collectionName(
            "events",
            ev.id,
            "attendees",
          ).getMapped((id, data) => data.userId);
          return { ...ev, attendees };
        }),
      );
      setEvents(u);
    };
    fetch();
  });

  // ✅ JOIN EVENT (LOCAL ONLY)
  const joinEvent = (eventId: string, join: boolean) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        if (join) {
          if (event.attendees.includes(userId)) return event;
          set("events", eventId, "attendees", userId).value({ userId });
          return {
            ...event,
            attendees: [...event.attendees, userId],
          };
        }
        if (!event.attendees.includes(userId)) return event;
        remove("events", eventId, "attendees", userId);
        return {
          ...event,
          attendees: event.attendees.filter((a: any) => a !== userId),
        };
      }),
    );
  };

  // ✅ SAVE EVENT (LOCAL ONLY)
  const saveEvent = (eventId: string) => {
    // setEvents((prev) =>
    //   prev.map((event) => {
    //     if (event.id === eventId) {
    //       if (event.savedBy.includes(userId)) return event;
    //       return {
    //         ...event,
    //         savedBy: [...event.savedBy, userId],
    //       };
    //     }
    //     return event;
    //   }),
    // );
  };
  const deleteEvent = (eventId: string) => {
    remove("events", eventId);
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const editEvent = (eventId: string) => {
    router.push({
      pathname: "/usable/edit-group-event",
      params: {
        groupEventId: eventId,
      },
    });
  };

  const renderItem = ({ item }: any) => {
    const isJoined = item.attendees.includes(userId);
    const isSaved = false;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="description" size={16} color="gray" />
          <Text style={{ marginLeft: 5 }}>{item.description}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="event" size={16} color="gray" />
          <Text style={{ marginLeft: 5 }}>{item.date}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="location-on" size={16} color="gray" />
          <Text style={{ marginLeft: 5 }}>{item.location}</Text>
        </View>

        {/* {isOwner && (
     
        )} */}

        <View style={styles.actions}>
          {/* <TouchableOpacity
              style={styles.btn}
              onPress={() => saveEvent(item.id)}
            >
              <Text>{isSaved ? "Saved" : "Save"}</Text>
            </TouchableOpacity> */}
          {!isOwner ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => joinEvent(item.id, !isJoined)}
            >
              <Text style={styles.btntext}>{isJoined ? "Joined" : "Join"}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.editBtn]}
                onPress={() => editEvent(item.id)}
              >
                <MaterialIcons name="edit" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.deleteBtn]}
                onPress={() => deleteEvent(item.id)}
              >
                <MaterialIcons name="delete" size={16} color="#fff" />
              </TouchableOpacity>

              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    {
                      backgroundColor: "#6c5ce7",
                      flexDirection: "row",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/usable/users-joined-events",
                      params: {
                        eventId: item.id,
                        title: item.title,
                        description: item.description,
                        location: item.location,
                        date: item.date,
                      },
                    })
                  }
                >
                  <MaterialIcons name="groups" size={16} color="#fff" />
                  {/* <Text style={{ color: "#fff", marginLeft: 5 }}>
                    View Joined Users
                  </Text> */}
                </TouchableOpacity>
              </View>
            </>
          )}
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,

    backgroundColor: "#22C55E", // default professional blue

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  btntext: {
    color: "white",
  },

  editBtn: {
    backgroundColor: "#38BDF8",
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
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
