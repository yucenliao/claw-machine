"use client";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox, CameraControls, Environment, useGLTF, ContactShadows, PerspectiveCamera,
  axesHelper, KeyboardControls, useKeyboardControls, Box
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import gsap from "gsap";
import Swal from "sweetalert2";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";
import { bgm, winSound, failSound } from "@/lib/sound";

function ClawModel({ clawPos, isLowering, hasPrize }) {
  const clawModel = useGLTF(`claw.glb`);
  const clawModelRef = useRef();

  useFrame(() => {
    if (clawModelRef.current) {
      clawModelRef.current.traverse((child) => {
        if (child.name === "claw") {
          child.position.set(clawPos.x, clawPos.y, clawPos.z);
        }
        if (isLowering) return;
        if (child.name === "clawBase") {
          child.position.set(clawPos.x, clawPos.y + 0.15, clawPos.z);
        }
        if (child.name === "track") {
          child.position.set(0.011943, clawPos.y + 0.15, clawPos.z);
        }
        if (child.name === "bear") {
          child.visible = hasPrize;
        }
      });
    }
  });

  return (
    <primitive
      ref={clawModelRef}
      object={clawModel.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function Camera({ setClawPos, boxRef, clawPos, isLowering, setIsLowering, hasPrize, setHasPrize }) {
  const cameraRef = useRef();

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 1, 0);
    }
  });

  const [, getKeys] = useKeyboardControls();

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();
    const speed = 0.03;
    const limitX = 0.4;
    const limitZ = 0.4;

    if (boxRef.current) {
      if (!isLowering) {
        if (forward) setClawPos({ x: clawPos.x, y: clawPos.y, z: clawPos.z - speed });
        if (backward) setClawPos({ x: clawPos.x, y: clawPos.y, z: clawPos.z + speed });
        if (left) setClawPos({ x: clawPos.x - speed, y: clawPos.y, z: clawPos.z });
        if (right) setClawPos({ x: clawPos.x + speed, y: clawPos.y, z: clawPos.z });

        if (clawPos.x > limitX) setClawPos({ x: limitX, y: clawPos.y, z: clawPos.z });
        if (clawPos.x < -limitX) setClawPos({ x: -limitX, y: clawPos.y, z: clawPos.z });
        if (clawPos.z > limitZ) setClawPos({ x: clawPos.x, y: clawPos.y, z: limitZ });
        if (clawPos.z < -limitZ) setClawPos({ x: clawPos.x, y: clawPos.y, z: -limitZ });

        if (jump) {
          setHasPrize(false);
          setIsLowering(true);
          const isWin = Math.random() < 0.5;
          setHasPrize(isWin);

          gsap.timeline().to(clawPos, { y: 2, duration: 2 })
            .to(clawPos, { y: 2.7, duration: 3 })
            .then(() => {
              setIsLowering(false);
              if (isWin) {
                winSound.play();
                Swal.fire({ title: "抓到啦", text: "恭喜你夾到可愛熊熊🧸", icon: "success", confirmButtonText: "再玩一次" });
              } else {
                failSound.play();
                Swal.fire({ title: "差一點！", text: "離成功越來越近囉～加油", icon: "error", confirmButtonText: "再試一次" });
              }
            });
        }
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1, 3]} />;
}

export default function Home() {
  const boxRef = useRef();
  const isHidden = true;
  const [clawPos, setClawPos] = useState({ x: -0.4, y: 2.7, z: 0.2 });
  const [isLowering, setIsLowering] = useState(false);
  const [hasPrize, setHasPrize] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const [isMusicOn, setIsMusicOn] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isMusicOn) {
      bgm.play();
    } else {
      bgm.pause();
    }
    return () => {
      bgm.stop();
    };
  }, [user, isMusicOn]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("❌ 登入失敗", err);
    }
  };

  if (loading) return <div className="text-white p-10">載入中...</div>;
  if (!user) {
    return (
      <div className="w-full h-screen relative text-white">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl mb-4">請先登入才能開始夾娃娃</h2>
          <button onClick={handleLogin} className="border-white border px-4 py-2 rounded">
            使用 Google 登入
          </button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsMusicOn((prev) => !prev)}
            className="bg-white text-gray-600 px-3 py-1 rounded shadow"
          >
            🎵  {isMusicOn ? "Sound On" : "Sound Off"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-4 text-white z-10">嗨 {user.displayName}！</div>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsMusicOn((prev) => !prev)}
          className="bg-white text-gray-600 px-3 py-1 rounded shadow"
        >
          🎵  {isMusicOn ? "Sound On" : "Sound Off"}
        </button>
      </div>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
        ]}
      >
        <Canvas>
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

          {!isHidden && (
            <RoundedBox args={[1, 1, 1]} radius={0.05} smoothness={4} bevelSegments={4} creaseAngle={0.4}>
              <meshPhongMaterial color="#f3f3f3" />
            </RoundedBox>
          )}

          <Box ref={boxRef} args={[0.1, 0.1, 0.1]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#f3f3f3" />
          </Box>

          <Suspense fallback={null}>
            <ClawModel clawPos={clawPos} isLowering={isLowering} hasPrize={hasPrize} />
          </Suspense>

          <Environment
            background={true}
            backgroundBlurriness={0.2}
            backgroundIntensity={1.5}
            environmentIntensity={1.5}
            preset={"dawn"}
          />

          <ContactShadows opacity={1} scale={10} blur={10} far={10} resolution={256} color="#DDDDDD" />

          <Camera
            boxRef={boxRef}
            clawPos={clawPos}
            setClawPos={setClawPos}
            isLowering={isLowering}
            setIsLowering={setIsLowering}
            hasPrize={hasPrize}
            setHasPrize={setHasPrize}
          />
          <CameraControls enablePan={false} enableZoom={false} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
