import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db, auth } from "../../firebase.config"; // Import db and auth
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

export default function CompleteTaskScreen() {
    const { taskId } = useLocalSearchParams(); // Getting taskId from query params
    const [taskUid, setTaskUid] = useState("");
    const [userName, setUserName] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Set taskUid once when taskId is available
    useEffect(() => {
        if (taskId) {
            setTaskUid(taskId as string);
        }
    }, [taskId]); // Only runs when taskId changes

    useEffect(() => {
        const fetchUserName = async () => {
            const userUid = auth.currentUser?.uid;
            if (!userUid) return;
            console.log(userUid);

            try {
                const userDoc = await getDoc(doc(db, "users", userUid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data()?.username || "Unknown User");
                } else {
                    console.log("No user data found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserName();
    }, []);

    const pickImage = async () => {
        if (!auth.currentUser) {
            Alert.alert("Error", "You must be signed in to upload an image.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const uploadImageToCloudinary = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("file", blob, "photo.jpg");
        formData.append("upload_preset", "ml_default");
        formData.append("api_key", "556837874624961");

        try {
            const cloudinaryResponse = await fetch(
                "https://api.cloudinary.com/v1_1/dkvqiejgn/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await cloudinaryResponse.json();
            if (!data.secure_url) {
                throw new Error("Cloudinary upload failed.");
            }

            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw new Error("Error uploading image to Cloudinary.");
        }
    };

    const calculatePoints = async (imageUrl: string) => {
        try {
            const response = await axios.post(
                "https://detect.roboflow.com/snow-detection-11m4t/1",
                {},
                {
                    params: {
                        api_key: "e0MsKsQAKbK13vS6G8rM",
                        image: imageUrl,
                    },
                }
            );

            const totalSnow = response.data.predictions.reduce(
                (sum: number, obj: any) => sum + obj.width * obj.height,
                0
            );

            return Math.round(
                Math.min(10, Math.max(1, (totalSnow / 600000) * 10))
            );
        } catch (error) {
            console.error("Error calculating points:", error);
            Alert.alert("Error", "Failed to analyze image.");
            return 0;
        }
    };

    const handleSubmit = async () => {
        const userUid = auth.currentUser?.uid;
        if (!userUid) {
            Alert.alert("Error", "You must be signed in to submit a task.");
            return;
        }

        if (!photo || !taskUid) {
            Alert.alert("Error", "Missing required data.");
            return;
        }

        setLoading(true);

        try {
            const imageUrl = await uploadImageToCloudinary(photo);

            const taskRef = doc(db, "tasks", taskUid); // Firestore doc reference
            const taskSnap = await getDoc(taskRef);

            if (!taskSnap.exists()) {
                throw new Error("Task not found.");
            }

            const originalPoints = taskSnap.data()?.points ?? 0;

            const userRef = doc(db, "users", userUid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.error(
                    "User document does not exist in Firestore:",
                    userUid
                );
                throw new Error("User not found.");
            }

            const currentPoints = userSnap.data()?.points ?? 0;
            const originalTasksCompleted = userSnap.data()?.tasksCompleted ?? 0;

            await updateDoc(userRef, {
                points: currentPoints + originalPoints,
                tasksCompleted: originalTasksCompleted + 1,
            });

            await updateDoc(taskRef, { completed: true });

            Alert.alert(
                "Success",
                `Task completed! You earned ${originalPoints} points.`
            );
            router.push({
                pathname: "/view-tasks",
                params: { userUid },
            });
        } catch (error) {
            Alert.alert("Error", "Failed to complete task.");
            console.error("Error completing task:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0066CC" />}

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>

            {photo && <Image source={{ uri: photo }} style={styles.preview} />}

            {photo && (
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Submit Completion</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
    },
    button: {
        backgroundColor: "#0066CC",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: { color: "white", fontWeight: "bold" },
    preview: { width: 300, height: 400, marginVertical: 20 },
    submitButton: {
        backgroundColor: "#28A745",
        padding: 15,
        borderRadius: 8,
    },
});
