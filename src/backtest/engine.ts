export type StrategyId = "trend" | "momentum" | "breakout";

export type StrategySpec = {
  id: StrategyId;
  title: string;
  kicker: string;
  note: string;
};

export const STRATEGIES: StrategySpec[] = [
  {
    id: "trend",
    title: "Dual moving average",
    kicker: "20 / 100 SMA · long / flat",
    note: "Long when the fast average is above the slow. Flat otherwise. The rule is the trend, not a forecast.",
  },
  {
    id: "momentum",
    title: "Time-series momentum",
    kicker: "126-day return · long / flat",
    note: "Long if the last half-year is up. Cash if it is not. Same check every close.",
  },
  {
    id: "breakout",
    title: "Donchian breakout",
    kicker: "40-day high · 15-day exit",
    note: "Buy a close above the prior 40-day high. Exit a 15-day low. Stops are written down.",
  },
];

export type BacktestMetrics = {
  totalReturn: number;
  cagr: number;
  vol: number;
  sharpe: number;
  sortino: number;
  maxDd: number;
  calmar: number;
  winRate: number;
  trades: number;
  profitFactor: number;
};

export type BacktestResult = {
  strategy: StrategySpec;
  prices: number[];
  equity: number[];
  buyHold: number[];
  daily: number[];
  monthly: { label: string; value: number }[];
  metrics: BacktestMetrics;
  holdMetrics: BacktestMetrics;
};

const DAYS = 252 * 5;
const COST = 0.0005;
const START = new Date(2020, 0, 2);

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng: () => number) {
  const u = Math.max(1e-12, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function tradingDays(start: Date, count: number): Date[] {
  const out: Date[] = [];
  const cursor = new Date(start);
  while (out.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function generateMarket(seed = 322) {
  const rng = mulberry32(seed);
  const dates = tradingDays(START, DAYS);
  const prices = new Array<number>(DAYS);
  let price = 100;
  let lastR = 0;
  for (let i = 0; i < DAYS; i += 1) {
    const wave = Math.sin((2 * Math.PI * i) / 400);
    const mu = (0.135 + 0.08 * wave) / 252;
    let crash = 0;
    if (i >= 400 && i < 412) crash = -0.009;
    else if (i >= 790 && i < 808) crash = -0.01;
    const shock = (0.145 / Math.sqrt(252)) * randn(rng);
    const r = mu + shock + crash + 0.08 * lastR;
    lastR = r;
    price *= 1 + r;
    prices[i] = price;
  }
  return { dates, prices };
}

let market: { dates: Date[]; prices: number[] } | null = null;

export function getMarket() {
  if (!market) market = generateMarket();
  return market;
}

function smaAt(values: number[], i: number, n: number): number | null {
  if (i + 1 < n) return null;
  let sum = 0;
  for (let k = i - n + 1; k <= i; k += 1) sum += values[k];
  return sum / n;
}

function maxRange(values: number[], from: number, to: number) {
  let m = values[from];
  for (let i = from + 1; i < to; i += 1) if (values[i] > m) m = values[i];
  return m;
}

function minRange(values: number[], from: number, to: number) {
  let m = values[from];
  for (let i = from + 1; i < to; i += 1) if (values[i] < m) m = values[i];
  return m;
}

function positionsFor(id: StrategyId, prices: number[]): number[] {
  const n = prices.length;
  const pos = new Array<number>(n).fill(0);
  if (id === "trend") {
    for (let i = 0; i < n; i += 1) {
      const fast = smaAt(prices, i, 20);
      const slow = smaAt(prices, i, 100);
      pos[i] = fast !== null && slow !== null && fast > slow ? 1 : 0;
    }
    return pos;
  }
  if (id === "momentum") {
    for (let i = 0; i < n; i += 1) {
      if (i < 126) pos[i] = 0;
      else pos[i] = prices[i] / prices[i - 126] - 1 > 0 ? 1 : 0;
    }
    return pos;
  }
  let held = 0;
  for (let i = 0; i < n; i += 1) {
    if (i < 40) {
      pos[i] = 0;
      continue;
    }
    const priorHigh = maxRange(prices, i - 40, i);
    const priorLow = minRange(prices, Math.max(0, i - 15), i);
    if (held === 0 && prices[i] > priorHigh) held = 1;
    else if (held === 1 && prices[i] < priorLow) held = 0;
    pos[i] = held;
  }
  return pos;
}

function simulate(prices: number[], pos: number[]) {
  const n = prices.length;
  const equity = new Array<number>(n);
  const daily = new Array<number>(n).fill(0);
  equity[0] = 1;
  let prev = pos[0];
  let trades = 0;
  let win = 0;
  let loss = 0;
  let gain = 0;
  let hurt = 0;
  for (let i = 1; i < n; i += 1) {
    const held = pos[i - 1];
    const asset = prices[i] / prices[i - 1] - 1;
    const turn = Math.abs(held - prev);
    if (turn > 0.5) trades += 1;
    const r = held * asset - COST * turn;
    daily[i] = r;
    equity[i] = equity[i - 1] * (1 + r);
    if (r > 0) {
      win += 1;
      gain += r;
    } else if (r < 0) {
      loss += 1;
      hurt += -r;
    }
    prev = held;
  }
  return { equity, daily, trades, win, loss, gain, hurt };
}

function metricsOf(
  equity: number[],
  daily: number[],
  trades: number,
  win: number,
  loss: number,
  gain: number,
  hurt: number,
): BacktestMetrics {
  const n = daily.length - 1;
  const years = n / 252;
  const mean =
    daily.slice(1).reduce((sum, r) => sum + r, 0) / Math.max(1, n);
  const variance =
    daily.slice(1).reduce((sum, r) => sum + (r - mean) * (r - mean), 0) / Math.max(1, n);
  const downside =
    daily
      .slice(1)
      .filter((r) => r < 0)
      .reduce((sum, r) => sum + r * r, 0) / Math.max(1, n);
  const vol = Math.sqrt(variance * 252);
  const downVol = Math.sqrt(downside * 252);
  const totalReturn = equity[equity.length - 1] - 1;
  const cagr = Math.pow(equity[equity.length - 1], 1 / years) - 1;
  let peak = equity[0];
  let maxDd = 0;
  for (const value of equity) {
    if (value > peak) peak = value;
    const dd = peak > 0 ? 1 - value / peak : 0;
    if (dd > maxDd) maxDd = dd;
  }
  const sharpe = vol > 0 ? (mean * 252) / vol : 0;
  const sortino = downVol > 0 ? (mean * 252) / downVol : 0;
  const calmar = maxDd > 0 ? cagr / maxDd : 0;
  const decided = win + loss;
  return {
    totalReturn,
    cagr,
    vol,
    sharpe,
    sortino,
    maxDd,
    calmar,
    winRate: decided > 0 ? win / decided : 0,
    trades,
    profitFactor: hurt > 0 ? gain / hurt : gain > 0 ? 99 : 0,
  };
}

function monthlyFrom(dates: Date[], equity: number[]) {
  const buckets = new Map<string, { first: number; last: number }>();
  for (let i = 0; i < dates.length; i += 1) {
    const d = dates[i];
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = buckets.get(key);
    if (!cur) buckets.set(key, { first: equity[i], last: equity[i] });
    else cur.last = equity[i];
  }
  return [...buckets.entries()].map(([label, pair]) => ({
    label,
    value: pair.last / pair.first - 1,
  }));
}

function holdPositions(n: number) {
  return new Array<number>(n).fill(1);
}

export function runBacktest(id: StrategyId): BacktestResult {
  const spec = STRATEGIES.find((item) => item.id === id) ?? STRATEGIES[0];
  const { dates, prices } = getMarket();
  const pos = positionsFor(spec.id, prices);
  const sim = simulate(prices, pos);
  const hold = simulate(prices, holdPositions(prices.length));
  return {
    strategy: spec,
    prices,
    equity: sim.equity,
    buyHold: hold.equity,
    daily: sim.daily,
    monthly: monthlyFrom(dates, sim.equity),
    metrics: metricsOf(sim.equity, sim.daily, sim.trades, sim.win, sim.loss, sim.gain, sim.hurt),
    holdMetrics: metricsOf(hold.equity, hold.daily, hold.trades, hold.win, hold.loss, hold.gain, hold.hurt),
  };
}
