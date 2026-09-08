import { DoubleSide } from "three";
import { Text } from "@react-three/drei";
import { glowIntensity } from "../lib/color";
import { skipRaycast } from "../lib/skipRaycast";
import { GlowSprite } from "./GlowSprite";

type Cast = typeof skipRaycast | undefined;

type Props = {
  color: string;
  luminosity: number;
  active: boolean;
  lit?: boolean;
  glow?: boolean;
  /** Extra chip edge spots in the felt interior. */
  detail?: "star" | "table";
};

function Spade({
  position,
  scale = 1,
  cast,
}: {
  position: [number, number, number];
  scale?: number;
  cast: Cast;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.028, 0.014, 0]} raycast={cast}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial color="#121418" roughness={0.42} />
      </mesh>
      <mesh position={[0.028, 0.014, 0]} raycast={cast}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial color="#121418" roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]} raycast={cast}>
        <coneGeometry args={[0.05, 0.088, 8]} />
        <meshStandardMaterial color="#121418" roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.072, 0]} raycast={cast}>
        <boxGeometry args={[0.016, 0.038, 0.012]} />
        <meshStandardMaterial color="#121418" roughness={0.42} />
      </mesh>
    </group>
  );
}

function Chip({
  y,
  rotY,
  body,
  edge,
  segs,
  spots,
  cast,
}: {
  y: number;
  rotY: number;
  body: string;
  edge: string;
  segs: number;
  spots: number;
  cast: Cast;
}) {
  return (
    <group position={[0, y, 0]} rotation={[0, rotY, 0]}>
      <mesh raycast={cast}>
        <cylinderGeometry args={[0.22, 0.22, 0.046, segs]} />
        <meshStandardMaterial color={body} roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={cast}>
        <ringGeometry args={[0.078, 0.15, segs]} />
        <meshStandardMaterial color={edge} metalness={0.62} roughness={0.26} />
      </mesh>
      {Array.from({ length: spots }, (_, i) => {
        const a = (i / spots) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.216, 0, Math.sin(a) * 0.216]}
            rotation={[0, -a, 0]}
            raycast={cast}
          >
            <boxGeometry args={[0.038, 0.048, 0.016]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? edge : "#eceadf"}
              metalness={0.35}
              roughness={0.32}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function RankCard({
  rank,
  position,
  rotation,
  centerScale,
  extra,
  cast,
}: {
  rank: "A" | "K";
  position: [number, number, number];
  rotation: [number, number, number];
  centerScale: number;
  extra?: boolean;
  cast: Cast;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh raycast={cast}>
        <boxGeometry args={[0.22, 0.31, 0.014]} />
        <meshStandardMaterial color="#1a1c16" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.008]} raycast={cast}>
        <boxGeometry args={[0.198, 0.286, 0.006]} />
        <meshStandardMaterial color="#f3eee4" roughness={0.58} side={DoubleSide} />
      </mesh>
      <Text
        position={[-0.068, 0.108, 0.014]}
        fontSize={0.052}
        color="#121418"
        anchorX="center"
        anchorY="middle"
        raycast={skipRaycast}
      >
        {rank}
      </Text>
      <Text
        position={[0.068, -0.108, 0.014]}
        fontSize={0.052}
        color="#121418"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI]}
        raycast={skipRaycast}
      >
        {rank}
      </Text>
      <Spade position={[0, extra ? -0.016 : 0.006, 0.016]} scale={centerScale} cast={cast} />
      {extra && (
        <>
          <mesh position={[-0.036, 0.055, 0.016]} raycast={cast}>
            <boxGeometry args={[0.09, 0.016, 0.01]} />
            <meshStandardMaterial color="#121418" roughness={0.4} />
          </mesh>
          <mesh position={[-0.038, 0.078, 0.016]} raycast={cast}>
            <boxGeometry args={[0.016, 0.034, 0.01]} />
            <meshStandardMaterial color="#121418" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.086, 0.016]} raycast={cast}>
            <boxGeometry args={[0.016, 0.044, 0.01]} />
            <meshStandardMaterial color="#121418" roughness={0.4} />
          </mesh>
          <mesh position={[0.038, 0.078, 0.016]} raycast={cast}>
            <boxGeometry args={[0.016, 0.034, 0.01]} />
            <meshStandardMaterial color="#121418" roughness={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Compact starting hand in the constellation language: two chips stacked,
 * Ace–King of spades fanned and glued as one readable object.
 */
export function PokerCraft({
  color,
  luminosity,
  active,
  lit = false,
  glow = true,
  detail = "star",
}: Props) {
  const emit = glowIntensity(luminosity, active) * 0.18;
  const table = detail === "table";
  const segs = table ? 24 : 12;
  const spots = table ? 10 : 8;
  const cast: Cast = skipRaycast;

  return (
    <group>
      <Chip y={0.023} rotY={0.14} body="#8a1c2c" edge={color} segs={segs} spots={spots} cast={cast} />
      <Chip y={0.072} rotY={-0.32} body="#16181c" edge={color} segs={segs} spots={spots} cast={cast} />
      {/* One glued starting hand: Ace and King overlap as a single upright combo. */}
      <group position={[0.01, 0.118, 0.02]} rotation={[-0.38, 0.18, 0.04]}>
        <RankCard
          rank="A"
          position={[-0.016, 0.1, 0]}
          rotation={[0, -0.05, 0.03]}
          centerScale={1.2}
          cast={cast}
        />
        <RankCard
          rank="K"
          position={[0.028, 0.108, 0.012]}
          rotation={[0.02, 0.1, -0.02]}
          centerScale={0.82}
          extra
          cast={cast}
        />
      </group>
      <mesh position={[0.02, 0.05, 0.03]} raycast={cast}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emit}
          metalness={0.45}
          roughness={0.28}
          toneMapped={false}
        />
      </mesh>
      {lit && (
        <>
          <pointLight position={[0.5, 0.55, 0.7]} intensity={0.95} distance={2.2} color="#fff4e4" />
          <pointLight position={[-0.45, 0.25, -0.35]} intensity={0.4} distance={1.6} color="#8ee0b0" />
        </>
      )}
      {glow && (
        <GlowSprite
          color={color}
          scale={(active ? 1.32 : 0.88) * (0.7 + luminosity * 0.45)}
          opacity={0.2 + luminosity * 0.2}
        />
      )}
    </group>
  );
}
