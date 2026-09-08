import { useRef, useState } from "react";
import { Billboard, Html, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { skipRaycast } from "../lib/skipRaycast";
import { lockOrbit, useYDrag } from "./useYDrag";

export const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11] as const;

export function fStopToIris(fStop: number) {
  const min = F_STOPS[0];
  const max = F_STOPS[F_STOPS.length - 1];
  const t = (Math.log(fStop) - Math.log(min)) / (Math.log(max) - Math.log(min));
  return 1 - Math.min(1, Math.max(0, t));
}

export function yToFStop(y: number, y0: number, y1: number) {
  const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  const min = Math.log(F_STOPS[0]);
  const max = Math.log(F_STOPS[F_STOPS.length - 1]);
  return Math.exp(min + t * (max - min));
}

export function nextFStop(fStop: number) {
  const i = F_STOPS.findIndex((stop) => fStop < stop - 0.05);
  return F_STOPS[i === -1 ? 0 : i];
}

export function formatFStop(fStop: number) {
  if (fStop >= 9.5) return String(Math.round(fStop));
  return fStop.toFixed(1);
}

export function fStopToY(fStop: number, y0: number, y1: number) {
  const min = Math.log(F_STOPS[0]);
  const max = Math.log(F_STOPS[F_STOPS.length - 1]);
  const t = (Math.log(fStop) - min) / (max - min);
  return y0 + t * (y1 - y0);
}

type Props = {
  fStop: number;
  y0: number;
  y1: number;
  position: [number, number, number];
  onChange: (fStop: number) => void;
};

export function ApertureControl({ fStop, y0, y1, position, onChange }: Props) {
  const y = fStopToY(fStop, y0, y1);
  const { begin, dragging } = useYDrag((worldY) => {
    onChange(yToFStop(worldY, y0, y1));
  });
  const { controls } = useThree();
  const [hovered, setHovered] = useState(false);
  const down = useRef({ x: 0, y: 0 });

  const cycle = () => onChange(nextFStop(fStop));

  return (
    <group position={position}>
      <mesh position={[0, (y0 + y1) / 2, 0]} raycast={skipRaycast}>
        <boxGeometry args={[0.07, y1 - y0 + 0.28, 0.07]} />
        <meshStandardMaterial color="#2a1816" metalness={0.4} roughness={0.45} />
      </mesh>
      <Billboard position={[0, y, 0]} follow>
        <mesh
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            lockOrbit(controls, false);
            document.body.style.cursor = "ns-resize";
          }}
          onPointerOut={() => {
            setHovered(false);
            if (!dragging.current) lockOrbit(controls, true);
            document.body.style.cursor = "auto";
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            lockOrbit(controls, false);
            down.current = { x: event.clientX, y: event.clientY };
            begin(y);
          }}
          onClick={(event) => {
            event.stopPropagation();
            const dx = event.clientX - down.current.x;
            const dy = event.clientY - down.current.y;
            if (dx * dx + dy * dy > 36) return;
            cycle();
          }}
        >
          <circleGeometry args={[hovered ? 0.34 : 0.3, 24]} />
          <meshStandardMaterial
            color="#c41e3a"
            emissive="#c41e3a"
            emissiveIntensity={hovered ? 1.2 : 0.7}
            roughness={0.25}
            toneMapped={false}
          />
        </mesh>
        <mesh raycast={skipRaycast}>
          <ringGeometry args={[0.26, 0.34, 24]} />
          <meshBasicMaterial color="#c41e3a" transparent opacity={0.4} toneMapped={false} />
        </mesh>
        <Html position={[0.62, 0, 0]} center style={{ pointerEvents: "auto" }} zIndexRange={[30, 10]}>
          <button type="button" className="iris-chip" onClick={cycle}>
            {`f/${formatFStop(fStop)}`}
          </button>
        </Html>
      </Billboard>
    </group>
  );
}

type PrintSpec = {
  id: string;
  title: string;
  rest: [number, number, number];
  rotation: [number, number, number];
  palette: [string, string, string];
};

export const PRINTS: PrintSpec[] = [
  {
    id: "harbor",
    title: "Harbor grain",
    rest: [-3.2, 1.7, -1.4],
    rotation: [0, 0.55, 0],
    palette: ["#1a2430", "#c4a574", "#e8ddd0"],
  },
  {
    id: "room",
    title: "Room light",
    rest: [3.4, 1.85, -1.1],
    rotation: [0, -0.6, 0],
    palette: ["#241812", "#d46a3a", "#f0d8b8"],
  },
  {
    id: "figure",
    title: "Figure",
    rest: [-2.6, 2.15, 1.8],
    rotation: [0, 0.9, 0],
    palette: ["#121418", "#8a8f96", "#ece6d8"],
  },
  {
    id: "street",
    title: "Street wet",
    rest: [2.8, 2.05, 2.0],
    rotation: [0, -0.95, 0],
    palette: ["#0e1c22", "#4aa8b8", "#dce8ea"],
  },
];

type PrintProps = {
  spec: PrintSpec;
  selected: boolean;
  exposure: number;
  onSelect: (id: string) => void;
};

export function HangingPrint({ spec, selected, exposure, onSelect }: PrintProps) {
  const root = useRef<Group>(null);
  const { controls } = useThree();
  const [hovered, setHovered] = useState(false);
  const inspect: [number, number, number] = [0, 1.55, 2.15];

  useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    const goal = selected ? inspect : spec.rest;
    group.position.x += (goal[0] - group.position.x) * Math.min(1, delta * 4.2);
    group.position.y += (goal[1] - group.position.y) * Math.min(1, delta * 4.2);
    group.position.z += (goal[2] - group.position.z) * Math.min(1, delta * 4.2);
    const rotY = selected ? 0 : spec.rotation[1];
    group.rotation.y += (rotY - group.rotation.y) * Math.min(1, delta * 4.2);
  });

  const emit = 0.08 + exposure * 0.85;

  return (
    <group ref={root} position={spec.rest} rotation={spec.rotation}>
      <mesh position={[0, 1.4, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.008, 0.008, 2.6, 6]} />
        <meshStandardMaterial color="#3a2a22" />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          lockOrbit(controls, false);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          lockOrbit(controls, true);
          document.body.style.cursor = "auto";
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(spec.id);
        }}
      >
        <boxGeometry args={[1.5, 1.18, 0.08]} />
        <meshStandardMaterial color={hovered || selected ? "#3a2c24" : "#241810"} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.038]} raycast={skipRaycast}>
        <planeGeometry args={[1.12, 0.86]} />
        <meshStandardMaterial
          color={spec.palette[0]}
          emissive={spec.palette[1]}
          emissiveIntensity={emit}
          roughness={0.55}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.18, -0.08, 0.042]} raycast={skipRaycast}>
        <planeGeometry args={[0.42, 0.58]} />
        <meshStandardMaterial color={spec.palette[1]} roughness={0.45} />
      </mesh>
      <mesh position={[0.28, 0.12, 0.044]} raycast={skipRaycast}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial color={spec.palette[2]} roughness={0.4} />
      </mesh>
      <Text
        position={[0, -0.62, 0.05]}
        fontSize={0.07}
        color="#d8c4b0"
        anchorX="center"
        outlineWidth={0.004}
        outlineColor="#12080a"
        raycast={skipRaycast}
      >
        {spec.title}
      </Text>
    </group>
  );
}
