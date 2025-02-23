import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Lottie from "lottie-react-native";
import snowData from "../../assets/fonts/Snow.json";
import { useFonts } from "expo-font";
import BottomBar from "@/components/BottomBar";

export default function HomeScreen() {
  const router = useRouter();

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"),
  });

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent;
    setImageDimensions({ width, height });
    console.log("Image loaded with dimensions:", width, height);
    setIsImageLoaded(true);
  };

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
        onLoad={handleImageLoad} // Adding the load event
      />
      
      {/* Ensure that Lottie only renders if image is loaded and has valid dimensions */}
      {isMounted && isImageLoaded && imageDimensions.width > 0 && imageDimensions.height > 0 ? (
        <View
          pointerEvents="none"
          style={{
            zIndex: -2,
            position: "absolute",
            top: 0,
            width: 1000,
            height: 1000,
          }}
        >
          <Lottie
            source={snowData}
            autoPlay
            loop
          />
        </View>
      ) : (
        <ActivityIndicator size="large" color="#0066CC" />
      )}

      {/* Content */}
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

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flex: 1,
    alignItems: "center",
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
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 24,
    fontFamily: "norwester",
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
