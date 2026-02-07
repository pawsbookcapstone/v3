import { all, update } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import { AppointmentSkeleton } from "@/shared/components/AppointmentSkeletal";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
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

const cancellationReasons = [
  "Pet is sick",
  "Schedule conflict",
  "Found another provider",
  "Other",
];

const tabs = ["All", "Upcoming", "Completed", "Cancelled"];

const Appointment = () => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [appointments, setAppointments] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("All");

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   setIsLoading(true);
  //   // Simulate fetching new data
  //   setTimeout(() => {
  //     setAppointments(dummyAppointments); // Replace with real API call if needed
  //     setRefreshing(false);
  //     setIsLoading(false);
  //   }, 1500);
  // };

  // Example: simulate data loading
  // React.useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000); // simulate 2s loading
  //   return () => clearTimeout(timer);
  // }, []);

  //bagong code
  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true)
    try {
      const snapshot = await all("appointments");
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          type: d.type,
          petName: d.petName,
          date: d.selectedDate
            ? new Date(d.selectedDate.seconds * 1000).toDateString()
            : "",
          time: d.selectedTime || "",
          status: d.status,
          providerId: d.providerId,
          providerName: d.providerName,
          providerImage: d.providerImage,
          location: d.location || "To be confirmed",
        };
      });
      console.log({data});
      
      setAppointments(data);
    } catch (error) {
      console.error("Failed to refresh appointments:", error);
    } finally {
      setRefreshing(false);
      setIsLoading(false)
    }
  };

  useOnFocusHook(() => {
    onRefresh()
  }, []);

  const filteredAppointments = appointments.filter((a:any) => {
    const matchesSearch =
      a.petName.toLowerCase().includes(search.toLowerCase()) ||
      a.providerName.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "All" ? true : a.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const cancelAppointment = async (reason: string) => {
    if (!selectedAppointmentId) return;

    try {
      update("appointments", selectedAppointmentId).value({
        status: "Cancelled",
        cancellationReason: reason,
      });

      setAppointments((prev:any) =>
        prev.map((a:any) =>
          a.id === selectedAppointmentId ? { ...a, status: "Cancelled" } : a,
        ),
      );

      setSelectedAppointmentId(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  // const cancelAppointment = (reason: string) => {
  //   if (selectedAppointmentId) {
  //     setAppointments((prev) =>
  //       prev.map((a) =>
  //         a.id === selectedAppointmentId ? { ...a, status: "Cancelled" } : a,
  //       ),
  //     );
  //     setSelectedAppointmentId(null);
  //     setModalVisible(false);
  //     console.log("Cancelled for reason:", reason);
  //   }
  // };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/pet-owner/(menu)/appointment-details",
          params: {
            id: item.id,
            type: item.type,
            petName: item.petName,
            date: item.date,
            time: item.time,
            status: item.status,
            providerId: item.providerId,
            providerName: item.providerName,
            providerImage: item.providerImage,
            location: item.location,
          },
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.type}>{item.type} Appointment</Text>
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

        {/* Pet Info */}
        <Text style={styles.petName}>Pet: {item.petName}</Text>
        <Text style={styles.datetime}>
          {item.date} at {item.time}
        </Text>

        {/* Provider Info with Avatar */}
        <View
          style={[
            styles.providerInfo,
            { flexDirection: "row", alignItems: "center", marginBottom: 12 },
          ]}
        >
          <Image
            source={{
              uri: item.providerImage || "https://via.placeholder.com/50",
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
              <Ionicons
                name="business-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.providerName}>{item.providerName}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.location}>{item.location}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                borderRadius: 15,
                padding: 5,
                width: 90,
                alignItems: "center",
                backgroundColor: Colors.primary,
                gap: 10,
                marginTop: 5,
              }}
            >
              <FontAwesome name="paw" size={14} color={Colors.white} />
              <Text
                style={{ fontFamily: "Roboto", fontSize: 12, color: "white" }}
              >
                {item.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {item.status === "Upcoming" && (
            <Pressable
              style={[styles.cancelButton, ShadowStyle]}
              onPress={() => {
                setSelectedReason(null)
                setSelectedAppointmentId(item.id);
                setModalVisible(true);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.messageButton, ShadowStyle]}
            onPress={() =>
              router.push({
                pathname: "/pet-owner/(chat)/chat-field",
                params: {
                  otherUserId: item.providerId,
                  otherUserName: item.providerName,
                  otherUserImgPath: item.providerImage,
                },
              })
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={Colors.white}
            />
            <Text style={styles.messageText}>Message</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[screens.screen, { backgroundColor: "#F7F8FA" }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="My Appointments"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={24} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pet or provider"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
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

      {/* Appointment List */}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/pet-owner/(menu)/create-appointment")}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Cancel Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Cancel Appointment</Text>
            <Text style={styles.modalSubtitle}>
              Please select a reason for cancellation:
            </Text>

            {cancellationReasons.map((reason) => (
              <Pressable
                key={reason}
                style={[
                  styles.reasonButton,
                  selectedReason === reason && {
                    backgroundColor: Colors.primary,
                  },
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && {
                      color: "white",
                    },
                  ]}
                >
                  {reason}
                </Text>
              </Pressable>
            ))}

            {/* Next Button */}
            <Pressable
              style={[styles.nextButton, !selectedReason && { opacity: 0.5 }]}
              disabled={!selectedReason}
              onPress={() => {
                setModalVisible(false)
                setConfirmVisible(true);
              }}
            >
              <Text style={styles.nextText}>Next</Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              style={[styles.closeButton]}
              onPress={() => {
                setModalVisible(false);
                setSelectedReason(null);
              }}
            >
              <Text style={styles.closeText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Cancellation</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to cancel this appointment for "
              {selectedReason}"?
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignContent: "center",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                gap: 10,
              }}
            >
              <Pressable
                style={{
                  justifyContent: "center",
                  alignContent: "center",
                  height: 40,
                  width: "50%",
                  borderRadius: 25,
                  backgroundColor: "#FF4D4D",
                }}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelText}>No</Text>
              </Pressable>

              <Pressable
                style={{
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  height: 40,
                  width: "50%",
                  borderRadius: 25,
                  backgroundColor: Colors.primary,
                }}
                onPress={() => {
                  if (selectedAppointmentId && selectedReason) {
                    setAppointments((prev:any) =>
                      prev.map((a:any) =>
                        a.id === selectedAppointmentId
                          ? { ...a, status: "Cancelled" }
                          : a,
                      ),
                    );
                    cancelAppointment(selectedReason);
                    setSelectedAppointmentId(null);
                    setSelectedReason(null);
                    setConfirmVisible(false);
                    setModalVisible(false);
                  }
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "RobotoSemiBold",
                    fontSize: 15,
                  }}
                >
                  Yes, Cancel
                </Text>
              </Pressable>
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    ...ShadowStyle,
  },
  type: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
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
  petName: {
    fontSize: 15,
    color: Colors.gray,
    marginBottom: 4,
  },
  datetime: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
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
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.white,
    // borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    ...ShadowStyle,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    color: Colors.black,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 20,
    textAlign: "center",
  },
  reasonButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    // backgroundColor: Colors.primary,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  reasonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
