import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBodxgvRD3CtvpoGjMtaNen50LGJBTg8Qw",
  authDomain: "pickmytrain.firebaseapp.com",
  projectId: "pickmytrain",
  storageBucket: "pickmytrain.firebasestorage.app",
  messagingSenderId: "530944920244",
  appId: "1:530944920244:web:deade7039b04f4757565e1",
  measurementId: "G-R8BZ402K8X",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export const sendOTPFn = httpsCallable(functions, "sendOTP");
export const verifyOTPFn = httpsCallable(functions, "verifyOTP");
