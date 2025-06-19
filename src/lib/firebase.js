// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAA6QCpqlI1bjCfOkXlccsDBmgMPr5hGCg",
  authDomain: "claw-machine-main.firebaseapp.com",
  projectId: "claw-machine-main",
  storageBucket: "claw-machine-main.appspot.com",
  messagingSenderId: "723312333526",
  appId: "1:723312333526:web:8b865c0ecd3f090effaf77",
  databaseURL: "https://claw-machine-main-default-rtdb.asia-southeast1.firebasedatabase.app/",
  measurementId: "G-JBT3QL9TMC"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
