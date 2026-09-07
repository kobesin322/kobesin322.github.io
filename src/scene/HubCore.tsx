import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group } from "three";
import { glowIntensity } from "../lib/color";
import { skipRaycast } from "../lib/skipRaycast";
import { GlowSprite } from "./GlowSprite";

type Props = {
  color: string;
  luminosity: number;
  active: boolean;
  emitLight?: boolean;
};

export function HubCore({ color, luminosity, active, emitLight = false }: Props) {
  const rings = useRef<Group>(null);
  const emit = glowIntensity(luminosity, active);

  useFrame((_, delta) => {
    if (!rings.current || !emitLight) return;
    rings.current.rotation.y += delta * 0.16;
    rings.current.rotation.x += delta * 0.04;
  });

  return (
    <group>
      <mesh raycast={skipRaycast}>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emit}
          roughness={0.22}
          metalness={0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh raycast={skipRaycast}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#fff4d0" toneMapped={false} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.2, 0.15]} raycast={skipRaycast}>
          <torusGeometry args={[0.72, 0.01, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emit * 0.55}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
        <mesh rotation={[0.4, 0.9, -0.3]} raycast={skipRaycast}>
          <torusGeometry args={[0.92, 0.006, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </mesh>
      </group>
      <GlowSprite color={color} scale={active ? 2.8 : 2.2} opacity={0.42 + luminosity * 0.18} />
      {emitLight && <pointLight color={color} intensity={active ? 2.2 : 1.2} distance={10} />}
    </group>
  );
}
