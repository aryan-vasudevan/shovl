import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../../firebase.config";
import { useRouter } from "expo-router";
import {
  getDoc,
  doc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import BottomBar from "@/components/BottomBar";

export default function Leaderboard() {
  const [userData, setUserData] = useState<{
    email: string;
    points: number;
  } | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageCode, setMessageCode] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // No user is logged in, redirect to login
        router.push("/login");
      } else {
        // User is logged in, fetch their data
        fetchUserData(user.uid);
      }
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as { email: string; points: number });
        // Fetch friends data here, etc.
        fetchFriends(userId);
      } else {
        console.log("No user data found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const friendsList = userDocSnap.data().friends || [];
        console.log(friendsList);
        if (friendsList.length === 0) {
          setFriends([]);
          setMessageCode(1);
        } else {
          const usersCollection = collection(db, "users");
          const friendsQuery = query(
            usersCollection,
            where("uid", "in", friendsList)
          );
          const querySnapshot = await getDocs(friendsQuery);
          const friendsData = querySnapshot.docs.map((doc) => ({
            userName: doc.data().userName,
            points: doc.data().points || 0,
          }));
          friendsData.sort((a, b) => b.points - a.points);
          setFriends(friendsData);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setMessageCode(2);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0066CC" />;
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.userData}>{userData?.email || "fjdlksfjlds"}</Text> */}
      {messageCode === 0 ? (
        <div>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.userName}
            renderItem={({ item, index }) => (
              <View style={styles.friendItem}>
                <Text
                  style={[
                    styles.rank,
                    index === 0
                      ? styles.gold
                      : index === 1
                      ? styles.silver
                      : index === 2
                      ? styles.bronze
                      : {},
                  ]}
                >
                  {index + 1}. {item.userName} - {item.points} pts
                </Text>
              </View>
            )}
          />
        </div>
      ) : messageCode === 1 ? (
        <Text>Add some friends to compete with for the top spot!</Text>
      ) : (
        <Text>Error loading friends.</Text>
      )}
      <BottomBar/>
    </View>
  );
}

const styles = StyleSheet.create({
  gold: { color: "#ffde59" },
  silver: { color: "#9e9399" },
  bronze: { color: "#b2935a" },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  userData: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rank: {
    fontWeight: "bold",
    fontSize: 18,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  points: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
