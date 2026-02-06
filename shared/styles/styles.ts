import { StyleSheet } from "react-native";
import { Colors } from "../colors/Colors";

export const screens = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
});

export const ShadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 }, // x:0, y:3
  shadowOpacity: 0.16, // 16%
  shadowRadius: 4.5, // blur = 9 → radius ≈ 4.5
  elevation: 4,
  // borderRadius: 25,

};

export const ButtonStyle = {
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 25,
    position: "absolute",
    bottom: 20,
    marginTop: 10,
  },
};

export const HeaderTitleStyle = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
    color: "black",
  },
});
