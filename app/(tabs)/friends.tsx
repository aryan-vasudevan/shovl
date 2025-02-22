import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    FlatList,
} from "react-native";
import { auth, db } from "../../firebase.config";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import BottomBar from "@/components/BottomBar";

export default function Friends() {
    const [targetUserName, setTargetUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [friends, setFriends] = useState<{ uid: any; userName: any; points: any; }[]>([]); // State to store friends
    const [userName, setUserName] = useState("");

    const handleSubmit = async (userName: string) => {
        if (!userName.trim()) return;

        setLoading(true);
        setMessage("");

        try {
            // Step 1: Search for the user by username
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("userName", "==", userName));
            console.log(userName);
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setMessage("User not found.");
                setLoading(false);
                return;
            }

            // Step 2: Get the first matching user (assuming unique usernames)
            const userDoc = querySnapshot.docs[0];
            const friendData = userDoc.data();
            const friendUid = friendData.uid; // Get UID from stored field

            // Step 3: Get current user UID
            const currentUserUid = auth.currentUser?.uid;
            if (!currentUserUid) {
                setMessage("No authenticated user.");
                setLoading(false);
                return;
            }

            // Step 4: Update both users' friends lists
            const currentUserRef = doc(db, "users", currentUserUid);
            const targetUserRef = doc(db, "users", friendUid);

            await updateDoc(currentUserRef, {
                friends: arrayUnion(friendUid),
            });

            await updateDoc(targetUserRef, {
                friends: arrayUnion(currentUserUid),
            });

            setMessage(`Successfully added ${userName} as a friend!`);
            fetchFriends(); // Refresh the friends list after adding a friend
        } catch (error) {
            console.error("Error adding friend:", error);
            setMessage("An error occurred. Try again.");
        }

        setLoading(false);
        setTargetUserName(""); // Clear input after adding friend
    };

    // Function to fetch current user's friends list
    const fetchFriends = async () => {
        const currentUserUid = auth.currentUser?.uid;
        if (!currentUserUid) return;

        try {
            const currentUserRef = doc(db, "users", currentUserUid);
            const userSnap = await getDoc(currentUserRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const friendUids = userData.friends || [];
                setUserName(userData.userName);

                // Fetch details of each friend
                if (friendUids.length > 0) {
                    const friendsQuery = query(collection(db, "users"), where("uid", "in", friendUids));
                    const friendsSnapshot = await getDocs(friendsQuery);

                    const friendsList = friendsSnapshot.docs.map(doc => ({
                        uid: doc.data().uid,
                        userName: doc.data().userName,
                        points: doc.data().points || 0, // Assuming there's a "points" field
                    }));

                    setFriends(friendsList);
                } else {
                    setFriends([]); // No friends yet
                }
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // Fetch friends when component mounts
    useEffect(() => {
        fetchFriends();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FRIENDS LIST</Text>
            <TextInput
                placeholder="Username"
                value={targetUserName}
                onChangeText={setTargetUserName}
                style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={() => handleSubmit(targetUserName)} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>--&gt;</Text>}
            </TouchableOpacity>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <FlatList
                style={styles.listContainer}
                data={friends}
                keyExtractor={(item) => item.uid}
                renderItem={({ item, index }) => (
                    <div>
                        {
                        item.userName != userName ? 
                            <View style={styles.friendItem}>
                                <Text style={styles.friendItemText}>{item.userName}</Text>
                            </View>
                        : 
                            ""
                        }
                    </div>
                    
                )}
            />
            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#102141",
        paddingHorizontal: 16,
        flex: 1,
    },
    title: {
        color: "white",
        fontSize: 30,
    },
    input: {
        borderRadius: 8,
        backgroundColor: "white",
        color: "#102141",
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: "80%",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#1E90FF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    message: {
        color: "white",
        marginTop: 10,
    },
    listContainer: {
        borderColor: "white",
        borderWidth: 4,
        borderRadius: 20,
        width: "100%",
        backgroundColor: "#041129",
        paddingHorizontal: 4,
    },
    friendItem: {
        backgroundColor: "#102141",
        padding: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    friendItemText: {
        color: "white",
        fontSize: 20
    }
});