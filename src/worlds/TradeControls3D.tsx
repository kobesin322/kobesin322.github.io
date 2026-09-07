import { useState } from "react";
import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { skipRaycast } from "../lib/skipRaycast";
import type { TradeDraft, TradeMath } from "./tradeMath";
import { lockOrbit, useYDrag } from "./useYDrag";

type KnobProps = {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  y0: number;
  y1: number;
  position: [number, number, number];
  color: string;
  onChange: (value: number) => void;
  nudge: number;
};

function yToValue(y: number, y0: number, y1: number, min: number, max: number) {
  const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  return min + t * (max - min);
}

function valueToY(value: number, y0: number, y1: number, min: number, max: number) {
  const t = (value - min) / (max - min);
  return y0 + t * (y1 - y0);
}

function Nudge({
  position,
  label,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  onClick: () => void;
}) {
  const { controls } = useThree();
  const [hot, setHot] = useState(false);
  return (
    <group position={position}>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHot(true);
          lockOrbit(controls, false);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "auto";
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          lockOrbit(controls, false);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          lockOrbit(controls, true);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <boxGeometry args={[0.28, 0.16, 0.18]} />
        <meshStandardMaterial
          color={hot ? "#16343c" : "#0c2228"}
          emissive="#7ec8d4"
          emissiveIntensity={hot ? 0.35 : 0.08}
          roughness={0.4}
        />
      </mesh>
      <Text position={[0, 0, 0.1]} fontSize={0.11} color="#d8ecef" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function RailKnob({
  label,
  display,
  value,
  min,
  max,
  y0,
  y1,
  position,
  color,
  onChange,
  nudge,
}: KnobProps) {
  const y = valueToY(value, y0, y1, min, max);
  const { begin, dragging } = useYDrag((worldY) => {
    onChange(yToValue(worldY, y0, y1, min, max));
  });
  const { controls } = useThree();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh position={[0, (y0 + y1) / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, y1 - y0, 12]} />
        <meshStandardMaterial color="#1a3a44" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh
        position={[0, y, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          lockOrbit(controls, false);
          document.body.style.cursor = "ns-resize";
        }}
        onPointerOut={() => {
          setHovered(false);
          if (!dragging.current) lockOrbit(controls, true);
          document.body.style.cursor = "auto";
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          lockOrbit(controls, false);
          begin(y);
        }}
      >
        <sphereGeometry args={[hovered ? 0.16 : 0.14, 20, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.1 : 0.7}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
      <Nudge
        position={[0, y1 + 0.22, 0]}
        label="+"
        onClick={() => onChange(Math.min(max, value + nudge))}
      />
      <Nudge
        position={[0, y0 - 0.22, 0]}
        label="−"
        onClick={() => onChange(Math.max(min, value - nudge))}
      />
      <Text
        position={[0, y1 + 0.48, 0]}
        fontSize={0.09}
        color="#8aa0aa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor="#031016"
      >
        {label}
      </Text>
        <Text
          position={[0, y1 + 0.34, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
      >
        {display}
      </Text>
    </group>
  );
}

function StatCard({
  label,
  value,
  color,
  position,
}: {
  label: string;
  value: string;
  color: string;
  position: [number, number, number];
}) {
  return (
    <Billboard follow position={position}>
      <mesh raycast={skipRaycast}>
        <boxGeometry args={[1.15, 0.52, 0.07]} />
        <meshStandardMaterial
          color="#071820"
          emissive={color}
          emissiveIntensity={0.08}
          metalness={0.25}
          roughness={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>
      <Text
        position={[0, 0.12, 0.045]}
        fontSize={0.075}
        color="#8aa0aa"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.08, 0.045]}
        fontSize={0.16}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#031016"
      >
        {value}
      </Text>
    </Billboard>
  );
}

type Props = {
  draft: TradeDraft;
  math: TradeMath;
  onDraft: (patch: Partial<TradeDraft>) => void;
};

export function TradeControls3D({ draft, math, onDraft }: Props) {
  return (
    <>
      <RailKnob
        label="EQUITY"
        display={draft.equity.toFixed(0)}
        value={draft.equity}
        min={5000}
        max={80000}
        y0={0.55}
        y1={2.15}
        position={[-2.45, 0, 0.55]}
        color="#7ec8d4"
        nudge={1000}
        onChange={(value) => onDraft({ equity: Math.round(value / 100) * 100 })}
      />
      <RailKnob
        label="RISK %"
        display={draft.riskPct.toFixed(1)}
        value={draft.riskPct}
        min={0.1}
        max={3}
        y0={0.55}
        y1={2.15}
        position={[2.45, 0, 0.55]}
        color="#ff8a3d"
        nudge={0.1}
        onChange={(value) => onDraft({ riskPct: Math.round(value * 10) / 10 })}
      />
      <StatCard
        label="SIDE"
        value={math.side}
        color="#eceadf"
        position={[-2.35, 1.55, 1.55]}
      />
      <StatCard
        label="R : R"
        value={`1 : ${math.rr.toFixed(2)}`}
        color="#3ee0a0"
        position={[-2.35, 0.9, 1.55]}
      />
      <StatCard
        label="RISK $"
        value={`$${math.riskDollars.toFixed(0)}`}
        color="#ff5c6a"
        position={[-2.35, 0.25, 1.55]}
      />
      <StatCard
        label="REWARD $"
        value={`$${math.rewardDollars.toFixed(0)}`}
        color="#3ee0a0"
        position={[3.15, 1.22, 1.45]}
      />
      <StatCard
        label="SIZE"
        value={math.qty.toFixed(0)}
        color="#ff8a3d"
        position={[3.15, 0.57, 1.45]}
      />
    </>
  );
}
