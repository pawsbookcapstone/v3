import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AppointmentDetails = () => {
  const params = useLocalSearchParams();

  return (
    <View style={[screens.screen, { backgroundColor: "#F7F8FA" }]}>
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
            <Text style={styles.clinicName}>{params.providerName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={Colors.gray} />
              <Text style={styles.location}>{params.location}</Text>
            </View>
            <View style={styles.typeBadge}>
              <FontAwesome name="paw" size={14} color={Colors.white} />
              <Text style={styles.typeText}>{params.type}</Text>
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
        {params.status === "Upcoming" && (
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.messageButton}
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
          <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
          <Text style={styles.messageText}>Message</Text>
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  cancelButton: {
    width: "90%",
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FF4D4D",
    alignItems: "center",
  },
  cancelText: {
    color: "#FF4D4D",
    fontWeight: "700",
    fontSize: 16,
  },
  messageButton: {
    width: "90%",
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  messageText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
