import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async () => {
        if (!email || !userName || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            // Firebase authentication - create user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Store user data in Firestore using UID as the document ID
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                userName: userName,
                friends: [],
                points: 0, // New users start with 0 points
            });

            Alert.alert("Success", "Account created!");
            router.push("/login");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={styles.title}>
                    Register
                </ThemedText>
            </ThemedView>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />

            <TextInput 
                placeholder="Username"
                value={userName}
                onChangeText={setUserName}
                style={styles.input}
            />
            <TextInput
                placeholder="Password (6 or more characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity onPress={handleRegister} style={styles.button}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/login")}
                style={styles.loginLink}
            >
                <Text style={styles.linkText}>
                    have an account: login
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
    backgroundColor: "#0F2141",
    overflow: "hidden",
  },
  titleContainer: {
    backgroundColor: "#transparent",
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: "normal",
    color: "#FFFFFF",
    fontFamily: "norwester",
  },
  input: {
    width: "70%",
    height: "7%",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    fontFamily: "norwester",
  },
  button: {
    width: "33%",
    height: "7%",
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  registerLink: {
    marginTop: 11,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "norwester",
  },
  body: {
    overflow: "hidden",
    height: "100%",
  },
});
