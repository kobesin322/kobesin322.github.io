import { GlowSprite } from "./GlowSprite";

type Props = {
  color: string;
  active: boolean;
};

export function SatelliteCraft({ color, active }: Props) {
  const glow = active ? 1.8 : 0.7;

  return (
    <group>
      <mesh>
        <boxGeometry args={[0.22, 0.1, 0.28]} />
        <meshStandardMaterial color="#161810" metalness={0.72} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.07, 0.02]}>
        <boxGeometry args={[0.12, 0.02, 0.16]} />
        <meshStandardMaterial color="#2c2f27" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.34, 0.012, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          roughness={0.18}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.34, 0.012, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          roughness={0.18}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.12, -0.08]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
        <meshStandardMaterial color="#eceadf" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, -0.12]} rotation={[1.1, 0, 0]}>
        <coneGeometry args={[0.08, 0.02, 16]} />
        <meshStandardMaterial color="#8d8f84" metalness={0.6} roughness={0.3} />
      </mesh>
      <GlowSprite color={color} scale={active ? 1.8 : 1.15} opacity={active ? 0.65 : 0.4} />
      <pointLight color={color} intensity={active ? 1.6 : 0.7} distance={5} />
    </group>
  );
}
