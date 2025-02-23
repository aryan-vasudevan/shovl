import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import snowData from "../../assets/fonts/Snow.json";
import { useFonts } from "expo-font";
import BottomBar from "@/components/BottomBar";
import { auth, db } from "../../firebase.config"; // Ensure correct Firebase import
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen() {
    const router = useRouter();

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [isMounted, setIsMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [points, setPoints] = useState<number | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [fontsLoaded] = useFonts({
        norwester: require("../../assets/fonts/norwester.otf"),
    });

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;

            try {
                const userDocRef = doc(db, "users", auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserName(userDocSnap.data().userName);
                    setPoints(userDocSnap.data().points);
                } else {
                    console.warn("User document not found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    const handleImageLoad = (event: any) => {
        const { width, height } = event.nativeEvent;
        setImageDimensions({ width, height });
        setIsImageLoaded(true);
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
                }}
                source={require("../../assets/fonts/fog.png")}
                onLoad={handleImageLoad}
            />
            {/* Content */}
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={styles.title}>
                    welcome back {loadingUser ? "..." : userName}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.coinsContainer}>
                <ThemedText type="title" style={styles.coins}>
                    snocoins: &nbsp;
                </ThemedText>
                <ThemedText type="title" style={styles.coinsYellow}>
                    {loadingUser ? "..." : points !== null ? points : "0"}₵
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.mainContainer}>
                <View style={styles.inline}>
                    <TouchableOpacity
                        onPress={() => router.push("/view-tasks")}
                        style={styles.dashButtons}
                    >
                        <ThemedText style={styles.buttonText}>
                            VIEW TASKS
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/add-task")}
                        style={styles.dashButtons}
                    >
                        <ThemedText style={styles.buttonText}>
                            ADD TASK
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.coins2}>your rank:</ThemedText>
                <Image
                    source={require("../../assets/fonts/bronze.png")}
                    style={{ width: 180, height: 280, top: -20 }}
                />
            </ThemedView>

            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        flex: 1,
        alignItems: "center",
        backgroundColor: "#08142C",
        paddingHorizontal: 16,
    },
    titleContainer: {
        backgroundColor: "transparent",
        marginBottom: 0,
        top: 20,
        left: -35,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: "norwester",
    },
    dashButtons: {
        borderRadius: "10px",
        backgroundColor: "#0266CC",
        padding: 10,
    },
    coinsContainer: {
        flexDirection: "row",
        backgroundColor: "transparent",
        textAlign: "left",
        marginBottom: 20,
        top: 20,
        left: 3,
    },
    coins: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: "norwester",
    },
    coins2: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: "norwester",
        marginVertical: 24,
    },
    coinsYellow: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#ffdc5c",
        textAlign: "left",
        fontFamily: "norwester",
    },
    inline: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    },
    mainContainer: {
        marginTop: 30,
        backgroundColor: "#0F2141",
        width: "150%",
        height: "80%",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignContent: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 30,
        // justifyContent: "space",
        // gap: "34px",
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        fontFamily: "norwester",
    },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
