import { glowIntensity } from "../lib/color";
import { GlowSprite } from "./GlowSprite";

type Props = {
  color: string;
  luminosity: number;
  active: boolean;
};

export function SatelliteCraft({ color, luminosity, active }: Props) {
  const emit = glowIntensity(luminosity, active);

  return (
    <group>
      <mesh>
        <boxGeometry args={[0.2, 0.09, 0.26]} />
        <meshStandardMaterial color="#12141a" metalness={0.78} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.065, 0.02]}>
        <boxGeometry args={[0.1, 0.016, 0.14]} />
        <meshStandardMaterial color="#1c2230" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.28, 0, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.32, 0.01, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emit}
          roughness={0.16}
          metalness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.28, 0, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.32, 0.01, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emit}
          roughness={0.16}
          metalness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.11, -0.07]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.14, 8]} />
        <meshStandardMaterial color="#cfd6e4" metalness={0.85} roughness={0.18} />
      </mesh>
      <GlowSprite
        color={color}
        scale={(active ? 1.45 : 0.95) * (0.7 + luminosity * 0.5)}
        opacity={0.28 + luminosity * 0.28}
      />
    </group>
  );
}
