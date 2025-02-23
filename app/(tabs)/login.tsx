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
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import flagData from "../../assets/fonts/flag.json";
import { useFonts } from "expo-font";
import { Image } from "react-native";
import Lottie from "lottie-react";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    norwester: require("../../assets/fonts/norwester.otf"), // Replace with your font file
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        console.log("User data:", userDoc.data());
        router.push("/dashboard");
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={{
          width: 350,
          height: 350,
          position: "absolute",
          top: 0,
          opacity: 0.5,
          zIndex: -1,
        }}
        source={require("../../assets/fonts/fog.png")}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          login
        </ThemedText>
      </ThemedView>

      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Image
          source={require("../../assets/fonts/login.png")}
          style={{ width: 90, height: 40 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={styles.registerLink}
      >
        <Text style={styles.linkText}>create account</Text>
      </TouchableOpacity>
      <Image
        source={require("../../assets/fonts/snowman.png")}
        style={{
          width: 100,
          height: 120,
          position: "absolute",
          left: 5,
          top: 460,
        }}
      />
      <Image
        source={require("../../assets/fonts/snowbank.png")}
        style={{
          width: "100%",
          height: 140,
          position: "absolute",
          left: 0,
          top: 480,
          zIndex: -1,
        }}
      />
      <Lottie
        animationData={flagData}
        style={{
          width: 66,
          height: 80,
          position: "absolute",
          top: 448,
          left: 80,
        }}
      />
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
    fontSize: 18,
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
