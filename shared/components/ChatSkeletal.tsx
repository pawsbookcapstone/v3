import React from "react";
import { StyleSheet, View } from "react-native";

const SkeletalLoader = () => {
  return (
    <View>
      {/* Online users skeleton row */}
      <View style={styles.onlineRow}>
        {[...Array(7)].map((_, i) => (
          <View key={i} style={styles.onlineWrapper}>
            <View style={styles.onlineCircle} />
            <View style={styles.onlineText} />
          </View>
        ))}
      </View>

      {/* Messages skeleton list */}
      {[...Array(8)].map((_, i) => (
        <View key={i} style={styles.messageRow}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.lineShort} />
            <View style={styles.lineLong} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default SkeletalLoader;

const styles = StyleSheet.create({
  onlineRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 15,
  },
  onlineWrapper: {
    alignItems: "center",
    marginRight: 12,
  },
  onlineCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0E0E0",
  },
  onlineText: {
    width: 40,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    backgroundColor: "#E0E0E0",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0E0E0",
    marginRight: 12,
  },
  lineShort: {
    width: "40%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginBottom: 6,
  },
  lineLong: {
    width: "70%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
});
