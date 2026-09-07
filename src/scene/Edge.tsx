import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
  type Sprite,
} from "three";
import { getStar } from "../data/constellation";
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
  const tint = useMemo(() => new Color(active ? "#d4a017" : "#6d8a4f"), [active]);

  const { tube, halo, pick, curve } = useMemo(() => {
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
    mid.add(bulge.multiplyScalar(1.2));
    const path = new QuadraticBezierCurve3(start, mid, end);
    return {
      curve: path,
      tube: new TubeGeometry(path, 56, 0.026, 8, false),
      halo: new TubeGeometry(path, 40, 0.08, 8, false),
      pick: new TubeGeometry(path, 20, 0.14, 6, false),
    };
  }, [from.position, to.position]);

  useEffect(
    () => () => {
      tube.dispose();
      halo.dispose();
      pick.dispose();
    },
    [tube, halo, pick],
  );

  useFrame(({ clock }) => {
    if (!spark.current) return;
    const t = (clock.elapsedTime * (active ? 0.22 : 0.1) + phase) % 1;
    spark.current.position.copy(curve.getPointAt(t));
  });

  return (
    <group>
      <mesh geometry={halo}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={active ? 0.22 : 0.08}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={tube}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={active ? 0.95 : 0.45}
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
      <sprite ref={spark} scale={active ? [0.55, 0.55, 1] : [0.32, 0.32, 1]} renderOrder={3}>
        <spriteMaterial
          map={glowMap}
          color={tint}
          transparent
          opacity={0.95}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
