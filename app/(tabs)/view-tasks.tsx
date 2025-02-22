import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Button,
} from "react-native";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";

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

    if (minutesDiff < 60) {
        return `${minutesDiff} minute${minutesDiff !== 1 ? "s" : ""} ago`;
    } else if (hoursDiff < 24) {
        return `${hoursDiff} hour${hoursDiff !== 1 ? "s" : ""} ago`;
    } else if (daysDiff < 7) {
        return `${daysDiff} day${daysDiff !== 1 ? "s" : ""} ago`;
    } else if (weeksDiff < 4) {
        return `${weeksDiff} week${weeksDiff !== 1 ? "s" : ""} ago`;
    } else {
        return `${monthsDiff} month${monthsDiff !== 1 ? "s" : ""} ago`;
    }
};

export default function ViewTasksScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [sortBy, setSortBy] = useState<"date" | "distance">("date"); // Default sorting by date

    // Fetch tasks from Firestore
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksCollection = collection(db, "tasks");
                const tasksSnapshot = await getDocs(tasksCollection);
                const tasksList = tasksSnapshot.docs.map((doc) => doc.data());
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
        const getUserLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        };

        getUserLocation();
    }, []);

    // Function to sort tasks based on selected criteria
    const sortTasks = (tasks: any[]) => {
        if (!userLocation) return tasks; // Return tasks as is if user location isn't available yet

        if (sortBy === "date") {
            return tasks.sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            );
        } else if (sortBy === "distance") {
            return tasks.sort((a, b) => {
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
            });
        }
        return tasks;
    };

    // Render each task with formatted date and distance
    const renderItem = ({ item }: { item: any }) => {
        if (!userLocation) return null; // Don't render until user location is available

        const taskDistance = distance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
        ).toFixed(2); // Calculate and round the distance to 2 decimal places

        return (
            <View style={styles.taskCard}>
                <Image source={{ uri: item.photo }} style={styles.taskImage} />
                <Text style={styles.taskText}>
                    Posted {formatDate(item.timestamp)}
                </Text>
                <Text style={styles.taskText}>
                    Distance: {taskDistance} km
                </Text>
            </View>
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
                        data={sortTasks(tasks)} // Apply sorting before rendering
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F9F9F9",
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
});
