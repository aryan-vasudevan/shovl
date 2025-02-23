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
import BottomBar from "@/components/BottomBar";

export default function HomeScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<{
        email: string;
        points: number;
        username: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // Ensure the component is mounted before taking action

        const fetchUserData = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(
                    doc(db, "users", auth.currentUser.uid)
                );
                if (userDoc.exists()) {
                    setUserData(
                        userDoc.data() as {
                            email: string;
                            points: number;
                            username: string;
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
    }, []);

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#0066CC"
                style={styles.loading}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* <Text style={styles.userData}>{userData?.email || ""}</Text> */}
            {userData ? (
                <>
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title" style={styles.title}>
                            Welcome Back, {userData.username}!
                        </ThemedText>
                    </ThemedView>
                    <Text style={styles.infoText}>
                        Points: {userData.points}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => router.push("/add-task")}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/view-tasks",
                                    params: { userId: userData.username },
                                })
                            }
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>View Tasks</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title" style={styles.title}>
                            Welcome to shovl!
                        </ThemedText>
                    </ThemedView>
                    <Text style={styles.infoText}>
                        Earn points by helping your community with snow
                        shoveling!
                    </Text>
                    <Text style={styles.infoText}>
                        Sign up to start earning rewards.
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push("/login")}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </>
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
    titleContainer: { 
        backgroundColor: "#F9F9F9",
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#0066CC",
        textAlign: "center",
    },
    infoText: { fontSize: 18, marginBottom: 10, textAlign: "center" },
    buttonContainer: {
        width: "80%",
        flexDirection: "column",
        gap: 10,
    },
    button: {
        width: "100%",
        padding: 16,
        backgroundColor: "#0066CC",
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
