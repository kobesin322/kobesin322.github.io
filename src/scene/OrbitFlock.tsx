import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { PLANET_CENTER, PLANET_RADIUS } from "./world";
import { GlowSprite } from "./GlowSprite";

function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = phi * i;
    points.push([Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius]);
  }
  return points;
}

function OrientedCraft({
  position,
  seed,
}: {
  position: [number, number, number];
  seed: number;
}) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(...PLANET_CENTER);
  }, [position]);
  return (
    <group ref={ref} position={position}>
      <DecoCraft seed={seed} />
    </group>
  );
}

function DecoCraft({ seed }: { seed: number }) {
  const tilt = (seed % 7) * 0.17;
  return (
    <group rotation={[tilt, seed, -tilt * 0.4]} scale={0.42}>
      <mesh>
        <boxGeometry args={[0.16, 0.07, 0.2]} />
        <meshStandardMaterial color="#1c1e18" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.14]} />
        <meshStandardMaterial
          color="#8faf6a"
          emissive="#8faf6a"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.14]} />
        <meshStandardMaterial
          color="#8faf6a"
          emissive="#8faf6a"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      <GlowSprite color="#8faf6a" scale={0.7} opacity={0.28} />
    </group>
  );
}

/** Unlabeled Starlink-style flock so the sky is a volume, not seven dots. */
export function OrbitFlock() {
  const shell = useRef<Group>(null);
  const inner = useMemo(() => fibonacciSphere(18, PLANET_RADIUS + 1.35), []);
  const outer = useMemo(() => fibonacciSphere(14, PLANET_RADIUS + 2.35), []);

  useFrame((_, delta) => {
    if (shell.current) shell.current.rotation.y += delta * 0.04;
  });

  return (
    <group ref={shell} position={PLANET_CENTER}>
      {inner.map((pos, index) => (
        <OrientedCraft key={`in-${index}`} position={pos} seed={index + 1} />
      ))}
      {outer.map((pos, index) => (
        <OrientedCraft key={`out-${index}`} position={pos} seed={index + 20} />
      ))}
    </group>
  );
}
