import { useMemo } from "react";
import { AdditiveBlending } from "three";
import { Stars } from "@react-three/drei";

function GalaxyDust() {
  const positions = useMemo(() => {
    const count = 700;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 7;
      data[i * 3] = Math.cos(theta) * r;
      data[i * 3 + 1] = y;
      data[i * 3 + 2] = Math.sin(theta) * r * 0.72;
    }
    return data;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#6d7d99"
        transparent
        opacity={0.42}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export function SpaceBackdrop() {
  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 18, 48]} />
      <Stars radius={80} depth={40} count={1600} factor={2.1} saturation={0} fade speed={0.25} />
      <GalaxyDust />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#9aa8c4", "#0a0c12", 0.22]} />
      <directionalLight position={[8, 10, 6]} intensity={0.55} color="#dce6ff" />
    </>
  );
}
