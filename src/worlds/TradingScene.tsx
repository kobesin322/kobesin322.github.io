import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CandleField } from "./CandleField";

function DriftCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = -0.4 + Math.sin(t * 0.07) * 0.35;
    camera.position.y = 1.15 + Math.sin(t * 0.09) * 0.12;
    camera.position.z = 6.4;
    camera.lookAt(1.4, 0.4, -2);
  });
  return null;
}

export function TradingScene() {
  return (
    <>
      <color attach="background" args={["#041018"]} />
      <fog attach="fog" args={["#041018", 6, 22]} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#4aa8b8", "#041018", 0.35]} />
      <directionalLight position={[4, 6, 5]} intensity={0.55} color="#9fd7e0" />
      <pointLight position={[-3, 2, 2]} intensity={1.1} distance={12} color="#ff8a3d" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -2]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#062028" roughness={1} metalness={0} />
      </mesh>
      <CandleField />
      <Sparkles count={40} scale={[12, 6, 10]} size={2} speed={0.25} color="#7ec8d4" opacity={0.45} />
      <DriftCamera />
    </>
  );
}
