import { StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomBar() {
    const dimensions = 35;
    const router = useRouter();

    const handleClick = (s: string) => {
        if (s === "leaderboard") {
            router.push("/(tabs)/leaderboard");
        } else if (s === "tasks") {
            router.push("/(tabs)/view-tasks");
        } else if (s === "home") {
            router.push("/(tabs)/dashboard");
        } else if (s === "friends") {
            router.push("/(tabs)/friends");
        } else if (s === "profile") {
            router.push("/(tabs)/profile");
        }
    }

    return (
        <div style={styles.container}>
            <button style={styles.buttons} onClick={() => {handleClick("leaderboard")}}><Image source={require('../assets/images/bottom-bar/rankings.png')} style={{ width: dimensions, height: dimensions }} /></button>
            <button style={styles.buttons} onClick={() => { handleClick("tasks") }}><Image source={require('../assets/images/bottom-bar/pin.png')} style={{ width: dimensions, height: dimensions }} /></button>
            <button style={styles.buttons} onClick={() => { handleClick("home") }}><Image source={require('../assets/images/bottom-bar/home.png')} style={{ width: dimensions, height: dimensions }} /></button>
            <button style={styles.buttons} onClick={() => { handleClick("friends") }}><Image source={require('../assets/images/bottom-bar/friends.png')} style={{ width: dimensions, height: dimensions }} /></button>
            <button style={styles.buttons} onClick={() => { handleClick("profile") }}><Image source={require('../assets/images/bottom-bar/profile.png')} style={{ width: dimensions, height: dimensions }} /></button>
        </div>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        position: "fixed",
        bottom: 0,
        backgroundColor: "#041129",
        boxShadow: "",
        display: "flex",
        justifyContent: "space-evenly",
    },
    buttons: {
        width: "100%",
        height: "100%",
        paddingTop: 15,
        paddingBottom: 15,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        borderColor: "transparent",
    }
})