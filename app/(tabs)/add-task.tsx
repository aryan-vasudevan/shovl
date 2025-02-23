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

            const { width, height } = response.data.image; // Access width and height from the response
            let predictions = response.data.predictions || [];

            // If no predictions are made, fallback to using image width and height
            if (predictions.length === 0) {
                console.warn(
                    "No predictions detected. Using image dimensions for points calculation."
                );
                const imageArea = width * height;
                return calculatePointsFromImageDimensions(imageArea);
            }

            // Filter out predictions with confidence less than 1%
            predictions = predictions.filter(
                (prediction: any) => prediction.confidence >= 0.01
            );

            if (predictions.length === 0) {
                console.warn("No snow detected with sufficient confidence.");
                return 5; // Return the minimum points when no snow is detected with enough confidence
            }

            // Calculate the total area of all snow piles (width * height for each prediction)
            let totalArea = predictions.reduce(
                (sum: number, p: any) => sum + p.width * p.height,
                0
            );

            console.log("Total Area (width * height):", totalArea);

            // Optional: Overlay confidence values for each prediction
            predictions.forEach((prediction: any) => {
                console.log(
                    `Prediction Confidence: ${prediction.confidence * 100}%`
                );
            });

            // Adjust the scaling factor based on a target area
            const scalingFactor = 10 / 600000; // You may fine-tune this based on expected area range
            let rawPoints = totalArea * scalingFactor;

            // Normalizing points into a Gaussian-like distribution between 5 and 15
            const mean = 10;
            const stdDev = 2; // Control how spread out the points are

            // Calculate the point using a Gaussian distribution
            const gaussianPoints = Math.round(
                mean + stdDev * (Math.random() * 2 - 1) * rawPoints
            );

            // Ensure the points are within the range of 5 to 15
            let finalPoints = Math.max(5, Math.min(15, gaussianPoints));

            console.log(
                "Calculated Points (Gaussian-like distribution):",
                finalPoints
            );
            return finalPoints;
        } catch (error) {
            console.error("Error calculating snow coverage:", error);
            return 5; // Return minimum points in case of error
        }
    };

    // Fallback function to calculate points from image dimensions
    const calculatePointsFromImageDimensions = (imageArea: number) => {
        // For simplicity, you can use a similar scaling approach for the image area
        const scalingFactor = 10 / 600000; // You can adjust this based on the image size
        let rawPoints = imageArea * scalingFactor;

        // Normalizing points into a Gaussian-like distribution between 5 and 15
        const mean = 10;
        const stdDev = 2; // Control how spread out the points are

        // Calculate the point using a Gaussian distribution
        const gaussianPoints = Math.round(
            mean + stdDev * (Math.random() * 2 - 1) * rawPoints
        );

        // Ensure the points are within the range of 5 to 15
        let finalPoints = Math.max(5, Math.min(15, gaussianPoints));

        console.log("Fallback Points (Image Dimensions):", finalPoints);
        return finalPoints;
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
                points: points,
                completed: false,
            };

            await addDoc(collection(db, "tasks"), taskData);

            Alert.alert("Success", "Task created successfully!");
            router.push("/dashboard");
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
