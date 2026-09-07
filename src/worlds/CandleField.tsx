import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type Candle = {
  x: number;
  y: number;
  z: number;
  h: number;
  w: number;
  gain: boolean;
};

function makeCandles(): Candle[] {
  const out: Candle[] = [];
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const a = Math.PI + (i / (count - 1)) * Math.PI;
    const r = 5.4 + ((i * 13) % 7) * 0.12;
    out.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r - 0.4,
      h: 0.7 + ((i * 17) % 11) * 0.22,
      w: 0.28 + (i % 3) * 0.06,
      y: ((i * 11) % 6) * 0.08,
      gain: i % 3 !== 0,
    });
  }
  return out;
}

type Props = {
  reduceMotion?: boolean;
};

export function CandleField({ reduceMotion = false }: Props) {
  const group = useRef<Group>(null);
  const candles = useMemo(() => makeCandles(), []);

  useFrame(({ clock }) => {
    if (!group.current || reduceMotion) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={group}>
      {candles.map((c, i) => (
        <mesh key={i} position={[c.x, c.y + c.h / 2, c.z]}>
          <boxGeometry args={[c.w, c.h, c.w]} />
          <meshStandardMaterial
            color={c.gain ? "#3ee0a0" : "#ff5c6a"}
            emissive={c.gain ? "#3ee0a0" : "#ff5c6a"}
            emissiveIntensity={0.4}
            roughness={0.35}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
