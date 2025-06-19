// Realtime Database 即時資料庫範例程式碼

"use client";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { useState, useEffect } from "react";

export default function FB() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [database, setDatabase] = useState(null);

  useEffect(() => {
    // ✅ 安全地初始化 Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyAA6QCpqlI1bjCfOkXlccsDBmgMPr5hGCg",
      authDomain: "claw-machine-main.firebaseapp.com",
      databaseURL: "https://claw-machine-main-default-rtdb.asia-southeast1.firebasedatabase.app/",
      projectId: "claw-machine-main",
      storageBucket: "claw-machine-main.appspot.com",
      messagingSenderId: "723312333526",
      appId: "1:723312333526:web:8b865c0ecd3f090effaf77",
      measurementId: "G-JBT3QL9TMC"
    };

    // 避免重複初始化
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getDatabase(app);
    setDatabase(db);

    const dbRef = ref(db, "/");
    onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );
  }, []);

  const uploadData = () => {
    if (!database) return;
    const dbRef = ref(database, "/");
    push(dbRef, {
      name: "John",
      age: 30,
      time: Date.now()
    });
  };

  return (
    <div className="w-full h-screen p-6 text-white">
      <h1 className="text-xl mb-2">📦 Firebase Data</h1>
      {loading ? (
        <p>載入中...</p>
      ) : error ? (
        <p>錯誤：{error.message}</p>
      ) : (
        <pre className="bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      <button
        onClick={uploadData}
        className="mt-4 bg-white text-[#f67b6a] font-semibold border border-[#f67b6a] px-4 py-2 rounded shadow text-sm hover:bg-[#fbeae8] active:scale-95 transition-all duration-300"
      >
        新增資料
      </button>
    </div>
  );
}

