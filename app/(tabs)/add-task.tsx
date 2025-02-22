import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { db, auth } from "../../firebase.config";
import { doc, setDoc } from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

export default function AddTaskScreen() {
    const navigation = useNavigation();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [time, setTime] = useState("");
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    const getLocation = async () => {
        if (hasPermission) {
            const locationData = await Location.getCurrentPositionAsync({});
            setLocation(locationData.coords);
        } else {
            Alert.alert(
                "Permission not granted",
                "Please enable location permissions"
            );
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri: string) => {
        const storage = getStorage();
        const fileName = `task_images/${Date.now()}.jpg`;
        const storageRef = ref(storage, fileName);
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Handle progress (optional)
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(
                        uploadTask.snapshot.ref
                    );
                    resolve(downloadUrl);
                }
            );
        });
    };

    const handleCreateTask = async () => {
        if (!time || !location || !imageUri) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        const user = auth.currentUser;
        if (user) {
            try {
                // Upload image to Firebase Storage
                const imageUrl = await uploadImage(imageUri);

                const taskId = `task_${Date.now()}`;
                const taskData = {
                    time,
                    location,
                    imageUri: imageUrl,
                    createdBy: user.email,
                    createdAt: new Date(),
                };

                // Save the task to Firestore
                await setDoc(doc(db, "tasks", taskId), taskData);
                Alert.alert("Success", "Task created!");
                navigation.goBack();
            } catch (error) {
                Alert.alert("Error", "Failed to create task");
            }
        } else {
            Alert.alert("Error", "User not logged in");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create a Task</Text>

            <TextInput
                placeholder="Task Time (e.g. 10:00 AM)"
                value={time}
                onChangeText={setTime}
                style={styles.input}
            />

            <TouchableOpacity onPress={getLocation} style={styles.button}>
                <Text style={styles.buttonText}>Get Location</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={styles.button}>
                <Text style={styles.buttonText}>Pick a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCreateTask} style={styles.button}>
                <Text style={styles.buttonText}>Publish Task</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 12,
    },
    button: {
        width: "100%",
        padding: 16,
        backgroundColor: "#0066CC",
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
});
