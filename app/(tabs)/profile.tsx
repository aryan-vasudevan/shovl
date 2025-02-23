import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import BottomBar from "@/components/BottomBar";
import { Image } from "react-native";
import { useFonts } from "expo-font";
export default function Profile() {
  const [userData, setUserData] = useState<{
    userName: string;
    points: number;
    tasksCompleted: number;
    friends: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"),
  });
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(
            userDoc.data() as {
              userName: string;
              points: number;
              tasksCompleted: number;
              friends: string[];
            }
          );
        } else {
          console.log("User document not found.");
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text style={styles.title}>PROFILE STATS:</Text>
          <Text style={styles.text}>name: {userData.userName}</Text>
          <Text style={styles.text}>points: {userData.points}</Text>
          <Text style={styles.text}>
            tasks completed: {userData.tasksCompleted}
          </Text>
          <Text style={styles.text}>
            friends: {userData.friends?.length - 1 || 0}
          </Text>
        </>
      ) : (
        <Text style={styles.text}>No user data available.</Text>
      )}
      <Image
        source={require("../../assets/fonts/bronze.png")}
        style={{
          width: 69,
          height: 105,
          left: 25,
          top: 270,
          position: "absolute",
        }}
      />
      <Image
        source={require("../../assets/fonts/silver.png")}
        style={{
          width: 69,
          height: 105,
          left: 125,
          top: 270,
          position: "absolute",
        }}
      />
      <Image
        source={require("../../assets/fonts/gold.png")}
        style={{
          width: 69,
          height: 105,
          left: 225,
          top: 270,
          position: "absolute",
        }}
      />
      <Image
        source={require("../../assets/fonts/diamondshovel.png")}
        style={{
          width: 69,
          height: 105,
          left: 25,
          top: 400,
          position: "absolute",
        }}
      />
      <Image
        source={require("../../assets/fonts/diamond_snowmaster.png")}
        style={{
          width: 69,
          height: 105,
          left: 125,
          top: 400,
          position: "absolute",
        }}
      />
      <Image
        source={require("../../assets/fonts/snowmaster.png")}
        style={{
          width: 69,
          height: 105,
          left: 225,
          top: 400,
          position: "absolute",
        }}
      />

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#102141",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    marginTop: 100,
    fontFamily: "norwester",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 5,
    fontFamily: "norwester",
  },
});
