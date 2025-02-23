import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { auth, db } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import BottomBar from "@/components/BottomBar";

export default function Profile() {
    const [userData, setUserData] = useState<{
        userName: string;
        points: number;
        tasksCompleted: number;
        friends: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as {
                        userName: string;
                        points: number;
                        tasksCompleted: number;
                        friends: string[]
                    });
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
                    <Text style={styles.title}>PROFILE STATS: {userData.userName.toUpperCase()}</Text>
                    <Text style={styles.text}>Points: {userData.points}</Text>
                    <Text style={styles.text}>Tasks Completed: {userData.tasksCompleted}</Text>
                    <Text style={styles.text}>Friends: {userData.friends?.length-1 || 0}</Text>

                </>
            ) : (
                <Text style={styles.text}>No user data available.</Text>
            )}
            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#102141",
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 18,
        marginBottom: 5,
    },
});
