export const WORLD_LOADERS = {
  trading: () => import("./TradingScene"),
  photography: () => import("./PhotographyScene"),
} as const;

export type WorldId = keyof typeof WORLD_LOADERS;

export function isWorldId(id: string): id is WorldId {
  return id in WORLD_LOADERS;
}

export function loadWorld(id: string) {
  if (id === "photography") return WORLD_LOADERS.photography();
  if (id === "trading") return WORLD_LOADERS.trading();
  return Promise.resolve(null);
}
