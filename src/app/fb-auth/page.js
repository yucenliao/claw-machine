// google 登入範例程式碼
// 別忘記到 auth 頁面新增服務提供商

"use client"
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { useState, useEffect } from "react";


export default function FBAuth() {

  const firebaseConfig = {
    apiKey: "AIzaSyAA6QCpqlI1bjCfOkXlccsDBmgMPr5hGCg",
    authDomain: "claw-machine-main.firebaseapp.com",
    databaseURL: "https://claw-machine-main-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "claw-machine-main",
    storageBucket: "claw-machine-main.firebasestorage.app",
    messagingSenderId: "723312333526",
    appId: "1:723312333526:web:8b865c0ecd3f090effaf77",
    measurementId: "G-JBT3QL9TMC"
  };

  //判斷 app 是否已經初始化過，有初始化過就使用該 app
  const app = initializeApp(firebaseConfig, "fb-auth");
  

  const provider = new GoogleAuthProvider();
  // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

  const [user, setUser] = useState(null);

  const auth = getAuth(app);
  auth.useDeviceLanguage();


  const signIn = () => {
    signInWithPopup(auth, provider).then((result) => {
      console.log(result);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user, token, credential);
      setUser(user);
    }).catch((error) => {
      console.log(error);
    });
  }
  
  
  return (
    <div className="w-full h-screen">
      <h1>FB Auth</h1>
      <h3>User: {user?.displayName}</h3>
      <button onClick={() => {
        signIn();
      }}>Sign In</button>
    </div>
  );
}
