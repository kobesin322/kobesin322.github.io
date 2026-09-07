import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
  type Sprite,
} from "three";
import { getStar } from "../data/constellation";
import { beamColor } from "../lib/color";
import type { EdgeLink, Selection } from "../types";
import { getGlowTexture } from "./textures";

type Props = {
  edge: EdgeLink;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

function edgeIsActive(edge: EdgeLink, selection: Selection): boolean {
  if (selection.kind === "edge") return selection.id === edge.id;
  if (selection.kind === "star") {
    return edge.from === selection.id || edge.to === selection.id;
  }
  return false;
}

export function Edge({ edge, selection, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);
  const spark = useRef<Sprite>(null);
  const down = useRef({ x: 0, y: 0 });
  const from = getStar(edge.from);
  const to = getStar(edge.to);
  const active = edgeIsActive(edge, selection) || hovered;
  const glowMap = useMemo(() => getGlowTexture(), []);
  const phase = useMemo(() => edge.id.length * 0.17, [edge.id]);
  const luminosity = Math.min(from.luminosity, to.luminosity) * 0.85;
  const tint = useMemo(
    () => beamColor(from.color, to.color, luminosity, active),
    [from.color, to.color, luminosity, active],
  );

  const { tube, pick, curve } = useMemo(() => {
    const start = new Vector3(...from.position);
    const end = new Vector3(...to.position);
    const dir = end.clone().sub(start);
    const trim = Math.min(0.62, dir.length() * 0.12);
    start.add(dir.clone().normalize().multiplyScalar(trim));
    end.add(dir.clone().normalize().multiplyScalar(-trim));
    const mid = start.clone().lerp(end, 0.5);
    const bulge = mid.clone();
    if (bulge.lengthSq() < 0.02) bulge.set(0, 1, 0);
    else bulge.normalize();
    mid.add(bulge.multiplyScalar(1.05));
    const path = new QuadraticBezierCurve3(start, mid, end);
    return {
      curve: path,
      tube: new TubeGeometry(path, 32, 0.022, 6, false),
      pick: new TubeGeometry(path, 12, 0.13, 5, false),
    };
  }, [from.position, to.position]);

  useEffect(
    () => () => {
      tube.dispose();
      pick.dispose();
    },
    [tube, pick],
  );

  useFrame(({ clock }) => {
    if (!spark.current) return;
    const t = (clock.elapsedTime * (active ? 0.18 : 0.08) + phase) % 1;
    spark.current.position.copy(curve.getPointAt(t));
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={active ? 0.9 : 0.38}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        geometry={pick}
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
          onSelect({ kind: "edge", id: edge.id });
        }}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite ref={spark} scale={active ? [0.42, 0.42, 1] : [0.24, 0.24, 1]} renderOrder={3}>
        <spriteMaterial
          map={glowMap}
          color={tint}
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
