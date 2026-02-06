import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AppointmentDetails = () => {
  const params = useLocalSearchParams();
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const handleConfirmDecline = () => {
    setShowDeclineModal(false);
    // You can handle your decline logic here, e.g. API call or state update
    console.log("Appointment declined!");
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Appointment Details"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      <View style={styles.appointmentCard}>
        {/* Provider Info */}
        <View style={styles.providerContainer}>
          {params.providerAvatar ? (
            <Image
              source={{
                uri: Array.isArray(params.providerAvatar)
                  ? params.providerAvatar[0]
                  : params.providerAvatar,
              }}
              style={styles.providerPhoto}
            />
          ) : (
            <View
              style={[
                styles.providerPhoto,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#eee",
                },
              ]}
            >
              <FontAwesome name="paw" size={40} color="#888" />
            </View>
          )}

          <View style={styles.providerInfo}>
            <Text style={styles.clinicName}>{params.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={Colors.gray} />
              <Text style={styles.location}>{params.location}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>When:</Text>
          <Text style={styles.value}>{params.date}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{params.time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Pet:</Text>
          <Text style={styles.value}>{params.petName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              params.status === "Upcoming"
                ? { backgroundColor: "#E0F2FF" }
                : params.status === "Completed"
                ? { backgroundColor: "#E6FFED" }
                : { backgroundColor: "#FFE6E6" },
            ]}
          >
            <Text
              style={[
                styles.status,
                params.status === "Upcoming"
                  ? { color: Colors.primary }
                  : params.status === "Completed"
                  ? { color: "green" }
                  : { color: "red" },
              ]}
            >
              {params.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowDeclineModal(true)}
        >
          <Text style={styles.cancelText}>Decline Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() =>
            router.push({
              pathname: "/pet-owner/(chat)/chat-field",
              params: {
                id: params.id,
                name: params.providerName,
                avatar: params.providerAvatar,
              },
            })
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={Colors.white}
          />
          <Text style={styles.confirmText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Decline Confirmation Modal */}
      <Modal
        visible={showDeclineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeclineModal(false)}
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
                onPress={() => setShowDeclineModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeclineButton}
                onPress={handleConfirmDecline}
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

export default AppointmentDetails;

const styles = StyleSheet.create({
  appointmentCard: {
    ...ShadowStyle,
    backgroundColor: Colors.white,
    borderRadius: 25,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
  },
  providerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },
  providerPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
  },
  providerInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 5,
  },
  clinicName: {
    fontFamily: "RobotoBold",
    fontSize: 18,
    color: Colors.black,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  location: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: Colors.gray,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    padding: 5,
    width: 90,
    backgroundColor: Colors.primary,
    borderRadius: 15,
  },
  typeText: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: "Roboto",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: {
    fontFamily: "RobotoBold",
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontFamily: "Roboto",
    fontSize: 16,
    color: "#555",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionsContainer: {
    marginTop: 25,
    alignItems: "center",
    gap: 5,
    flexDirection: "row",
    alignSelf: "center",
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,

    marginLeft: 10,
    backgroundColor: "red",
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  confirmButton: {
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  confirmText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },

  /* Modal Styles */
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
