export type TradeDraft = {
  equity: number;
  riskPct: number;
  entry: number;
  stop: number;
  target: number;
};

export type TradeMath = {
  riskPerShare: number;
  rewardPerShare: number;
  rr: number;
  riskDollars: number;
  rewardDollars: number;
  qty: number;
  side: "long" | "short";
};

export function computeTrade(draft: TradeDraft): TradeMath {
  const side: "long" | "short" = draft.target >= draft.entry ? "long" : "short";
  const riskPerShare = Math.abs(draft.entry - draft.stop);
  const rewardPerShare = Math.abs(draft.target - draft.entry);
  const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
  const riskDollars = draft.equity * (draft.riskPct / 100);
  const qty = riskPerShare > 0 ? riskDollars / riskPerShare : 0;
  const rewardDollars = qty * rewardPerShare;
  return { riskPerShare, rewardPerShare, rr, riskDollars, rewardDollars, qty, side };
}
