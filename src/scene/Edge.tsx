import { useMemo, useRef, useState } from "react";
import { Line } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import { getStar } from "../data/constellation";
import type { EdgeLink, Selection } from "../types";

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
  const from = getStar(edge.from);
  const to = getStar(edge.to);
  const active = edgeIsActive(edge, selection) || hovered;
  const down = useRef({ x: 0, y: 0 });

  const { start, end, mid, quat, length } = useMemo(() => {
    const startVec = new Vector3(...from.position);
    const endVec = new Vector3(...to.position);
    const dir = endVec.clone().sub(startVec);
    const lengthVal = dir.length();
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return {
      start: from.position,
      end: to.position,
      mid: startVec.clone().lerp(endVec, 0.5).toArray() as [number, number, number],
      quat: quaternion,
      length: lengthVal,
    };
  }, [from.position, to.position]);

  return (
    <group>
      <Line
        points={[start, end]}
        color={active ? "#d4a017" : "#6d8a4f"}
        lineWidth={active ? 1.8 : 1.05}
        transparent
        opacity={active ? 0.92 : 0.32}
      />
      <mesh
        position={mid}
        quaternion={quat}
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
        <cylinderGeometry args={[0.09, 0.09, length, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
