import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields.");
            return;
        }

        try {
            // Firebase authentication
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Success", "Logged in!");
            router.push("/");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={styles.title}>
                    Login
                </ThemedText>
            </ThemedView>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/register")}
                style={styles.registerLink}
            >
                <Text style={styles.linkText}>
                    Don't have an account? Register
                </Text>
            </TouchableOpacity>
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
    titleContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#0066CC",
    },
    input: {
        width: "100%",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
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
        fontWeight: "bold",
        fontSize: 16,
    },
    registerLink: {
        marginTop: 16,
    },
    linkText: {
        color: "#0066CC",
        fontSize: 16,
        textDecorationLine: "underline",
    },
});
