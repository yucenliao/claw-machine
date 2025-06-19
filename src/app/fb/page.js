// Realtime Database 即時資料庫範例程式碼

"use client"

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useState, useEffect } from "react";

export default function FB() {

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

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ref 是指向你要上傳到的路徑，也可以想像成資料夾
    const dbRef = ref(database, "/");
  
    onValue(dbRef, (snapshot) => {
      // 偵測資料變動，會隨時取得最新資料
      const data = snapshot.val();
      setData(data);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });


  }, []);

  const uploadData = () => {
    // 將資料 push 到對應的 list 內
    const dbRef = ref(database, "/");
    push(dbRef, {
      name: "John",
      age: 30,
      time: Date.now()
    });

  }

  return (
    <div className="w-full h-screen">
      <h1>FB</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => {
        uploadData();
      }}>Set Data</button>
    </div>
  );
}
