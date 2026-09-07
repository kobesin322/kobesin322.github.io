import { CanvasTexture, SRGBColorSpace } from "three";

let glow: CanvasTexture | null = null;
let planet: { map: CanvasTexture; emissiveMap: CanvasTexture } | null = null;

function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function fbm(x: number, y: number): number {
  return (
    hash(x, y) * 0.5 +
    hash(x * 2.1, y * 2.1) * 0.25 +
    hash(x * 4.3, y * 4.3) * 0.125
  );
}

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

export function getPlanetTextures(): { map: CanvasTexture; emissiveMap: CanvasTexture } {
  if (planet) return planet;
  const width = 1024;
  const height = 512;
  const mapCanvas = document.createElement("canvas");
  const emitCanvas = document.createElement("canvas");
  mapCanvas.width = emitCanvas.width = width;
  mapCanvas.height = emitCanvas.height = height;
  const mapCtx = mapCanvas.getContext("2d");
  const emitCtx = emitCanvas.getContext("2d");
  if (!mapCtx || !emitCtx) throw new Error("canvas");

  const mapData = mapCtx.createImageData(width, height);
  const emitData = emitCtx.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const nx = u * 8;
      const ny = v * 4;
      const n = fbm(nx, ny);
      const polar = Math.abs(v - 0.5) * 2;
      const land = n > 0.52 + polar * 0.08;
      const i = (y * width + x) * 4;
      if (land) {
        mapData.data[i] = 28 + n * 40;
        mapData.data[i + 1] = 38 + n * 55;
        mapData.data[i + 2] = 22 + n * 18;
        const city = hash(x * 0.37, y * 0.41);
        if (city > 0.965 && polar < 0.72) {
          emitData.data[i] = 212;
          emitData.data[i + 1] = 160;
          emitData.data[i + 2] = 23;
          emitData.data[i + 3] = 255;
        } else {
          emitData.data[i + 3] = 0;
        }
      } else {
        mapData.data[i] = 8 + n * 10;
        mapData.data[i + 1] = 12 + n * 14;
        mapData.data[i + 2] = 18 + n * 22;
        emitData.data[i + 3] = 0;
      }
      mapData.data[i + 3] = 255;
    }
  }

  mapCtx.putImageData(mapData, 0, 0);
  emitCtx.putImageData(emitData, 0, 0);
  const map = new CanvasTexture(mapCanvas);
  const emissiveMap = new CanvasTexture(emitCanvas);
  map.colorSpace = SRGBColorSpace;
  emissiveMap.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  planet = { map, emissiveMap };
  return planet;
}
