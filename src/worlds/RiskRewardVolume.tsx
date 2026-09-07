import { useState } from "react";
import { Text } from "@react-three/drei";
import type { TradeDraft, TradeMath } from "./tradeMath";
import { PRICE_MAX, PRICE_MIN, priceForY, roundPrice, yForPrice } from "./chartScale";
import { useYDrag } from "./useYDrag";

type Props = {
  draft: TradeDraft;
  math: TradeMath;
  onPrice: (key: "entry" | "stop" | "target", price: number) => void;
};

function skipRaycast() {}

function LevelHandle({
  y,
  color,
  label,
  onY,
}: {
  y: number;
  color: string;
  label: string;
  onY: (worldY: number) => void;
}) {
  const { begin } = useYDrag(onY);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, hovered ? 0.05 : 0.032, 10, 40]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.25 : 0.72}
          roughness={0.28}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "ns-resize";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          begin();
        }}
      >
        <boxGeometry args={[1.55, 0.18, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Text
        position={[0.72, 0.02, 0.12]}
        fontSize={0.095}
        color={color}
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#031016"
      >
        {label}
      </Text>
    </group>
  );
}

export function RiskRewardVolume({ draft, math, onPrice }: Props) {
  const yEntry = yForPrice(draft.entry);
  const yStop = yForPrice(draft.stop);
  const yTarget = yForPrice(draft.target);
  const riskH = Math.max(0.07, Math.abs(yEntry - yStop));
  const rewardH = Math.max(0.07, Math.abs(yEntry - yTarget));
  const rewardW = 0.7 * Math.min(2.15, Math.max(0.55, math.rr / 1.85));
  const rewardD = 0.42 * Math.min(3.1, Math.max(0.55, math.rr / 1.55));

  return (
    <group position={[0, 0, -0.15]}>
      <mesh position={[0, 1.42, 0]} raycast={skipRaycast}>
        <boxGeometry args={[1.55, 2.55, 1.05]} />
        <meshStandardMaterial
          color="#7ec8d4"
          transparent
          opacity={0.055}
          roughness={0.12}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = yForPrice(PRICE_MIN + t * (PRICE_MAX - PRICE_MIN));
        return (
          <mesh key={t} position={[0, y, 0]} raycast={skipRaycast}>
            <boxGeometry args={[1.28, 0.008, 0.82]} />
            <meshStandardMaterial color="#1c3d46" transparent opacity={0.55} />
          </mesh>
        );
      })}
      <mesh position={[0, (yEntry + yStop) / 2, 0.08]}>
        <boxGeometry args={[0.62, riskH, 0.4]} />
        <meshStandardMaterial
          color="#ff5c6a"
          emissive="#ff5c6a"
          emissiveIntensity={0.38}
          transparent
          opacity={0.55}
          roughness={0.32}
          metalness={0.08}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.08, (yEntry + yTarget) / 2, -0.06]}>
        <boxGeometry args={[rewardW, rewardH, rewardD]} />
        <meshStandardMaterial
          color="#3ee0a0"
          emissive="#3ee0a0"
          emissiveIntensity={0.42}
          transparent
          opacity={0.5}
          roughness={0.28}
          metalness={0.08}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, yEntry, 0]}>
        <boxGeometry args={[1.22, 0.025, 0.78]} />
        <meshStandardMaterial
          color="#ff8a3d"
          emissive="#ff8a3d"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <LevelHandle
        y={yTarget}
        color="#3ee0a0"
        label={`TP ${draft.target.toFixed(1)}`}
        onY={(y) => onPrice("target", roundPrice(priceForY(y)))}
      />
      <LevelHandle
        y={yEntry}
        color="#ff8a3d"
        label={`EN ${draft.entry.toFixed(1)}`}
        onY={(y) => onPrice("entry", roundPrice(priceForY(y)))}
      />
      <LevelHandle
        y={yStop}
        color="#ff5c6a"
        label={`SL ${draft.stop.toFixed(1)}`}
        onY={(y) => onPrice("stop", roundPrice(priceForY(y)))}
      />
      <Text
        position={[-0.02, (yEntry + yStop) / 2, 0.32]}
        fontSize={0.08}
        color="#ffb3ba"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
      >
        risk
      </Text>
      <Text
        position={[0.08, (yEntry + yTarget) / 2, rewardD / 2 + 0.12]}
        fontSize={0.08}
        color="#b8ffe0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
      >
        reward
      </Text>
    </group>
  );
}
