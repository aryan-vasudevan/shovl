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

export default function Profile() {
    return (
        <View style={styles.container}>
           <Text style={styles.text}>jfkldsjf</Text>
            <BottomBar />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: "#FFFFFF",
    }
})