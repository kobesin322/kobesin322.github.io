import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type Candle = {
  x: number;
  z: number;
  h: number;
  y: number;
  speed: number;
  gain: boolean;
};

function makeCandles(): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < 14; i += 1) {
    const col = i % 7;
    const row = Math.floor(i / 7);
    out.push({
      x: (col - 3) * 1.35,
      z: -2.2 - row * 2.1,
      h: 0.5 + ((i * 17) % 10) * 0.18,
      y: ((i * 13) % 8) * 0.12,
      speed: 0.08 + (i % 5) * 0.02,
      gain: i % 3 !== 0,
    });
  }
  return out;
}

export function CandleField() {
  const group = useRef<Group>(null);
  const candles = useMemo(() => makeCandles(), []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.22) * 0.12;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.08;
  });

  return (
    <group ref={group} position={[2.6, 0.2, 0]}>
      {candles.map((c, i) => (
        <mesh key={i} position={[c.x, c.y + c.h / 2, c.z]}>
          <boxGeometry args={[0.38, c.h, 0.38]} />
          <meshStandardMaterial
            color={c.gain ? "#3ee0a0" : "#ff5c6a"}
            emissive={c.gain ? "#3ee0a0" : "#ff5c6a"}
            emissiveIntensity={0.45}
            roughness={0.35}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
