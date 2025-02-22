import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD5cyl6S1_So7DzwjZDX9Dz_43IdhsGvuc",
    authDomain: "shovlapp.firebaseapp.com",
    projectId: "shovlapp",
    storageBucket: "shovlapp.firebasestorage.app",
    messagingSenderId: "1067084982972",
    appId: "1:1067084982972:web:025ef1365d8f20b98dfeb9",
    measurementId: "G-LFJS8E451F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };