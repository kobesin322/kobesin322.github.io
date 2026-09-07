import { useRef } from "react";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group } from "three";
import { GlowSprite } from "./GlowSprite";

type Props = {
  active: boolean;
};

export function HubCore({ active }: Props) {
  const rings = useRef<Group>(null);

  useFrame((_, delta) => {
    if (rings.current) {
      rings.current.rotation.y += delta * 0.22;
      rings.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={active ? 3.2 : 2.2}
          roughness={0.22}
          metalness={0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#f3e0a0" toneMapped={false} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.2, 0.15]}>
          <torusGeometry args={[0.72, 0.012, 10, 96]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={1.4}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
        <mesh rotation={[1.05, -0.5, 0.7]}>
          <torusGeometry args={[0.58, 0.008, 8, 80]} />
          <meshStandardMaterial
            color="#8faf6a"
            emissive="#8faf6a"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[0.4, 0.9, -0.3]}>
          <torusGeometry args={[0.86, 0.006, 8, 80]} />
          <meshBasicMaterial color="#d4a017" transparent opacity={0.35} />
        </mesh>
      </group>
      <GlowSprite color="#d4a017" scale={active ? 3.4 : 2.6} opacity={0.55} />
      <Sparkles count={28} scale={2.4} size={2.2} speed={0.35} color="#d4a017" opacity={0.7} />
      <pointLight color="#d4a017" intensity={active ? 4.2 : 2.8} distance={16} />
    </group>
  );
}
