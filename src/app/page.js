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
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { bgm, winSound, failSound } from "@/lib/sound";
import { SoundOutlined, AudioMutedOutlined } from "@ant-design/icons";


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

function Camera({ setClawPos, boxRef, clawPos, isLowering, setIsLowering, hasPrize, setHasPrize,  prizeType, setPrizeType }) {
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
          setPrizeType(null); // 重置
        
          const rand = Math.random();
          let type = null;
          if (rand < 0.4) {
            type = "rare";
          } else if (rand < 0.7) {
            type = "common";
          } else {
            type = null; // 沒中獎
          }
        
          const isWin = type !== null;
          setHasPrize(isWin);
          setPrizeType(type);

          gsap.timeline().to(clawPos, { y: 2, duration: 2 })
            .to(clawPos, { y: 2.7, duration: 3 })
            .then(() => {
              setIsLowering(false);
              if (type === "rare") {
                winSound.play();
                Swal.fire({
                  imageUrl: '/win-icon.png', // ✅ 妳的圖片路徑
                  imageWidth: 250,
                  imageAlt: 'Rare',
                  html: `
                    <div class="swal-fail-text animate-shake text-[20px] font-medium">
                    恭喜中獎
                    </div>
                    <div class="swal-win-text animate-bounce-in text-[16px] mt-0.5">
                      夾到特級稀有種了
                    </div>
                  `,
                  confirmButtonText: '再玩一次',
                  confirmButtonColor: '#f67b6a',
                  width: 400,
                  customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'swal2-confirm-custom',
                  },
                  didOpen: () => {
                    const popup = document.querySelector('.swal2-popup');
                    const img = popup?.querySelector('img');
                    if (popup) popup.style.borderRadius = '24px';
                    if (img) {
                      img.style.marginTop = '-5px';
                      img.style.marginBottom = '-40px'; 
                      img.classList.add('animate-pulse-scale'); // ✅ 圖片動畫
                    }
                  },
                });

              } else if (type === "common") {
                winSound.play();
                Swal.fire({
                  imageUrl: '/common-prize.png', // ✅ 妳的圖片路徑
                  imageWidth: 175,
                  imageAlt: 'common',
                  html: `
                    <div class="swal-fail-text animate-shake text-[20px] font-medium">
                     恭喜中獎
                    </div>
                    <div class="swal-win-text animate-bounce-in text-[16px] mt-0.5">
                     獲得能量寶石一枚
                    </div>
                  `,
                  confirmButtonText: '再玩一次',
                  confirmButtonColor: '#f67b6a',
                  width: 400,
                  customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'swal2-confirm-custom',
                  },
                  didOpen: () => {
                    const popup = document.querySelector('.swal2-popup');
                    const img = popup?.querySelector('img');
                    if (popup) popup.style.borderRadius = '24px';
                    if (img) {
                      img.style.marginTop = '5px';
                      img.style.marginBottom = '-10px'; 
                      img.classList.add('animate-pulse-scale'); // ✅ 圖片動畫
                    }
                  },
                });  

              } else {
                failSound.play();
                Swal.fire({
                  imageUrl: '/fail-icon.png',
                  imageWidth: 190,
                  imageAlt: 'Fail',
                  html: `
                    <div class="swal-fail-text animate-shake text-[20px] font-medium">
                    再接再厲
                    </div>
                    <div class="swal-fail-text animate-shake text-[16px] mt-0.5">
                      差一點就夾到了!
                    </div>
                  `,
                  confirmButtonText: '再試一次',
                  confirmButtonColor: '#f67b6a',
                  width: 400,
                  customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'swal2-confirm-custom',
                  },
                  didOpen: () => {
                    const popup = document.querySelector('.swal2-popup');
                    const img = popup?.querySelector('img');
                    if (popup) popup.style.borderRadius = '24px';
                    if (img) {
                      img.style.marginTop = '12px';
                      img.style.marginBottom = '-10px'; 
                      img.classList.add('animate-bounce-down'); // ✅ 另一種動畫
                    }
                  },
                });                
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
  const [prizeType, setPrizeType] = useState(null);

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
          <h2 className="text-xl mb-4">登入才能開始玩遊戲哦</h2>
          <button onClick={handleLogin} className="border-white border px-4 py-2 rounded">
            使用 Google 登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {/* 使用 flex 將 Hi 與按鈕們並排，gap 控制間距 */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-4">
        <div className="text-white font-medium text-sm sm:text-base whitespace-nowrap">
          Hi!! {user.displayName}
        </div>
  
        <button
          onClick={() => {
            Swal.fire({
              imageUrl: '/logout-icon.png',
              imageWidth: 150,
              imageAlt: 'Logout Icon',
              html: `
                <div style="margin-top: -8px; margin-bottom: 8px; font-size: 18px; line-height: 1.7; color: #444;">
                  <p style="font-weight: 500;">確定要登出遊戲嗎？</p>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: '登出',
              cancelButtonText: '取消',
              confirmButtonColor: '#f67b6a',
              cancelButtonColor: '#c2b4b6',
              width: 300,
              customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
              },
              didOpen: () => {
                const popup = document.querySelector('.swal2-popup');
                const img = popup?.querySelector('img');
                if (popup) popup.style.borderRadius = '24px';
                if (img) img.style.marginTop = '8px';
              }
            }).then((result) => {
              if (result.isConfirmed) {
                const auth = getAuth();
                signOut(auth);
              }
            });
          }}
          className="bg-white text-[#f67b6a] font-semibold border border-[#f67b6a] px-4 py-2 rounded-full shadow text-sm hover:bg-[#fbeae8] active:scale-95 transition-all duration-300"
        >
          Sign Out
        </button>
  
        <button
          onClick={() => setIsMusicOn((prev) => !prev)}
          className="bg-white text-[#f67b6a] font-semibold border border-[#f67b6a] px-4 py-2 rounded-full shadow text-sm hover:bg-[#fbeae8] active:scale-95 transition-all duration-300 flex items-center gap-2"
        >
          {isMusicOn ? <SoundOutlined style={{ fontSize: '18px' }} /> : <AudioMutedOutlined style={{ fontSize: '18px' }} />}
          {isMusicOn ? "Sound On" : "Sound Off"}
        </button>

      </div>
  
      {/* 遊戲規則按鈕置於右下角 */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={() => {
            Swal.fire({
              imageUrl: '/game-help.png',
              imageWidth: 180,
              imageAlt: 'Game Help',
              html: `
                <div style="margin-top: -20px; margin-bottom: 10px; font-size: 16px; text-align: center; line-height: 1.6;">
                  <p><strong>⬆</strong><span style="font-weight: 450;">：向前移動爪子</span></p>
                  <p><strong>⬇</strong><span style="font-weight: 450;">：向後移動爪子</span></p>
                  <p><strong>⬅</strong><span style="font-weight: 450;">：向左移動爪子</span></p>
                  <p><strong>⮕</strong><span style="font-weight: 450;">：向右移動爪子</span></p>
                  <p><strong>space</strong><span style="font-weight: 450;">：準備下爪！</span></p>
                </div>
                <div style="margin-top: 10px; margin-bottom: -8px; font-size: 16px; text-align: center; line-height: 1.6;">
                  <p><span style="font-weight: 500;">可以夾兩種獎品哦 ⸜(｡˃ ᵕ ˂ )⸝</span></p>
                </div>
              `,
              confirmButtonText: '學會了',
              confirmButtonColor: '#f67b6a',
              width: 320,
              didOpen: () => {
                const popup = document.querySelector('.swal2-popup');
                const img = popup?.querySelector('img');
                if (popup) popup.style.borderRadius = '24px';
                if (img) img.style.marginTop = '8px';
                if (img) img.style.marginBottom = '-12px';
              }
            });
          }}
          className="bg-[#f67b6a] text-white font-semibold border border-[#f67b6a] px-4 py-2 rounded-full shadow text-sm hover:bg-[#f88f7e] active:scale-95 transition-all duration-300"
        >
          遊戲規則+
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
            prizeType={prizeType}
            setPrizeType={setPrizeType} //
          />
          <CameraControls enablePan={false} enableZoom={false} />
        </Canvas>
      </KeyboardControls>
    </div>
  );  
}
