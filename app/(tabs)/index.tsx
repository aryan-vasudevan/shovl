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
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 1.1, // Scale up
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1, // Scale back to original size
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"), // Replace with your font file
  });

  const [userData, setUserData] = useState<{
    email: string;
    points: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (snowRef.current) {
        snowRef.current.setSpeed(0.25); // Change speed (1 is normal, lower is slower)
      }
    }, 50); // Delay to ensure the animation is loaded

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      // No user is logged in
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as { email: string; points: number });
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
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0066CC" style={styles.loading} />
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={{ width: 350, height: 350, position: "absolute", top: 0, opacity: 0.5 }}
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

      {/* <Text style={styles.userData}>{userData?.email || "fjdlksfjlds"}</Text> */}
      {userData ? (
        <>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              Welcome Back!
            </ThemedText>
          </ThemedView>
          <Text style={styles.infoText}>Points: {userData.points}</Text>

          {/* Add Task Button */}
          <TouchableOpacity
            onPress={() => router.push("/add-task")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Add Task</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ThemedView style={styles.titleContainer}>
            {/* <Lottie
              animationData={flagData}
              style={{
                width: 100,
                height: 50,
                position: "absolute",
                left: 228,
                top: 35,
                transform: "rotate(16deg)", // Wrap in quotes
              }}
            /> */}
            <Image
              style={{ width: 320, height: 250 }}
              source={require("../../assets/fonts/shovltitle.png")}
              resizeMode="cover"
            />
          </ThemedView>
          <Text style={styles.infoText}>gamifying canada's</Text>
          <Text style={styles.infoText}>least-favorite chore</Text>

          {/* <Text style={styles.infoText}>Sign up to start earning rewards.</Text> */}
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
        </>
      )}
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "norwester",
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
