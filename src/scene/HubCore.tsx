import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group } from "three";
import { glowIntensity } from "../lib/color";
import { GlowSprite } from "./GlowSprite";

type Props = {
  color: string;
  luminosity: number;
  active: boolean;
};

export function HubCore({ color, luminosity, active }: Props) {
  const rings = useRef<Group>(null);
  const emit = glowIntensity(luminosity, active);

  useFrame((_, delta) => {
    if (rings.current) {
      rings.current.rotation.y += delta * 0.16;
      rings.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <group>
      <mesh>
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
      <mesh>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshBasicMaterial color="#fff4d0" toneMapped={false} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.2, 0.15]}>
          <torusGeometry args={[0.72, 0.01, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emit * 0.55}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
        <mesh rotation={[0.4, 0.9, -0.3]}>
          <torusGeometry args={[0.92, 0.006, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </mesh>
      </group>
      <GlowSprite color={color} scale={active ? 2.8 : 2.2} opacity={0.42 + luminosity * 0.18} />
      <pointLight color={color} intensity={active ? 2.2 : 1.5} distance={12} />
    </group>
  );
}
