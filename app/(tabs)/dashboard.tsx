import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import snowData from "../../assets/fonts/Snow.json";
import { useFonts } from "expo-font";
import { Image } from "react-native";
import { useRef } from "react";

export default function HomeScreen() {
  const snowRef = useRef<LottieRefCurrentProps>(null);

  const router = useRouter();
  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"), // Replace with your font file
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (snowRef.current) {
        snowRef.current.setSpeed(0.25); // Change speed (1 is normal, lower is slower)
      }
    }, 50); // Delay to ensure the animation is loaded

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={{
          width: 350,
          height: 350,
          position: "absolute",
          top: 0,
          opacity: 0.5,
        }}
        source={require("../../assets/fonts/fog.png")}
      />
      <Lottie
        animationData={snowData}
        style={{
          zIndex: -2,
          position: "absolute",
          top: 0,
          width: 1000,
          height: 1000,
        }}
        lottieRef={snowRef}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          welcome back {"[user]"}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.coinsContainer}>
        <ThemedText type="title" style={styles.coins}>
          snocoins:
        </ThemedText>
        &nbsp;
        <ThemedText type="title" style={styles.coinsYellow}>
          {"coins₵"}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.mainContainer}></ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#08142C",
    paddingHorizontal: 16,
  },
  titleContainer: {
    backgroundColor: "transparent",
    marginBottom: 0,
    top: 20,
    left: -35,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "norwester",
  },
  coinsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    textAlign: "left",
    marginBottom: 20,
    top: 20,
    left: 3,
  },
  coins: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "norwester",
  },
  coinsYellow: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ffdc5c",
    textAlign: "left",
    fontFamily: "norwester",
  },
  mainContainer: {
    marginTop: 30,
    backgroundColor: "#0F2141",
    width: "130%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userData: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  infoText: {
    fontSize: 21.5,
    marginBottom: 0,
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "norwester",
    top: -15,
  },
  button: {
    width: "80%",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    marginTop: 20,
    alignItems: "center",
  },
  button2: {
    width: "80%",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
    marginTop: 20,
    alignItems: "center",
    top: 40,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 24,
    fontFamily: "norwester",
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
