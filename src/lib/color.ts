import { Color } from "three";

/** Mix two star colours, then scale by luminosity so beams stay dimmer than nodes. */
export function beamColor(fromHex: string, toHex: string, luminosity: number, active: boolean): Color {
  const mixed = new Color(fromHex).lerp(new Color(toHex), 0.5);
  const scale = active ? 0.55 + luminosity * 0.35 : 0.22 + luminosity * 0.18;
  mixed.multiplyScalar(scale);
  return mixed;
}

export function glowIntensity(luminosity: number, active: boolean): number {
  const base = 0.35 + luminosity * 1.15;
  return active ? base * 1.35 : base;
}
