import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Text, ActivityIndicator } from "react-native";

interface AppLoaderProps {
  message?: string;
  visible: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#dc2626" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0d0d14",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  message: {
    marginTop: 20,
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
});
