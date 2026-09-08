import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CameraControls, Html, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type CameraControlsImpl from "camera-controls";
import { skipRaycast } from "../lib/skipRaycast";
import { CandleField } from "./CandleField";
import { RiskRewardVolume } from "./RiskRewardVolume";
import { TradeControls3D } from "./TradeControls3D";
import { computeTrade, type TradeDraft } from "./tradeMath";

const initial: TradeDraft = {
  equity: 20000,
  riskPct: 0.5,
  entry: 184.2,
  stop: 181.8,
  target: 191.4,
};

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

function DeskCamera({ reduceMotion }: { reduceMotion: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const idle = useRef(true);

  useLayoutEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    void rig.setLookAt(4.2, 2.45, 5.8, 0.1, 1.15, 0, false);
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
    rig.azimuthAngle += delta * 0.1;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={3.6}
      maxDistance={11}
      minPolarAngle={0.38}
      maxPolarAngle={Math.PI / 2.08}
      smoothTime={0.42}
      draggingSmoothTime={0.18}
    />
  );
}

type Props = {
  reduceMotion: boolean;
  onOpenBacktest: () => void;
};

export function TradingScene({ reduceMotion, onOpenBacktest }: Props) {
  const [draft, setDraft] = useState<TradeDraft>(initial);
  const math = useMemo(() => computeTrade(draft), [draft]);

  const onDraft = useCallback((patch: Partial<TradeDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const onPrice = useCallback((key: "entry" | "stop" | "target", price: number) => {
    setDraft((prev) => ({ ...prev, [key]: price }));
  }, []);

  return (
    <>
      <color attach="background" args={["#041018"]} />
      <fog attach="fog" args={["#041018", 7, 20]} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#4aa8b8", "#041018", 0.32]} />
      <directionalLight position={[5, 7, 4]} intensity={0.5} color="#c5e8ee" />
      <pointLight position={[0, 2.4, 0.4]} intensity={1.05} distance={7} color="#ff8a3d" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <circleGeometry args={[6.4, 32]} />
        <meshStandardMaterial color="#062028" roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={skipRaycast}>
        <ringGeometry args={[5.15, 5.38, 48]} />
        <meshStandardMaterial
          color="#ff8a3d"
          emissive="#ff8a3d"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.1, 0.05]} raycast={skipRaycast}>
        <boxGeometry args={[4.4, 0.16, 2.6]} />
        <meshStandardMaterial color="#0a1c22" metalness={0.42} roughness={0.32} />
      </mesh>

      <Text
        position={[0, 2.92, 0.2]}
        fontSize={0.22}
        color="#e8f4f6"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={0.008}
        outlineColor="#031016"
        raycast={skipRaycast}
      >
        OPEN A TRADE
      </Text>
      <Text
        position={[0, 2.68, 0.2]}
        fontSize={0.09}
        color="#ff8a3d"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
        raycast={skipRaycast}
      >
        CLICK BACKTEST · DRAG THE LEVELS · ORBIT THE PIT
      </Text>

      <Html position={[0, 0.42, 1.42]} center zIndexRange={[40, 10]}>
        <button type="button" className="iris-chip bt-chip" onClick={onOpenBacktest}>
          Run backtest
        </button>
      </Html>

      <RiskRewardVolume draft={draft} math={math} onPrice={onPrice} />
      <TradeControls3D draft={draft} math={math} onDraft={onDraft} />
      <CandleField reduceMotion={reduceMotion} />
      <FitCamera />
      <DeskCamera reduceMotion={reduceMotion} />
    </>
  );
}
