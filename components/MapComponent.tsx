import { Colors } from "@/shared/colors/Colors";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
// import MapView, { Marker } from "react-native-maps";

interface MapProps {
  address: string;
}

const MapComponent: React.FC<MapProps> = ({ address }) => {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const geocode = await Location.geocodeAsync(address);
        if (geocode.length > 0) {
          setCoords({
            latitude: geocode[0].latitude,
            longitude: geocode[0].longitude,
          });
        }
      } catch (error) {
        console.log("Error geocoding address:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading Map...</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text>Unable to fetch coordinates</Text>
      </View>
    );
  }

  return (
    <></>
    // <MapView
    //   style={styles.map}
    //   initialRegion={{
    //     latitude: coords.latitude,
    //     longitude: coords.longitude,
    //     latitudeDelta: 0.02,
    //     longitudeDelta: 0.02,
    //   }}
    //   showsUserLocation={false}
    // >
    //   <Marker coordinate={coords} title="Meetup Location" />
    // </MapView>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
