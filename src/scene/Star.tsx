import { useLayoutEffect, useRef, useState } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Selection, StarNode } from "../types";
import { HubCore } from "./HubCore";
import { SatelliteCraft } from "./SatelliteCraft";

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
  const craft = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const isHub = star.id === "hub";
  const active = isActive(star.id, selection) || hovered;
  const showLabel = isHub || hovered || active;
  const down = useRef({ x: 0, y: 0 });
  const hitRadius = isHub ? 0.72 : 0.5;

  useLayoutEffect(() => {
    if (isHub || !craft.current) return;
    craft.current.lookAt(0, 0, 0);
  }, [isHub, star.position]);

  useFrame((_, delta) => {
    if (craft.current && !isHub) {
      craft.current.rotateZ(delta * 0.1);
    }
  });

  return (
    <group position={star.position}>
      {isHub ? (
        <HubCore color={star.color} luminosity={star.luminosity} active={active} />
      ) : (
        <group ref={craft}>
          <SatelliteCraft color={star.color} luminosity={star.luminosity} active={active} />
        </group>
      )}
      <mesh
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
        <sphereGeometry args={[hitRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showLabel && (
        <Billboard follow position={[0, isHub ? 1.0 : 0.58, 0]}>
          <Html
            center
            distanceFactor={9}
            style={{ pointerEvents: "none" }}
            zIndexRange={[20, 0]}
          >
            <div
              className={`star-tag${active ? " is-on" : ""}`}
              style={{ borderColor: star.color, color: active ? star.color : undefined }}
            >
              {star.title}
              {star.status === "concept" && <span style={{ color: star.color }}>concept</span>}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
