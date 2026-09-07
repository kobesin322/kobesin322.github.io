import { Stars } from "@react-three/drei";
import { Planet } from "./Planet";
import { OrbitFlock } from "./OrbitFlock";

export function SpaceBackdrop() {
  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 22, 72]} />
      <Stars radius={120} depth={70} count={5000} factor={3.2} saturation={0} fade speed={0.45} />
      <ambientLight intensity={0.07} />
      <hemisphereLight args={["#c9d4c0", "#0a0c10", 0.28]} />
      <directionalLight position={[14, 8, 10]} intensity={1.55} color="#f2e6c4" />
      <directionalLight position={[-10, -6, -8]} intensity={0.22} color="#3d4e62" />
      <Planet />
      <OrbitFlock />
    </>
  );
}
