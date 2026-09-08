import { useLayoutEffect, useRef } from "react";
import { CameraControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type CameraControlsImpl from "camera-controls";
import { skipRaycast } from "../lib/skipRaycast";
import { PokerCraft } from "../scene/PokerCraft";

function FitCamera() {
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    camera.near = 0.12;
    camera.far = 26;
    camera.updateProjectionMatrix();
    return () => {
      camera.near = 0.1;
      camera.far = 80;
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  return null;
}

function FeltCamera({ reduceMotion }: { reduceMotion: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const idle = useRef(true);

  useLayoutEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    void rig.setLookAt(2.6, 1.7, 3.4, 0.08, 0.95, 0.12, false);
    const stopIdle = () => {
      idle.current = false;
    };
    rig.addEventListener("controlstart", stopIdle);
    const timer = window.setTimeout(stopIdle, 1800);
    return () => {
      rig.removeEventListener("controlstart", stopIdle);
      window.clearTimeout(timer);
    };
  }, []);

  useFrame((_, delta) => {
    const rig = controls.current;
    if (!rig || reduceMotion || !idle.current) return;
    rig.azimuthAngle += delta * 0.08;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.4}
      maxDistance={10}
      minPolarAngle={0.38}
      maxPolarAngle={Math.PI / 2.08}
      smoothTime={0.42}
      draggingSmoothTime={0.18}
    />
  );
}

function Rail() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <torusGeometry args={[2.85, 0.14, 10, 48]} />
        <meshStandardMaterial color="#3a2418" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <torusGeometry args={[2.85, 0.05, 8, 48]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.28} />
      </mesh>
    </group>
  );
}

type Props = {
  reduceMotion: boolean;
};

export function PokerScene({ reduceMotion }: Props) {
  return (
    <>
      <color attach="background" args={["#06140e"]} />
      <fog attach="fog" args={["#06140e", 7, 20]} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#8ee0b0", "#06140e", 0.32]} />
      <directionalLight position={[3.2, 4.8, 3.8]} intensity={1.05} color="#fff1dd" />
      <pointLight position={[1.2, 2.6, 2.0]} intensity={1.2} distance={6} color="#ffe0c0" />
      <pointLight position={[-1.4, 2.2, 1.2]} intensity={0.5} distance={6} color="#7ee0a8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <circleGeometry args={[6.4, 32]} />
        <meshStandardMaterial color="#0c2218" roughness={0.92} metalness={0.06} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={skipRaycast}>
        <circleGeometry args={[2.72, 32]} />
        <meshStandardMaterial color="#145c3a" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} raycast={skipRaycast}>
        <ringGeometry args={[5.15, 5.38, 48]} />
        <meshStandardMaterial
          color="#7ee0a8"
          emissive="#7ee0a8"
          emissiveIntensity={0.28}
          toneMapped={false}
        />
      </mesh>
      <Rail />

      <group position={[0, 0.95, 0]} rotation={[0, -0.5, 0]} scale={2.7}>
        <PokerCraft color="#7ee0a8" luminosity={0.7} active lit glow={false} detail="table" />
      </group>

      <Text
        position={[0, 2.92, 0.2]}
        fontSize={0.22}
        color="#e8f6ea"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={0.008}
        outlineColor="#06140e"
        raycast={skipRaycast}
      >
        OPEN THE HAND
      </Text>
      <Text
        position={[0, 2.68, 0.2]}
        fontSize={0.09}
        color="#7ee0a8"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#06140e"
        raycast={skipRaycast}
      >
        ACE–KING OF SPADES · TWO CHIPS · ORBIT THE FELT
      </Text>

      <FitCamera />
      <FeltCamera reduceMotion={reduceMotion} />
    </>
  );
}
