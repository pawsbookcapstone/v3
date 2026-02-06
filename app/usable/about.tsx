import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const about = () => {
  const features = [
    {
      id: "1",
      icon: (
        <MaterialIcons
          name="health-and-safety"
          size={24}
          color={Colors.primary}
        />
      ),
      title: "Health Records",
      description: "Track pet health records and vaccinations easily.",
    },
    {
      id: "2",
      icon: (
        <FontAwesome5 name="calendar-check" size={24} color={Colors.primary} />
      ),
      title: "Appointments",
      description: "Schedule appointments with veterinarians and groomers.",
    },
    {
      id: "3",
      icon: <Ionicons name="people-circle" size={24} color={Colors.primary} />,
      title: "Community",
      description: "Connect with other pet owners in your community.",
    },
  ];

  return (
    <View style={screens.screen}>
      {/* Header */}
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title="About PawsBook"
          onBack={() => router.back()}
          centerTitle={true}
        />
      </HeaderLayout>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/logo/PawsBook.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Section */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome to PawsBook!</Text>
          <Text style={styles.paragraph}>
            PawsBook is a comprehensive platform designed for pet owners and pet
            lovers to manage, connect, and care for their furry friends. Whether
            you have cats, dogs, or any other pets, PawsBook helps you track
            their health, appointments, and daily activities seamlessly.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.card}>
          <Text style={styles.heading}>Our Mission</Text>
          <Text style={styles.paragraph}>
            Our mission is to simplify pet care while connecting pet owners
            through a supportive community. We provide tools, tips, and
            reminders that ensure your pets live a happy, healthy life.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.card}>
          <Text style={styles.heading}>Features</Text>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.featureIcon}>{feature.icon}</View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Community Section */}
        <View style={[styles.card, { marginBottom: 50 }]}>
          <Text style={styles.heading}>Join Our Community</Text>
          <Text style={styles.paragraph}>
            Become part of a growing network of pet enthusiasts! Share your pet
            stories, ask for advice, and learn from others who are just as
            passionate about pets as you are.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default about;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  logoWrapper: {
    alignItems: "center",
    // marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  heading: {
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
    color: Colors.primary,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
    color: "#000",
  },
  featureDesc: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#555",
  },
});
