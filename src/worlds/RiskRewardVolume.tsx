import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useState } from "react";
import type { TradeDraft, TradeMath } from "./tradeMath";
import { PRICE_MAX, PRICE_MIN, priceForY, roundPrice, yForPrice } from "./chartScale";
import { lockOrbit, useYDrag } from "./useYDrag";

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
  const { begin, dragging } = useYDrag(onY);
  const { controls } = useThree();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <torusGeometry args={[0.5, 0.028, 10, 40]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.28}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.018, 0.018, 0.44, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <Billboard position={[1.08, 0, 0]} follow>
        <mesh
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
          <circleGeometry args={[hovered ? 0.2 : 0.175, 28]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1.35 : 0.9}
            roughness={0.22}
            toneMapped={false}
          />
        </mesh>
        <mesh raycast={skipRaycast}>
          <ringGeometry args={[0.175, 0.22, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <Text
          position={[0.36, 0, 0]}
          fontSize={0.1}
          color={color}
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#031016"
          raycast={skipRaycast}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

export function RiskRewardVolume({ draft, math, onPrice }: Props) {
  const yEntry = yForPrice(draft.entry);
  const yStop = yForPrice(draft.stop);
  const yTarget = yForPrice(draft.target);
  const riskH = Math.max(0.07, Math.abs(yEntry - yStop));
  const rewardH = Math.max(0.07, Math.abs(yEntry - yTarget));
  const rewardD = 0.38 * Math.min(3.4, Math.max(0.7, math.rr / 1.45));

  return (
    <group position={[0, 0, -0.15]}>
      <mesh position={[0, 1.42, 0]} raycast={skipRaycast}>
        <boxGeometry args={[1.55, 2.55, 1.15]} />
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
            <boxGeometry args={[1.12, 0.008, 0.82]} />
            <meshStandardMaterial color="#1c3d46" transparent opacity={0.55} />
          </mesh>
        );
      })}
      <mesh position={[0, (yEntry + yStop) / 2, 0.08]} raycast={skipRaycast}>
        <boxGeometry args={[0.58, riskH, 0.38]} />
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
      <mesh position={[0, (yEntry + yTarget) / 2, -0.04]} raycast={skipRaycast}>
        <boxGeometry args={[0.72, rewardH, rewardD]} />
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
      <mesh position={[0, yEntry, 0]} raycast={skipRaycast}>
        <boxGeometry args={[1.12, 0.025, 0.78]} />
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
        onY={(worldY) => onPrice("target", roundPrice(priceForY(worldY)))}
      />
      <LevelHandle
        y={yEntry}
        color="#ff8a3d"
        label={`EN ${draft.entry.toFixed(1)}`}
        onY={(worldY) => onPrice("entry", roundPrice(priceForY(worldY)))}
      />
      <LevelHandle
        y={yStop}
        color="#ff5c6a"
        label={`SL ${draft.stop.toFixed(1)}`}
        onY={(worldY) => onPrice("stop", roundPrice(priceForY(worldY)))}
      />
      <Text
        position={[-0.02, (yEntry + yStop) / 2, 0.32]}
        fontSize={0.08}
        color="#ffb3ba"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
        raycast={skipRaycast}
      >
        risk
      </Text>
      <Text
        position={[0, (yEntry + yTarget) / 2, rewardD / 2 + 0.1]}
        fontSize={0.08}
        color="#b8ffe0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#031016"
        raycast={skipRaycast}
      >
        reward
      </Text>
    </group>
  );
}
