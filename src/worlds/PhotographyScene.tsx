import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { CameraControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type CameraControlsImpl from "camera-controls";
import { skipRaycast } from "../lib/skipRaycast";
import { CameraCraft } from "../scene/CameraCraft";
import {
  ApertureControl,
  fStopToIris,
  HangingPrint,
  PRINTS,
} from "./PhotographyStudio";

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

function StudioCamera({ reduceMotion }: { reduceMotion: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const idle = useRef(true);

  useLayoutEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    void rig.setLookAt(3.6, 2.15, 5.2, 0.15, 1.05, 0.2, false);
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
      minDistance={3.4}
      maxDistance={11}
      minPolarAngle={0.38}
      maxPolarAngle={Math.PI / 2.08}
      smoothTime={0.42}
      draggingSmoothTime={0.18}
    />
  );
}

function Enlarger() {
  return (
    <group position={[-3.6, 0, -2.6]} rotation={[0, 0.4, 0]}>
      <mesh position={[0, 0.35, 0]} raycast={skipRaycast}>
        <boxGeometry args={[1.1, 0.12, 0.9]} />
        <meshStandardMaterial color="#1a1210" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#3a2a24" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.85, 0.15]} raycast={skipRaycast}>
        <boxGeometry args={[0.55, 0.35, 0.7]} />
        <meshStandardMaterial color="#2a1c18" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.55, 0.15]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.12, 0.16, 0.28, 12]} />
        <meshStandardMaterial color="#4a3830" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 1.4, 0.2]} intensity={0.35} distance={2.4} color="#ff6a3a" />
    </group>
  );
}

type Props = {
  reduceMotion: boolean;
};

export function PhotographyScene({ reduceMotion }: Props) {
  const [fStop, setFStop] = useState(2.8);
  const [printId, setPrintId] = useState<string | null>(null);
  const iris = fStopToIris(fStop);
  const exposure = (2.8 / fStop) * (2.8 / fStop);

  const onPrint = useCallback((id: string) => {
    setPrintId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <>
      <color attach="background" args={["#12080a"]} />
      <fog attach="fog" args={["#12080a", 7, 20]} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#c45a3a", "#12080a", 0.28]} />
      <directionalLight position={[4.5, 6.5, 3.5]} intensity={0.55} color="#f0d2b4" />
      <pointLight position={[0.6, 3.2, 1.2]} intensity={0.7} distance={8} color="#ff5a32" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <circleGeometry args={[6.4, 32]} />
        <meshStandardMaterial color="#1a0e0c" roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={skipRaycast}>
        <ringGeometry args={[5.15, 5.38, 48]} />
        <meshStandardMaterial
          color="#c41e3a"
          emissive="#c41e3a"
          emissiveIntensity={0.32}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.28, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.62, 0.72, 0.52, 24]} />
        <meshStandardMaterial color="#2a1c16" metalness={0.45} roughness={0.4} />
      </mesh>

      <group position={[0, 0.92, 0]} rotation={[0, -0.55, 0]} scale={2.15}>
        <CameraCraft
          color="#d8c2a4"
          luminosity={0.7}
          active
          lit
          glow={false}
          detail="studio"
          iris={iris}
        />
      </group>

      <Text
        position={[0, 2.92, 0.2]}
        fontSize={0.22}
        color="#f2e4d8"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={0.008}
        outlineColor="#12080a"
        raycast={skipRaycast}
      >
        OPEN THE FRAME
      </Text>
      <Text
        position={[0, 2.68, 0.2]}
        fontSize={0.09}
        color="#c41e3a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#12080a"
        raycast={skipRaycast}
      >
        DRAG THE IRIS · CLICK A PRINT · ORBIT THE STUDIO
      </Text>

      <ApertureControl fStop={fStop} y0={0.7} y1={2.15} position={[1.55, 0, 0.55]} onChange={setFStop} />
      {PRINTS.map((spec) => (
        <HangingPrint
          key={spec.id}
          spec={spec}
          selected={printId === spec.id}
          exposure={exposure}
          onSelect={onPrint}
        />
      ))}
      <Enlarger />
      <FitCamera />
      <StudioCamera reduceMotion={reduceMotion} />
    </>
  );
}
