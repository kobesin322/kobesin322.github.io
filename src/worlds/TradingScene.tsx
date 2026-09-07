import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CameraControls, ContactShadows, Grid, Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type CameraControlsImpl from "camera-controls";
import type { PointLight } from "three";
import { Effects } from "../scene/Effects";
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

function DeskCamera({ reduceMotion }: { reduceMotion: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const idle = useRef(true);

  useLayoutEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    void rig.setLookAt(4.2, 2.45, 5.8, 0.1, 1.15, 0, false);
    const onStart = () => {
      idle.current = false;
    };
    rig.addEventListener("controlstart", onStart);
    return () => rig.removeEventListener("controlstart", onStart);
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

function CausticLight() {
  const light = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime;
    light.current.position.x = Math.sin(t * 0.28) * 2.4;
    light.current.position.z = Math.cos(t * 0.22) * 1.6 - 0.4;
  });
  return <pointLight ref={light} position={[0, 3.2, 1]} intensity={1.15} distance={14} color="#7ec8d4" />;
}

type Props = {
  reduceMotion: boolean;
};

export function TradingScene({ reduceMotion }: Props) {
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
      <fog attach="fog" args={["#041018", 8, 26]} />
      <ambientLight intensity={0.16} />
      <hemisphereLight args={["#4aa8b8", "#041018", 0.38]} />
      <directionalLight position={[5, 7, 4]} intensity={0.55} color="#c5e8ee" />
      <pointLight position={[0, 2.4, 0.4]} intensity={1.2} distance={8} color="#ff8a3d" />
      <pointLight position={[-2.2, 1.6, 1.2]} intensity={0.7} distance={7} color="#3ee0a0" />
      <CausticLight />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[7.2, 64]} />
        <meshStandardMaterial color="#062028" roughness={0.92} metalness={0.08} />
      </mesh>
      <Grid
        position={[0, 0.012, 0]}
        args={[16, 16]}
        cellSize={0.45}
        cellThickness={0.6}
        cellColor="#0a3a44"
        sectionSize={2.25}
        sectionThickness={1.1}
        sectionColor="#174a55"
        fadeDistance={16}
        fadeStrength={1.2}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[5.15, 5.42, 72]} />
        <meshStandardMaterial
          color="#ff8a3d"
          emissive="#ff8a3d"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.1, 0.05]}>
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
      >
        DRAG THE LEVELS · ORBIT THE PIT
      </Text>

      <RiskRewardVolume draft={draft} math={math} onPrice={onPrice} />
      <TradeControls3D draft={draft} math={math} onDraft={onDraft} />
      <CandleField reduceMotion={reduceMotion} />
      <Sparkles count={48} scale={[14, 6, 12]} size={2.2} speed={0.22} color="#7ec8d4" opacity={0.42} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={14} blur={2.4} far={5} />
      <DeskCamera reduceMotion={reduceMotion} />
      <Effects />
    </>
  );
}
