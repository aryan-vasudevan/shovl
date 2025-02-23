import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Button,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import BottomBar from "@/components/BottomBar";
import { useLocalSearchParams } from "expo-router";

// Haversine formula to calculate distance in km
const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const r = 6371; // Earth radius in km
    const p = Math.PI / 180;

    const a =
        0.5 -
        Math.cos((lat2 - lat1) * p) / 2 +
        (Math.cos(lat1 * p) *
            Math.cos(lat2 * p) *
            (1 - Math.cos((lon2 - lon1) * p))) /
            2;

    return r * 2 * Math.asin(Math.sqrt(a)); // Distance in km
};

// Function to format time difference
const formatDate = (timestamp: string) => {
    const now = new Date();
    const taskDate = new Date(timestamp);
    const timeDiff = now.getTime() - taskDate.getTime(); // Time difference in milliseconds

    const minutesDiff = Math.floor(timeDiff / (1000 * 60)); // Difference in minutes
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60)); // Difference in hours
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Difference in days
    const weeksDiff = Math.floor(daysDiff / 7); // Difference in weeks
    const monthsDiff = Math.floor(daysDiff / 30); // Difference in months

    if (minutesDiff < 60)
        return `${minutesDiff} minute${minutesDiff !== 1 ? "s" : ""} ago`;
    if (hoursDiff < 24)
        return `${hoursDiff} hour${hoursDiff !== 1 ? "s" : ""} ago`;
    if (daysDiff < 7) return `${daysDiff} day${daysDiff !== 1 ? "s" : ""} ago`;
    if (weeksDiff < 4)
        return `${weeksDiff} week${weeksDiff !== 1 ? "s" : ""} ago`;

    return `${monthsDiff} month${monthsDiff !== 1 ? "s" : ""} ago`;
};

export default function ViewTasksScreen() {
    const { userUid } = useLocalSearchParams();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [sortBy, setSortBy] = useState<"date" | "distance">("date"); // Default sorting by date
    const router = useRouter();

    // Fetch tasks from Firestore
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksCollection = collection(db, "tasks");
                const tasksSnapshot = await getDocs(tasksCollection);
                const tasksList = tasksSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTasks(tasksList);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Get user's current location
    useEffect(() => {
        const getUserLocation = async () => {
            try {
                let { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.error("Permission to access location was denied");
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error("Error getting user location:", error);
            }
        };

        getUserLocation();
    }, []);

    // Function to sort tasks based on selected criteria
    const sortTasks = (tasks: any[]) => {
        if (!userLocation) return tasks; // Return tasks as is if user location isn't available yet

        return [...tasks].sort((a, b) => {
            if (sortBy === "date") {
                return (
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );
            } else if (sortBy === "distance") {
                const distA = distance(
                    userLocation.latitude,
                    userLocation.longitude,
                    a.latitude,
                    a.longitude
                );
                const distB = distance(
                    userLocation.latitude,
                    userLocation.longitude,
                    b.latitude,
                    b.longitude
                );
                return distA - distB;
            }
            return 0;
        });
    };

    // Render each task with formatted date, distance, and points
    const renderItem = ({ item }: { item: any }) => {
        if (!userLocation) return null; // Don't render until user location is available

        const taskDistance = distance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
        ).toFixed(2); // Calculate and round the distance to 2 decimal places

        return (
            <TouchableOpacity
                onPress={() =>
                    router.push({
                        pathname: "/complete-task",
                        params: { taskId: item.id, userUid: userUid },
                    })
                }
            >
                <View style={styles.taskCard}>
                    <Image
                        source={{ uri: item.photo }}
                        style={styles.taskImage}
                    />
                    <Text style={styles.taskText}>
                        Posted {formatDate(item.timestamp)}
                    </Text>
                    <Text style={styles.taskText}>
                        Distance: {taskDistance} km |{" "}
                        <Text style={styles.pointsText}>
                            Points: {item.points}
                        </Text>
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0066CC" />
            ) : (
                <>
                    {/* Toggle buttons for sorting */}
                    <View style={styles.toggleContainer}>
                        <Button
                            title="Sort by Date"
                            onPress={() => setSortBy("date")}
                            color={sortBy === "date" ? "#0066CC" : "#D3D3D3"}
                        />
                        <Button
                            title="Sort by Distance"
                            onPress={() => setSortBy("distance")}
                            color={
                                sortBy === "distance" ? "#0066CC" : "#D3D3D3"
                            }
                        />
                    </View>

                    <FlatList
                        data={sortTasks(tasks)}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />
                </>
            )}
            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
        paddingBottom: 60,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    taskCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    taskImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
    },
    taskText: {
        fontSize: 14,
        color: "#333",
        marginTop: 5,
    },
    pointsText: {
        fontWeight: "bold",
        color: "#0066CC",
    },
});
