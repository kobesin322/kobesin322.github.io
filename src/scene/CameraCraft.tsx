import { DoubleSide } from "three";
import { glowIntensity } from "../lib/color";
import { skipRaycast } from "../lib/skipRaycast";
import { GlowSprite } from "./GlowSprite";

type Props = {
  color: string;
  luminosity: number;
  active: boolean;
  /** Product-hero key/fill on the body. Off while the star scales into a dive. */
  lit?: boolean;
  glow?: boolean;
  /** Extra lens rings + iris. Used in the photography interior. */
  detail?: "star" | "studio";
  /** 0 closed → 1 open. Studio only. */
  iris?: number;
};

/**
 * Compact rangefinder in the Astra product-hero language: one readable object,
 * three-quarter silhouette, metal + glass weight, not a glowing satellite blob.
 * Lens along +Z, top +Y.
 */
export function CameraCraft({
  color,
  luminosity,
  active,
  lit = false,
  glow = true,
  detail = "star",
  iris = 0.62,
}: Props) {
  const emit = glowIntensity(luminosity, active) * 0.22;
  const studio = detail === "studio";
  const segs = studio ? 24 : 12;
  const open = Math.min(1, Math.max(0.08, iris));

  return (
    <group>
      {/* Body */}
      <mesh raycast={skipRaycast}>
        <boxGeometry args={[0.5, 0.28, 0.2]} />
        <meshStandardMaterial color="#2c323a" metalness={0.78} roughness={0.24} />
      </mesh>
      {/* Leatherette front */}
      <mesh position={[0, -0.01, 0.102]} raycast={skipRaycast}>
        <boxGeometry args={[0.46, 0.2, 0.012]} />
        <meshStandardMaterial color="#2a1714" roughness={0.86} metalness={0.08} />
      </mesh>
      {/* Top plate */}
      <mesh position={[0, 0.15, 0]} raycast={skipRaycast}>
        <boxGeometry args={[0.5, 0.034, 0.2]} />
        <meshStandardMaterial color="#c5ccd4" metalness={0.9} roughness={0.14} />
      </mesh>
      {/* Grip */}
      <mesh position={[-0.2, -0.02, 0.02]} raycast={skipRaycast}>
        <boxGeometry args={[0.12, 0.24, 0.22]} />
        <meshStandardMaterial color="#121416" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Viewfinder hump */}
      <mesh position={[0.08, 0.2, -0.02]} raycast={skipRaycast}>
        <boxGeometry args={[0.18, 0.08, 0.14]} />
        <meshStandardMaterial color="#6f767c" metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0.08, 0.205, 0.055]} raycast={skipRaycast}>
        <boxGeometry args={[0.1, 0.05, 0.012]} />
        <meshStandardMaterial color="#1a1c20" metalness={0.4} roughness={0.35} />
      </mesh>
      {/* Hot shoe */}
      <mesh position={[0.08, 0.248, -0.02]} raycast={skipRaycast}>
        <boxGeometry args={[0.08, 0.016, 0.06]} />
        <meshStandardMaterial color="#c9d0d6" metalness={0.9} roughness={0.16} />
      </mesh>
      {/* Shutter dial */}
      <mesh position={[-0.16, 0.182, 0.02]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.045, 0.045, 0.028, segs]} />
        <meshStandardMaterial color="#c5ccd2" metalness={0.86} roughness={0.2} />
      </mesh>
      <mesh position={[-0.16, 0.2, 0.02]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.018, 0.018, 0.012, 8]} />
        <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* ISO dial */}
      <mesh position={[0.2, 0.178, 0.04]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.032, 0.032, 0.022, segs]} />
        <meshStandardMaterial color="#4a4e54" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Release */}
      <mesh position={[-0.08, 0.178, 0.06]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.016, 0.016, 0.02, 8]} />
        <meshStandardMaterial color="#ece8df" metalness={0.65} roughness={0.22} />
      </mesh>
      {/* Strap lugs */}
      <mesh position={[-0.255, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
        <meshStandardMaterial color="#c9d0d6" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0.255, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
        <meshStandardMaterial color="#c9d0d6" metalness={0.85} roughness={0.18} />
      </mesh>
      {/* Red rangefinder accent */}
      <mesh position={[0.2, 0.04, 0.108]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.018, 0.018, 0.01, 10]} />
        <meshStandardMaterial
          color="#c41e3a"
          emissive="#c41e3a"
          emissiveIntensity={active ? 0.55 : 0.28}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* Rear window */}
      <mesh position={[0.12, 0.0, -0.102]} raycast={skipRaycast}>
        <boxGeometry args={[0.16, 0.1, 0.008]} />
        <meshStandardMaterial color="#0b1016" metalness={0.6} roughness={0.12} />
      </mesh>

      {/* Lens: stacked barrel, brass rings, dark glass, catchlight */}
      <group position={[0, 0, 0.1]}>
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <cylinderGeometry args={[0.1, 0.11, 0.08, segs]} />
          <meshStandardMaterial color="#2a2e34" metalness={0.78} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <torusGeometry args={[0.105, 0.012, 8, segs]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emit}
            metalness={0.7}
            roughness={0.22}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <cylinderGeometry args={[0.092, 0.098, 0.12, segs]} />
          <meshStandardMaterial color="#1c2026" metalness={0.82} roughness={0.2} />
        </mesh>
        {studio && (
          <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
            <torusGeometry args={[0.1, 0.01, 8, segs]} />
            <meshStandardMaterial color="#3a424a" metalness={0.5} roughness={0.55} />
          </mesh>
        )}
        <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <torusGeometry args={[0.09, 0.01, 8, segs]} />
          <meshStandardMaterial color="#d4a017" metalness={0.78} roughness={0.2} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0, 0.235]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <circleGeometry args={[0.078, segs]} />
          <meshStandardMaterial
            color="#0a1420"
            metalness={0.95}
            roughness={0.04}
            envMapIntensity={1.4}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.242]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <ringGeometry args={[0.072, 0.078, segs]} />
          <meshStandardMaterial color="#1a2430" metalness={0.9} roughness={0.12} />
        </mesh>
        {studio && (
          <mesh position={[0, 0, 0.238]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
            <ringGeometry args={[0.012 + open * 0.062, 0.072, segs]} />
            <meshStandardMaterial color="#07080c" roughness={0.7} metalness={0.15} />
          </mesh>
        )}
        {/* Catchlight */}
        <mesh position={[-0.028, 0.03, 0.248]} raycast={skipRaycast}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#f4f0e6" toneMapped={false} />
        </mesh>
      </group>

      {lit && (
        <>
          <pointLight position={[0.55, 0.55, 0.85]} intensity={1.15} distance={2.4} color="#fff4e4" />
          <pointLight position={[-0.55, 0.2, -0.4]} intensity={0.45} distance={1.8} color="#8aa0c8" />
        </>
      )}
      {glow && (
        <GlowSprite
          color={color}
          scale={(active ? 1.35 : 0.9) * (0.7 + luminosity * 0.45)}
          opacity={0.22 + luminosity * 0.2}
        />
      )}
    </group>
  );
}
