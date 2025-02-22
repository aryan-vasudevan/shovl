import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Lottie from "lottie-react";
import snowData from "../../assets/fonts/Snow.json";
import { useFonts } from "expo-font";
import { Image } from "react-native";
import flagData from "../../assets/fonts/flag.json";
export default function HomeScreen() {
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
      <Lottie
        animationData={snowData}
        style={{ zIndex: -2, position: "absolute" }}
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
            <Lottie
              animationData={flagData}
              style={{
                width: 100,
                height: 50,
                position: "absolute",
                left: 174,
                top: 38,
                transform: "rotate(16deg)", // Wrap in quotes
              }}
            />
            <Image
              style={{ width: 240, height: 210 }}
              source={require("../../assets/fonts/titleshovl.png")}
              resizeMode="cover"
            />
          </ThemedView>
          <Text style={styles.infoText}>
            gamifying canada's least-favorite chore
          </Text>
          {/* <Text style={styles.infoText}>Sign up to start earning rewards.</Text> */}

          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#102444",
    paddingHorizontal: 16,
  },
  titleContainer: {
    backgroundColor: "transparent",
    marginBottom: 20,
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
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "norwester",
  },
  button: {
    width: "80%",
    padding: 16,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
