import { useAppContext } from "@/AppsProvider";
import { find, set } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

const PrivacySettings = () => {
  const { userId } = useAppContext();

  const [isOnline, setIsOnline] = useState(true);

  useOnFocusHook(() => {
    const fetch = async () => {
      const snap = await find("users", userId);
      setIsOnline(snap.data()?.online_status ?? true);
    };
    fetch();
  }, []);

  const toggleStatus = () => {
    const v = !isOnline;
    setIsOnline(v);
    set("users", userId).value({ online_status: v });
  };

  return (
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="Privacy Settings"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      <View style={styles.container}>
        <View style={styles.settingCard}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Show Online Status</Text>
            <Text style={styles.subtitle}>
              When turned off, others won’t see if you’re active.
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            thumbColor={isOnline ? Colors.primary : "#f4f3f4"}
            trackColor={{ false: "#767577", true: Colors.primary + "88" }}
          />
        </View>

        <Pressable
          style={styles.optionRow}
          onPress={() => router.push("/(account-settings)/block-list")}
        >
          <Feather name="lock" size={20} color={Colors.black} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.optionTitle}>Blocked Users</Text>
            <Text style={styles.optionSub}>
              Manage users you’ve blocked from viewing your profile.
            </Text>
          </View>
        </Pressable>

        {/* <Pressable style={styles.optionRow}>
          <Feather name="user-x" size={20} color={Colors.black} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.optionTitle}>Profile Visibility</Text>
            <Text style={styles.optionSub}>
              Control who can view your profile details.
            </Text>
          </View>
        </Pressable> */}
      </View>
    </View>
  );
};

export default PrivacySettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  optionSub: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
});
