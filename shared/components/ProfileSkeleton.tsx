import { Colors } from "@/shared/colors/Colors";
import { ShadowStyle } from "@/shared/styles/styles";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const Skeleton = ({ width, height, radius = 8, style }: any) => (
  <View
    style={[
      {
        width,
        height,
        borderRadius: radius,
        backgroundColor: "#E3E3E3",
        overflow: "hidden",
      },
      style,
    ]}
  >
    <View style={styles.skeletonShimmer} />
  </View>
);

const ProfileSkeleton = () => {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* --- Cover Photo --- */}
      <Skeleton width={"100%"} height={200} radius={0} />

      {/* --- Profile Info --- */}
      <View style={styles.profileWrapper}>
        <Skeleton
          width={130}
          height={130}
          radius={70}
          style={{ borderWidth: 5, borderColor: Colors.white }}
        />
        <View style={{ marginLeft: 20, gap: 10 }}>
          <Skeleton width={150} height={20} />
          <Skeleton width={100} height={15} />
        </View>
      </View>

      {/* --- Buttons --- */}
      <View style={styles.buttonsWrapper}>
        <Skeleton width={"35%"} height={40} />
        <Skeleton width={"35%"} height={40} />
        <Skeleton width={"35%"} height={40} />
      </View>

      {/* --- Friends Section --- */}
      <View style={styles.sectionContainer}>
        <Skeleton width={100} height={20} style={{ marginBottom: 10 }} />
        <View style={styles.friendGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.friendCard}>
              <Skeleton width={"100%"} height={115} radius={10} />
              <Skeleton
                width={"80%"}
                height={15}
                style={{ marginTop: 10, marginLeft: 10 }}
              />
            </View>
          ))}
        </View>
        <Skeleton
          width={"95%"}
          height={40}
          radius={10}
          style={{ alignSelf: "center", marginTop: 10 }}
        />
      </View>

      {/* --- Add Post Section --- */}
      <View style={styles.sectionContainer}>
        <Skeleton width={120} height={20} style={{ marginBottom: 15 }} />
        <View style={styles.addPostRow}>
          <Skeleton width={50} height={50} radius={30} />
          <Skeleton width={"70%"} height={40} radius={10} />
          <Skeleton width={25} height={25} radius={5} />
        </View>
      </View>

      {/* --- Posts --- */}
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Skeleton width={40} height={40} radius={20} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Skeleton width={100} height={15} />
              <Skeleton width={60} height={10} style={{ marginTop: 5 }} />
            </View>
            <Skeleton width={20} height={20} radius={10} />
          </View>

          <Skeleton width={"90%"} height={15} style={{ marginTop: 15 }} />
          <Skeleton
            width={"100%"}
            height={180}
            radius={8}
            style={{ marginTop: 10 }}
          />

          <View style={styles.footerRow}>
            <Skeleton width={60} height={20} radius={10} />
            <Skeleton width={60} height={20} radius={10} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default ProfileSkeleton;

const styles = StyleSheet.create({
  skeletonShimmer: {
    flex: 1,
  },
  profileWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: -60,
  },
  buttonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 20,
    paddingHorizontal: 20,
    marginHorizontal: 30,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  friendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  friendCard: {
    width: "30%",
    borderRadius: 10,
    backgroundColor: "#fff",
    ...ShadowStyle,
    height: 170,
    alignItems: "center",
  },
  addPostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 10,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    ...ShadowStyle,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
});
