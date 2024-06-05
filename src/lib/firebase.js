import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-bbe02.firebaseapp.com",
  projectId: "reactchat-bbe02",
  storageBucket: "reactchat-bbe02.appspot.com",
  messagingSenderId: "1039347299299",
  appId: "1:1039347299299:web:80ba9961f28f4afc94e6d6",
  measurementId: "G-6ZGP9SZP0D",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
