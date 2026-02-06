import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { ShadowStyle } from "@/shared/styles/styles";
import { Octicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

export default function App() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>("Fetching address...");
  const [loading, setLoading] = useState(true);

  // Fetch current user location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Please allow location access.");
          setAddress("Permission denied");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        const { latitude, longitude } = loc.coords;
        setCoords({ latitude, longitude });

        await fetchAddress(latitude, longitude);
      } catch (error: any) {
        console.error(error);
        setAddress("Error fetching address");
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper to get readable address
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const formatted = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.country,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(formatted || "Address not found");
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      setAddress("Error fetching address");
    }
  };

  // Handle pin drag or map press
  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    await fetchAddress(latitude, longitude);
  };

  const handleSave = () => {
    if (!address) return Alert.alert("No location selected", "Please choose a valid spot on the map.");
    router.push({
      pathname: "/pet-owner/sell",
      params: { address },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10 }}>Fetching location...</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text>Unable to fetch location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={coords}
          draggable
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setCoords({ latitude, longitude });
            fetchAddress(latitude, longitude);
          }}
          title="Selected location"
        />
      </MapView>

      {/* HEADER overlay on top of the map */}
      <View style={styles.headerOverlay}>
        <HeaderLayout noBorderRadius bottomBorder height={90}>
          <HeaderWithActions
            title="Select Location"
            onBack={() => router.back()}
            centerTitle={false}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </HeaderLayout>
      </View>

      {/* Address Info (Bottom Center) */}
      <View style={styles.info}>
        <Octicons name="location" size={22} color={Colors.primary} />
        <Text style={styles.text} numberOfLines={2}>
          {address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  saveBtn: {
    position: "absolute",
    right: 15,
    top: 40,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveText: {
    color: "#fff",
    fontFamily: "Roboto",
    fontWeight: "600",
    fontSize: 14,
  },
  info: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
    borderRadius: 10,
    ...ShadowStyle,
  },
  text: {
    fontSize: 16,
    fontFamily: "Roboto",
    marginLeft: 6,
    textAlign: "center",
    flex: 1,
  },
});
