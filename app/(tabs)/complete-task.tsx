import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { db } from "../../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

export default function CompleteTaskScreen({ route }: { route: any }) {
    const { taskId, userId } = route.params; // Task ID & User ID passed from task list
    const router = useRouter();
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Pick an image
    const pickImage = async () => {
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

    // Upload image to Cloudinary (same as before)
    const uploadImageToCloudinary = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("file", blob);
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
                throw new Error(
                    "Cloudinary upload failed: " + JSON.stringify(data)
                );
            }

            return data.secure_url; // Return the image URL from Cloudinary
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw new Error(
                "Error uploading image to Cloudinary: " + (error as Error).message
            );
        }
    };

    // Calculate points using Roboflow
    const calculatePoints = async (imageUrl: string) => {
        try {
            const response = await axios.post("https://detect.roboflow.com/snow-detection-11m4t/1", 
                {},
                {
                    params: {
                        api_key: "e0MsKsQAKbK13vS6G8rM",
                        image: imageUrl,
                    },
                }
            );

            // Sum width * height for all detections
            const totalSnow = response.data.predictions.reduce((sum: number, obj: any) => sum + obj.width * obj.height, 0);

            // Scale down to 1-10 range
            const normalizedPoints = Math.min(10, Math.max(1, (totalSnow / 600000) * 10));

            return Math.round(normalizedPoints);
        } catch (error) {
            console.error("Error calculating points:", error);
            Alert.alert("Error", "Failed to analyze image.");
            return 0;
        }
    };

    // Handle task completion
    const handleSubmit = async () => {
        if (!photo) {
            Alert.alert("Error", "Please select an image.");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload image
            const imageUrl = await uploadImageToCloudinary(photo);

            // 2. Fetch original task data
            const taskRef = doc(db, "tasks", taskId);
            const taskSnap = await getDoc(taskRef);

            if (!taskSnap.exists()) {
                throw new Error("Task not found.");
            }

            const originalPoints = taskSnap.data()?.points ?? 0;

            // 3. Calculate new points
            const newPoints = await calculatePoints(imageUrl);
            const pointsEarned = originalPoints - newPoints; // Snow removed

            // 4. Update user’s points
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("User not found.");
            }

            const currentPoints = userSnap.data()?.points ?? 0;
            await updateDoc(userRef, { points: currentPoints + pointsEarned });

            // 5. Mark task as completed
            await updateDoc(taskRef, { completed: true });

            Alert.alert("Success", `Task completed! You earned ${pointsEarned} points.`);
            router.push("/");
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
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
