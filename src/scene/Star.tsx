import { useMemo, useRef, useState } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Mesh } from "three";
import type { Selection, StarNode } from "../types";

type Props = {
  star: StarNode;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

function isActive(starId: string, selection: Selection): boolean {
  if (selection.kind === "star") return selection.id === starId;
  return false;
}

export function Star({ star, selection, onSelect }: Props) {
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isHub = star.id === "hub";
  const radius = isHub ? 0.34 : 0.16;
  const active = isActive(star.id, selection) || hovered;
  const showLabel = isHub || hovered || active;
  const down = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const pulse = isHub ? 0.04 : 0.025;
    const t = 1 + Math.sin(performance.now() * 0.0018 + star.position[0]) * pulse;
    if (core.current) {
      const scale = (active ? 1.14 : 1) * t;
      core.current.scale.setScalar(scale);
    }
    if (halo.current) {
      halo.current.rotation.z += delta * 0.12;
    }
  });

  const emissiveIntensity = useMemo(() => {
    if (isHub) return active ? 2.2 : 1.6;
    return active ? 1.8 : 1.05;
  }, [active, isHub]);

  return (
    <group position={star.position}>
      <mesh
        ref={core}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onPointerDown={(event) => {
          down.current = { x: event.clientX, y: event.clientY };
        }}
        onClick={(event) => {
          event.stopPropagation();
          const dx = event.clientX - down.current.x;
          const dy = event.clientY - down.current.y;
          if (dx * dx + dy * dy > 25) return;
          onSelect({ kind: "star", id: star.id });
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={star.color}
          emissive={star.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={halo} scale={active ? 1.08 : 1}>
        <sphereGeometry args={[radius * 1.85, 16, 16]} />
        <meshBasicMaterial color={star.color} transparent opacity={isHub ? 0.16 : 0.1} depthWrite={false} />
      </mesh>
      {star.status === "concept" && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.45, radius * 1.72, 36]} />
          <meshBasicMaterial
            color={star.color}
            transparent
            opacity={active ? 0.85 : 0.45}
            side={DoubleSide}
          />
        </mesh>
      )}
      {showLabel && (
        <Billboard follow>
          <Html
            center
            distanceFactor={7.5}
            style={{ pointerEvents: "none" }}
            zIndexRange={[20, 0]}
          >
            <div className={`star-tag${active ? " is-on" : ""}`}>
              {star.title}
              {star.status === "concept" && <span>concept</span>}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
