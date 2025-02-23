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
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { db } from "../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

export default function AddTaskScreen() {
    const router = useRouter();
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] =
        useState<Location.LocationObjectCoords | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required to create a task."
                );
                return;
            }
            try {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc.coords);
            } catch (error) {
                console.error("Location error:", error);
            }
        })();
    }, []);

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
                "Error uploading image to Cloudinary: " +
                    (error as Error).message
            );
        }
    };

    const getSnowCoveragePoints = async (imageUrl: string) => {
        try {
            const response = await axios.post(
                "https://detect.roboflow.com/snow-detection-11m4t/1",
                null,
                {
                    params: {
                        api_key: "e0MsKsQAKbK13vS6G8rM",
                        image: imageUrl,
                    },
                }
            );

            console.log(
                "Roboflow Response:",
                JSON.stringify(response.data, null, 2)
            );

            const predictions = response.data.predictions || [];

            if (predictions.length === 0) {
                console.warn("No objects detected.");
                return 1; // If no snow detected, return the minimum points
            }

            // Calculate the total area of all snow piles (width * height for each prediction)
            let totalArea = predictions.reduce(
                (sum: number, p: any) => sum + p.width * p.height,
                0
            );

            console.log("Total Area (width * height):", totalArea);

            // Adjust the scaling factor based on the average photo's total area of 600,000
            const scalingFactor = 5 / 600000; 
            let scaledPoints = totalArea * scalingFactor;

            // Cap the points at 10 (maximum)
            scaledPoints = Math.min(scaledPoints, 10);

            // Ensure points are at least 1 (minimum)
            scaledPoints = Math.max(scaledPoints, 2);

            console.log("Calculated Points (scaled):", scaledPoints);
            return Math.round(scaledPoints);
        } catch (error) {
            console.error("Error calculating snow coverage:", error);
            return 1; // Return minimum points in case of error
        }
    };

    const handleSubmit = async () => {
        if (!photo || !location) {
            Alert.alert(
                "Error",
                "Please select an image and allow location access."
            );
            return;
        }

        setLoading(true);

        try {
            const imageUrl = await uploadImageToCloudinary(photo); // Upload image to Cloudinary
            const points = await getSnowCoveragePoints(imageUrl); // Get snow coverage points

            const taskData = {
                photo: imageUrl,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date().toISOString(),
                points, // Store calculated points
            };

            await addDoc(collection(db, "tasks"), taskData);

            Alert.alert("Success", "Task created successfully!");
            router.push("/");
        } catch (error) {
            Alert.alert("Error", "Failed to submit task.");
            console.error("Error submitting task:", error);
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
                    <Text style={styles.buttonText}>Submit Task</Text>
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
