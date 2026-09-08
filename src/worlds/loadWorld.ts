export const WORLD_LOADERS = {
  trading: () => import("./TradingScene"),
  photography: () => import("./PhotographyScene"),
  poker: () => import("./PokerScene"),
} as const;

export type WorldId = keyof typeof WORLD_LOADERS;

export function isWorldId(id: string): id is WorldId {
  return id in WORLD_LOADERS;
}

export function loadWorld(id: string) {
  if (id === "photography") return WORLD_LOADERS.photography();
  if (id === "trading") return WORLD_LOADERS.trading();
  if (id === "poker") return WORLD_LOADERS.poker();
  return Promise.resolve(null);
}
