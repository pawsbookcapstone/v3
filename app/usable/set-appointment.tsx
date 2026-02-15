import { useAppContext } from "@/AppsProvider";
import { add, collectionName, serverTimestamp } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SetAppointment = () => {
  const { userId, userName, userImagePath } = useAppContext();

  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- New state
  const [bookings, setBookings] = useState<{ [key: string]: any }>({}); // <-- New state

  //new code ito
  const { providerId, providerName, providerType, providerImage } =
    useLocalSearchParams();
  const [petName, setPetName] = useState("");
  // const [date, setDate] = useState("");
  // // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  // const providerTypeParam = providerType as string | undefined;

  // if (!providerTypeParam) {
  //   alert(
  //     "Provider type not found. Please go back and select a provider again.",
  //   );
  //   return;
  // }

  useOnFocusHook(() => {
    collectionName("appointments")
      .whereEquals("providerId", providerId)
      .get()
      .then((res) => {
        const v = res.docs.reduce((p: any, c) => {
          const d = c.data();
          if (!p[d.selectedDate]) p[d.selectedDate] = [];

          p[d.selectedDate].push(d.selectedTime);
          return p;
        }, {});
        setBookings(v);
      });
  }, []);

  const createAppointment = async () => {
    console.log(providerId, providerImage, providerName);
    if (!petName || !contactNumber || !selectedDate || !selectedTime) {
      alert("Please complete all fields");
      return;
    }

    try {
      setLoading(true);

      const date = selectedDate.toISOString().split("T")[0];
      add("appointments").value({
        type: providerType,
        petName,
        selectedDate: date,
        selectedTime,
        status: "Upcoming",
        providerId,
        providerName,
        providerImage,
        location: "To be confirmed",
        createdAt: serverTimestamp(),
        creator_id: userId,
        creator_name: userName,
        creator_img_path: userImagePath,
        // ownerId: user.uid   // add later if needed
      });

      // router.replace("/pet-owner/(menu)/appointment");
      router.back();
      router.back();
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => 8 + i)
    .filter((hour) => hour !== 12)
    .map((hour) => {
      const suffix = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour > 12 ? hour - 12 : hour;
      return `${formattedHour}:00 ${suffix}`;
    });

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const dateKey = selectedDate.toISOString().split("T")[0];

    setBookedSlots(bookings[dateKey] || []);
  }, [selectedDate, bookings]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  // const handleConfirm = () => {
  //   if (!fullName || !contactNumber || !selectedDate || !selectedTime) {
  //     alert("Please fill all fields and select date/time");
  //     return;
  //   }

  //   setIsSubmitting(true); // Disable the button immediately

  //   // Optional: simulate a delay (e.g., 1 second) before navigating
  //   setTimeout(() => {
  //     router.push({
  //       pathname: "/usable/success-screen",
  //       params: {
  //         name: fullName,
  //         provider: name,
  //         date: selectedDate?.toISOString(),
  //         time: selectedTime,
  //       },
  //     });
  //   }, 2000);
  // };

  const isSlotUnavailable = (slot: string) => bookedSlots.includes(slot);

  return (
    <View style={[screens.screen, { backgroundColor: "#fff" }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          onBack={() => router.back()}
          centerTitle={true}
          title="Set Appointment"
        />
      </HeaderLayout>

      {/* Appointment For */}
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>Appointment For</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Pet's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your pet's name"
            onChangeText={setPetName}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your contact number"
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />
        </View>

        {/* Appointment Date & Time */}
        <Text style={styles.sectionLabel}>Appointment Date & Time</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Select Date</Text>
          <Pressable
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {selectedDate
                ? selectedDate.toDateString()
                : "Tap to choose appointment date"}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {selectedDate && (
            <>
              <Text style={styles.label}>Available Time Slots</Text>
              <FlatList
                data={timeSlots}
                keyExtractor={(item) => item}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ marginTop: 8 }}
                renderItem={({ item }) => {
                  const unavailable = isSlotUnavailable(item);
                  const selected = selectedTime === item;

                  return (
                    <Pressable
                      disabled={unavailable}
                      style={[
                        styles.timeSlot,
                        selected && styles.timeSlotSelected,
                        unavailable && styles.timeSlotUnavailable,
                      ]}
                      onPress={() => setSelectedTime(item)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selected && styles.timeTextSelected,
                          unavailable && styles.timeTextUnavailable,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </>
          )}

          <Pressable
            style={[
              styles.confirmButton,
              isSubmitting && { backgroundColor: "#999" },
            ]}
            onPress={createAppointment}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmText}>Confirm Appointment</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default SetAppointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
  },
  //   header: {
  //     alignItems: "center",
  //     marginBottom: 16,
  //     paddingVertical: 10,
  //     borderBottomWidth: 1,
  //     borderBottomColor: "#ddd",
  //   },
  backButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 8,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "relative",
  },

  providerName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  providerType: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: "Roboto",
    color: Colors.black,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    fontSize: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  datePickerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    padding: 15,
    fontSize: 15,
    marginTop: 10,
  },
  datePickerText: {
    fontSize: 15,
    color: Colors.darkGray,
  },
  timeSlot: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary || "#007AFF",
  },
  timeSlotUnavailable: {
    backgroundColor: "#ddd",
    opacity: 0.6,
  },
  timeText: {
    fontSize: 14,
    color: Colors.black,
  },
  timeTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  timeTextUnavailable: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  confirmButton: {
    backgroundColor: Colors.primary || "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 30,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
