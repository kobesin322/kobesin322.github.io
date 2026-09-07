import { AdditiveBlending } from "three";
import { Stars } from "@react-three/drei";
import { useMemo } from "react";
import type { SceneLod } from "../lib/sceneLod";
import { skipRaycast } from "../lib/skipRaycast";

function GalaxyDust({ count }: { count: number }) {
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 6 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6;
      data[i * 3] = Math.cos(theta) * r;
      data[i * 3 + 1] = y;
      data[i * 3 + 2] = Math.sin(theta) * r * 0.72;
    }
    return data;
  }, [count]);

  return (
    <points frustumCulled raycast={skipRaycast}>
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

type Props = {
  lod: SceneLod;
};

export function SpaceBackdrop({ lod }: Props) {
  if (lod === "dive") {
    return (
      <>
        <color attach="background" args={["#05070c"]} />
        <fog attach="fog" args={["#05070c", 8, 22]} />
        <ambientLight intensity={0.12} />
        <hemisphereLight args={["#9aa8c4", "#0a0c12", 0.2]} />
      </>
    );
  }

  const lean = lod === "focus";
  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", lean ? 14 : 18, lean ? 36 : 48]} />
      <Stars
        radius={lean ? 42 : 56}
        depth={28}
        count={lean ? 500 : 900}
        factor={lean ? 1.7 : 2.1}
        saturation={0}
        fade
        speed={lean ? 0 : 0.18}
      />
      <GalaxyDust count={lean ? 220 : 420} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#9aa8c4", "#0a0c12", 0.22]} />
      <directionalLight position={[8, 10, 6]} intensity={0.55} color="#dce6ff" />
    </>
  );
}
