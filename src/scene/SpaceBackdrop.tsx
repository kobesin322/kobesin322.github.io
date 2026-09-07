import { Stars } from "@react-three/drei";

export function SpaceBackdrop() {
  return (
    <>
      <color attach="background" args={["#0b0c0a"]} />
      <fog attach="fog" args={["#0b0c0a", 16, 48]} />
      <Stars radius={90} depth={50} count={3500} factor={2.6} saturation={0} fade speed={0.35} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 8, 4]} intensity={0.35} color="#eceadf" />
      <pointLight position={[0, 0, 0]} intensity={1.4} distance={14} color="#d4a017" />
      <mesh rotation={[Math.PI / 2.4, 0.2, 0.15]}>
        <torusGeometry args={[6.6, 0.008, 8, 160]} />
        <meshBasicMaterial color="#2c2f27" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[1.05, -0.4, 0.6]}>
        <torusGeometry args={[5.4, 0.006, 8, 140]} />
        <meshBasicMaterial color="#3a3d34" transparent opacity={0.35} />
      </mesh>
    </>
  );
}
