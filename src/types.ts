export type Vec3 = [number, number, number];

export type StarStatus = "live" | "concept";

export type StarNode = {
  id: string;
  title: string;
  tagline: string;
  kicker?: string;
  position: Vec3;
  /** Display / emissive hex. */
  color: string;
  /**
   * Relative brightness 0–1. Hub is 1 so it always outshines domain stars.
   * Used for glow scale, emissive intensity, and beam mix.
   */
  luminosity: number;
  /** If set, a second click dives into this interior world. */
  world?: "trading" | "photography";
  status: StarStatus;
  lede?: string;
  meta?: string[];
  bullets: string[];
  chips?: string[];
  stack?: { title: string; body: string }[];
};

export type EdgeLink = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type Selection =
  | { kind: "none" }
  | { kind: "star"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "world"; id: string }
  | { kind: "gallery" };
