import { Colors } from "@/shared/colors/Colors";
import { HeaderTitleStyle } from "@/shared/styles/styles";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HeaderWithActionsProps {
  title?: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: keyof typeof Feather.glyphMap;
  children?: React.ReactNode;
  centerTitle?: boolean; // 👈 controls true center alignment
}

const HeaderWithActions: React.FC<HeaderWithActionsProps> = ({
  title,
  onBack,
  onAction,
  actionIcon = "search",
  children,
  centerTitle = false,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* If centerTitle true → use absolute icons layout */}
      {centerTitle ? (
        <>
          {onBack && (
            <Pressable onPress={onBack} style={styles.absoluteLeft}>
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            </Pressable>
          )}

          {title && (
            <Text style={[HeaderTitleStyle.title, styles.centeredTitleText]}>
              {title}
            </Text>
          )}

          {onAction && (
            <Pressable onPress={onAction} style={styles.absoluteRight}>
              <Feather name={actionIcon} size={24} color="black" />
            </Pressable>
          )}
        </>
      ) : (
        // Default (non-centered) layout
        <View style={styles.headerRow}>
          <View style={styles.leftRow}>
            {onBack && (
              <Pressable onPress={onBack} style={{ marginRight: 5 }}>
                <MaterialIcons name="arrow-back-ios" size={20} color="black" />
              </Pressable>
            )}

            {children ? (
              <View style={{ flex: 1 }}>{children}</View>
            ) : (
              title && <Text style={HeaderTitleStyle.title}>{title}</Text>
            )}
          </View>

          {onAction ? (
            <Pressable onPress={onAction}>
              <Feather name={actionIcon} size={24} color="black" />
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      )}
    </View>
  );
};

export default HeaderWithActions;

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    backgroundColor: Colors.white,
    position: "relative",
    minHeight: 40,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  centeredTitleText: {
    textAlign: "center",
    fontWeight: "600",
  },
  absoluteLeft: {
    position: "absolute",
    left: 0,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  absoluteRight: {
    position: "absolute",
    right: 0,
    paddingHorizontal: 10,
    zIndex: 1,
  },
});
