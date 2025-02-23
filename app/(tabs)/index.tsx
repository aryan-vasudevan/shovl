import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db, auth } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { ThemedView } from "@/components/ThemedView";
import Lottie from "lottie-react-native";
import snowData from "../../assets/fonts/Snow.json";
import { useFonts } from "expo-font";
import { Image } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState<{
    email: string;
    points: number;
    userName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"),
  });

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 1.1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
    const { userUid } = useLocalSearchParams();

  useEffect(() => {
    setIsMounted(true);

    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(
            userDoc.data() as {
              email: string;
              points: number;
              userName: string;
            }
          );
        } else {
          console.log("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => setIsMounted(false);
  }, [userUid]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0066CC" style={styles.loading} />
    );
  }

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

      {isMounted && (
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
          pointerEvents="none"
        >
          <Lottie
            source={snowData}
            autoPlay
            loop
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>
      )}

      <ThemedView style={styles.titleContainer}>
        <Image
          style={{ width: 320, height: 250 }}
          source={require("../../assets/fonts/shovltitle.png")}
          resizeMode="cover"
        />
      </ThemedView>

      <Text style={styles.infoText}>gamifying canada's</Text>
      <Text style={styles.infoText}>least-favorite chore</Text>

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push("/login")}
      >
        <Animated.View
          style={[styles.button2, { transform: [{ scale: scaleValue }] }]}
        >
          <Image
            source={require("../../assets/fonts/login.png")}
            style={{ width: 120, height: 50 }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F2141",
    paddingHorizontal: 16,
  },
  titleContainer: {
    backgroundColor: "transparent",
    marginBottom: 20,
    top: 100,
  },
  infoText: {
    fontSize: 21.5,
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "norwester",
    top: -15,
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
