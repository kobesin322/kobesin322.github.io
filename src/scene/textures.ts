import { CanvasTexture, SRGBColorSpace } from "three";

let glow: CanvasTexture | null = null;

export function getGlowTexture(): CanvasTexture {
  if (glow) return glow;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.45)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  glow = new CanvasTexture(canvas);
  glow.colorSpace = SRGBColorSpace;
  return glow;
}
