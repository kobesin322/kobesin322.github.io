import { useLayoutEffect, useRef, useState } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Selection, StarNode } from "../types";
import { CameraCraft } from "./CameraCraft";
import { HubCore } from "./HubCore";
import { SatelliteCraft } from "./SatelliteCraft";

type Props = {
  star: StarNode;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

function isFocused(starId: string, selection: Selection): boolean {
  return (
    (selection.kind === "star" || selection.kind === "world") && selection.id === starId
  );
}

const CAMERA_REST_Y = -0.55;

export function Star({ star, selection, onSelect }: Props) {
  const craft = useRef<Group>(null);
  const root = useRef<Group>(null);
  const scale = useRef(1);
  const [hovered, setHovered] = useState(false);
  const isHub = star.id === "hub";
  const isCamera = star.world === "photography";
  const entering = selection.kind === "world" && selection.id === star.id;
  const focused = isFocused(star.id, selection);
  const active = focused || hovered;
  const showLabel = !entering && (isHub || hovered || focused);
  const idleSpin = !isHub && !entering && !focused && selection.kind === "none";
  const down = useRef({ x: 0, y: 0 });
  const hitRadius = isHub ? 0.72 : isCamera ? 0.72 : 0.5;
  const labelY = isHub ? 1.0 : isCamera ? 0.78 : 0.58;

  useLayoutEffect(() => {
    if (isHub || !craft.current) return;
    if (isCamera) {
      craft.current.rotation.set(0, CAMERA_REST_Y, 0);
      return;
    }
    craft.current.lookAt(0, 0, 0);
  }, [isHub, isCamera, star.position]);

  useFrame((state, delta) => {
    if (craft.current && isCamera) {
      if (idleSpin) {
        craft.current.rotation.y =
          CAMERA_REST_Y + Math.sin(state.clock.elapsedTime * 0.35) * 0.32;
      } else {
        craft.current.rotation.y +=
          (CAMERA_REST_Y - craft.current.rotation.y) * Math.min(1, delta * 3.2);
      }
    } else if (craft.current && idleSpin) {
      craft.current.rotateZ(delta * 0.1);
    }
    if (root.current) {
      const goal = entering ? 7.5 : 1;
      if (Math.abs(goal - scale.current) < 0.001) {
        if (scale.current !== goal) {
          scale.current = goal;
          root.current.scale.setScalar(goal);
        }
        return;
      }
      scale.current += (goal - scale.current) * Math.min(1, delta * 2.4);
      root.current.scale.setScalar(scale.current);
    }
  });

  return (
    <group ref={root} position={star.position}>
      {isHub ? (
        <HubCore
          color={star.color}
          luminosity={star.luminosity}
          active={active}
          emitLight={selection.kind === "none" || active}
        />
      ) : (
        <group ref={craft}>
          {isCamera ? (
            <CameraCraft
              color={star.color}
              luminosity={star.luminosity}
              active={active}
              lit={!entering && (active || selection.kind === "none")}
            />
          ) : (
            <SatelliteCraft color={star.color} luminosity={star.luminosity} active={active} />
          )}
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
          if (selection.kind === "star" && selection.id === star.id && star.world) {
            onSelect({ kind: "world", id: star.id });
            return;
          }
          onSelect({ kind: "star", id: star.id });
        }}
      >
        <sphereGeometry args={[hitRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showLabel && (
        <Billboard follow position={[0, labelY, 0]}>
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
              {star.world ? (
                <span style={{ color: star.color }}>world</span>
              ) : (
                star.status === "concept" && <span style={{ color: star.color }}>concept</span>
              )}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
