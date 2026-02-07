import { useAppContext } from "@/AppsProvider";
import { collectionName, update } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import { AppointmentSkeleton } from "@/shared/components/AppointmentSkeletal";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Appointment = {
  id: string;
  type: "Vet" | "Groomer";
  name: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";

  Avatar?: string;
  location: string;
  petName: string;
};

const dummyAppointments: Appointment[] = [
  {
    id: "1",
    type: "Vet",
    name: "Buddy Holmes",
    date: "2025-10-10",
    time: "10:00 AM",
    status: "Upcoming",
    petName: "Bogart",
    Avatar: "https://i.pravatar.cc/150?img=1",
    location: "123 Main St, City",
  },
  {
    id: "2",
    type: "Groomer",
    name: "Mittens Johnson",
    date: "2025-10-12",
    time: "2:00 PM",
    status: "Upcoming",
    petName: "DosDos",
    Avatar: "https://i.pravatar.cc/150?img=2",
    location: "456 Oak Ave, City",
  },
  {
    id: "3",
    type: "Vet",
    name: "Charlie Smith",
    date: "2025-10-05",
    time: "1:00 PM",
    status: "Completed",
    petName: "Maggie",
    Avatar: "https://i.pravatar.cc/150?img=3",
    location: "789 Pine Rd, City",
  },
];

const tabs = ["All", "Upcoming", "Completed", "Cancelled"];

const Appointment = () => {
  const {userId} = useAppContext()

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [appointments, setAppointments] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("All");

  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true);
    
    try{
      const _appointments = await collectionName("appointments")
        .whereEquals("providerId", userId)
        .getMapped()
      setAppointments(_appointments)
    } finally{
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  useOnFocusHook(() => {
    onRefresh()
  }, []);

  const filteredAppointments = appointments.filter((a:any) => {
    const matchesSearch =
      a.creator_name.toLowerCase().includes(search.toLowerCase()) ||
      a.petName.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "All" ? true : a.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleConfirmDecline = (reason?: string) => {
    if (selectedAppointmentId) {
      setAppointments((prev:any) =>
        prev.map((a:any) =>
          a.id === selectedAppointmentId ? { ...a, status: "Cancelled" } : a
        )
      );

      update("appointments", selectedAppointmentId).value({
        status: "Cancelled"
      })
      setSelectedAppointmentId(null);
      setModalVisible(false);
      console.log("Cancelled for reason:", reason || "No reason provided");
    }
  };

  const handleConfirm = (id:string) => {
    setAppointments((prev:any) =>
      prev.map((a:any) =>
        a.id === id ? { ...a, status: "Completed" } : a
      )
    );

    update("appointments", id).value({
      status: "Completed"
    })
  }

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/other-user/(menu)/appointment-details",
          params: {
            id: item.id,
            type: item.type,
            name: item.providerName,
            date: item.selectedDate.toDate().toDateString(),
            time: item.selectedTime,
            status: item.status,
            petName: item.petName,
            providerAvatar: item.providerImage,
            location: item.location,
            creator_id: item.creator_id,
            creator_name: item.creator_name,
            creator_img_path: item.creator_img_path,
          },
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              item.status === "Upcoming"
                ? { backgroundColor: "#E0F2FF" }
                : item.status === "Completed"
                ? { backgroundColor: "#E6FFED" }
                : { backgroundColor: "#FFE6E6" },
            ]}
          >
            <Text
              style={[
                styles.status,
                item.status === "Upcoming"
                  ? { color: Colors.primary }
                  : item.status === "Completed"
                  ? { color: "green" }
                  : { color: "red" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.providerInfo,
            { flexDirection: "row", alignItems: "center", marginBottom: 12 },
          ]}
        >
          <Image
            source={{
              uri: item.creator_img_path || "https://via.placeholder.com/50",
            }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <FontAwesome5
                name="user"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.providerName}>{item.creator_name}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <FontAwesome name="paw" size={16} color="#888" />
              <Text style={styles.location}>{item.petName}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.location}>
                {item.selectedDate.toDate().toDateString()} at {item.selectedTime}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {item.status === "Upcoming" && (
            <>
              <Pressable
                style={[styles.cancelButton, ShadowStyle]}
                onPress={() => {
                  setSelectedAppointmentId(item.id);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.cancelText}>Decline</Text>
              </Pressable>

              <Pressable
                style={[styles.messageButton, ShadowStyle]}
                onPress={() => handleConfirm(item.id)}
              >
                <Text style={styles.messageText}>Confirm</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="My Appointments"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      <View style={styles.searchContainer}>
        <Feather name="search" size={24} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pet or provider"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: Colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && { color: Colors.white },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <>
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
        </>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text style={{ color: Colors.gray, fontSize: 16 }}>
                No appointments found.
              </Text>
            </View>
          }
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color="#FF4D4D"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Decline Appointment?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to decline this appointment? This action
              cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeclineButton}
                onPress={() => handleConfirmDecline("No reason provided")}
              >
                <Text style={styles.modalDeclineText}>Yes, Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Appointment;

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
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
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    ...ShadowStyle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  providerInfo: {
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
  },
  providerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  location: {
    fontSize: 13,
    color: Colors.gray,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  messageText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 50,
    backgroundColor: "#FF4D4D",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "RobotoBold",
    color: Colors.black,
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "600",
  },
  modalDeclineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#FF4D4D",
    alignItems: "center",
  },
  modalDeclineText: {
    color: Colors.white,
    fontWeight: "700",
  },
});
