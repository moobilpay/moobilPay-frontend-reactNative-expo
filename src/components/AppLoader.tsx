import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";

interface AppLoaderProps {
  message?: string;
  visible: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <BlurView intensity={70} tint="dark" style={styles.container}>
      <View style={styles.card}>
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 160,
  },
  spinnerWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: "#f8fafc",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
