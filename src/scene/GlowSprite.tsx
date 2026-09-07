import { useMemo } from "react";
import { AdditiveBlending, Color } from "three";
import { skipRaycast } from "../lib/skipRaycast";
import { getGlowTexture } from "./textures";

type Props = {
  color: string;
  scale?: number;
  opacity?: number;
};

export function GlowSprite({ color, scale = 1.6, opacity = 0.7 }: Props) {
  const map = useMemo(() => getGlowTexture(), []);
  const tint = useMemo(() => new Color(color), [color]);

  return (
    <sprite scale={[scale, scale, 1]} renderOrder={2} raycast={skipRaycast}>
      <spriteMaterial
        map={map}
        color={tint}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}
