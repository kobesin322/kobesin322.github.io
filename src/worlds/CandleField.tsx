import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, type Group } from "three";
import { skipRaycast } from "../lib/skipRaycast";

type Candle = {
  x: number;
  y: number;
  z: number;
  h: number;
  w: number;
  gain: boolean;
};

const dummy = new Object3D();

function makeCandles(): Candle[] {
  const out: Candle[] = [];
  const count = 14;
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

function CandleBatch({ items, color }: { items: Candle[]; color: string }) {
  const mesh = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst || items.length === 0) return;
    items.forEach((c, i) => {
      dummy.position.set(c.x, c.y + c.h / 2, c.z);
      dummy.scale.set(c.w, c.h, c.w);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, items.length]}
      raycast={skipRaycast}
      frustumCulled
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.35}
        metalness={0.1}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

type Props = {
  reduceMotion?: boolean;
};

export function CandleField({ reduceMotion = false }: Props) {
  const group = useRef<Group>(null);
  const candles = useMemo(() => makeCandles(), []);
  const gain = useMemo(() => candles.filter((c) => c.gain), [candles]);
  const loss = useMemo(() => candles.filter((c) => !c.gain), [candles]);

  useFrame(({ clock }) => {
    if (!group.current || reduceMotion) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      <CandleBatch items={gain} color="#3ee0a0" />
      <CandleBatch items={loss} color="#ff5c6a" />
    </group>
  );
}
