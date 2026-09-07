import type { EdgeLink, StarNode } from "../types";

export const STARS: StarNode[] = [
  {
    id: "hub",
    title: "Kobe Sin",
    tagline: "Analyst Programmer · forecasts, dashboards, tools that compound",
    kicker: "Hong Kong · systems work",
    position: [0, 2.2, 0],
    color: "#d4a017",
    status: "live",
    lede: "I build pipelines that turn messy operational data into a decision someone can act on. Same shape at work and after hours: contract the data, fail loudly, put the next action on a screen.",
    meta: ["~5 yrs shipping", "Python · JS · SQL", "HK"],
    bullets: [
      "Production systems need reliability. Side projects need iteration speed.",
      "Both share one loop: data in, a decision out, an interface that can explain itself.",
      "Public-layer descriptions only — work details omit employers and internal systems.",
    ],
    stack: [
      {
        title: "Production",
        body: "Python · PyTorch · MySQL / SQL Server · JavaScript · HTML5 / CSS · Linux / K8s",
      },
      {
        title: "Side systems",
        body: "TypeScript · React · Vite · Pine Script · agent workflows · Vercel",
      },
      {
        title: "How I work",
        body: "Write the data contract and failure modes before the model. A dashboard should answer what to do next, not just print accuracy.",
      },
    ],
  },
  {
    id: "forecasting",
    title: "Forecasting",
    tagline: "Load forecasting · ML ops",
    kicker: "ML · Operations",
    position: [4.6, 4.1, -3.8],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Time-series forecasts for building and system load.",
      "The work is data quality, feature windows, walk-forward checks, and a dashboard — not a list of model names.",
      "Public layer: window the series, block leakage, score intervals, then show the action.",
    ],
    chips: ["Python", "PyTorch", "MySQL", "GPU / K8s"],
  },
  {
    id: "dashboards",
    title: "Dashboards",
    tagline: "Learning analytics · product views",
    kicker: "Product · Analytics",
    position: [3.8, 0.2, 3.6],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Internal views for progress and anomalies.",
      "Legacy stack: HTML5 / CSS / JS / MySQL.",
      "Value is query shape, permission edges, and whether one chart answers a real question.",
    ],
    chips: ["JavaScript", "MySQL", "HTML5"],
  },
  {
    id: "trading",
    title: "Trading",
    tagline: "Trade Road · journal and review",
    kicker: "Side · Trading ops",
    position: [-4.8, 4.6, 3.2],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Journal and review loop for live trading ops.",
      "Split a good trade into setup, risk, and management instead of narrating P&L after the fact.",
      "Built to sit next to a written playbook.",
    ],
    chips: ["Journal", "Review loop", "Vercel"],
  },
  {
    id: "agents",
    title: "Agents",
    tagline: "Daily digest · structured extract",
    kicker: "Side · Agents",
    position: [-3.4, 1.2, 4.8],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Pull public investing posts into a fixed daily digest.",
      "The point is stable extract, denoise, and reruns — not a one-shot prompt demo.",
    ],
    chips: ["Python", "Structured output", "Schedulers"],
  },
  {
    id: "geo",
    title: "Geo",
    tagline: "GeoMock · regional tells",
    kicker: "Side · Geo",
    position: [1.2, 6.8, -3.6],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Study tooling for regional tells.",
      "Turn intuition into reviewable cards and comparison charts.",
      "Same move as the rest of the work: write the rule down.",
    ],
    chips: ["Visual systems", "Study cards"],
  },
  {
    id: "craft",
    title: "Craft",
    tagline: "Live demos · widgets that run",
    kicker: "Demos",
    position: [-2.6, -0.6, -3.4],
    color: "#8faf6a",
    status: "concept",
    bullets: [
      "Screenshots are weak evidence. Widgets should run in the page.",
      "Synthetic load forecast: 48-hour baseline and a prediction band.",
      "Position sizer: equity × risk% ÷ stop distance — size you can lose.",
    ],
    chips: ["Canvas", "Forecast band", "Position sizer"],
  },
];

export const EDGES: EdgeLink[] = [
  { id: "hub-forecasting", from: "hub", to: "forecasting", label: "Data in, a decision out" },
  { id: "hub-dashboards", from: "hub", to: "dashboards", label: "Interface that can explain itself" },
  { id: "hub-trading", from: "hub", to: "trading", label: "Same loop after hours" },
  { id: "hub-agents", from: "hub", to: "agents", label: "Stable extract, denoise, reruns" },
  { id: "hub-geo", from: "hub", to: "geo", label: "Write the rule down" },
  { id: "hub-craft", from: "hub", to: "craft", label: "Screenshots are weak evidence" },
  {
    id: "forecasting-dashboards",
    from: "forecasting",
    to: "dashboards",
    label: "Forecasting feeds Dashboards",
  },
  { id: "trading-craft", from: "trading", to: "craft", label: "Sizer lives with the journal" },
  { id: "agents-dashboards", from: "agents", to: "dashboards", label: "Digest becomes a view" },
];

export const STAR_MAP: Record<string, StarNode> = Object.fromEntries(
  STARS.map((star) => [star.id, star]),
);

export const EDGE_MAP: Record<string, EdgeLink> = Object.fromEntries(
  EDGES.map((edge) => [edge.id, edge]),
);

export function getStar(id: string): StarNode {
  const star = STAR_MAP[id];
  if (!star) throw new Error(`Unknown star: ${id}`);
  return star;
}

export function getEdge(id: string): EdgeLink {
  const edge = EDGE_MAP[id];
  if (!edge) throw new Error(`Unknown edge: ${id}`);
  return edge;
}

export function parseSelectionHash(hash: string): { kind: "star" | "edge"; id: string } | null {
  const id = hash.replace(/^#/, "").trim();
  if (!id) return null;
  if (STAR_MAP[id]) return { kind: "star", id };
  if (EDGE_MAP[id]) return { kind: "edge", id };
  return null;
}
