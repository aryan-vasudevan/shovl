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

export default function HomeScreen() {
    const router = useRouter();
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
                    setUserData(
                        userDoc.data() as { email: string; points: number }
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
            {userData ? (
                <>
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title" style={styles.title}>
                            Welcome Back!
                        </ThemedText>
                    </ThemedView>
                    <Text style={styles.infoText}>
                        Points: {userData.points}
                    </Text>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9F9F9",
        paddingHorizontal: 16,
    },
    titleContainer: { marginBottom: 20 },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#0066CC",
        textAlign: "center",
    },
    infoText: { fontSize: 18, marginBottom: 10, textAlign: "center" },
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
