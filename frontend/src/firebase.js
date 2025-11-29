// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcvwdbGL7w8vmnZ2lEn71QlzfbJMmALqQ",
    authDomain: "mumbaihacks-742ca.firebaseapp.com",
    projectId: "mumbaihacks-742ca",
    storageBucket: "mumbaihacks-742ca.firebasestorage.app",
    messagingSenderId: "927022498918",
    appId: "1:927022498918:web:619db3deb312f601c699a7",
    measurementId: "G-Q9JVJ8GZE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

// Sign Out
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Auth State Observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };