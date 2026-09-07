import { useMemo, useState, type ChangeEvent } from "react";
import { computeTrade, type TradeDraft } from "./tradeMath";
import { RiskRewardChart } from "./RiskRewardChart";

const initial: TradeDraft = {
  equity: 20000,
  riskPct: 0.5,
  entry: 184.2,
  stop: 181.8,
  target: 191.4,
};

export function TradingDesk() {
  const [draft, setDraft] = useState<TradeDraft>(initial);
  const math = useMemo(() => computeTrade(draft), [draft]);

  const set = (key: keyof TradeDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="world-desk" style={{ ["--accent" as string]: "#ff8a3d" }}>
      <p className="kicker">
        <span className="dot" />
        Trading world · pioneer
      </p>
      <h2 className="serif">Open a trade</h2>
      <p className="panel-tagline">
        Submerged desk. Size the risk before the story. Reward must outrun the stop.
      </p>

      <form className="trade-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Equity
          <input type="number" value={draft.equity} min={100} step={100} onChange={set("equity")} />
        </label>
        <label>
          Risk %
          <input type="number" value={draft.riskPct} min={0.1} max={5} step={0.1} onChange={set("riskPct")} />
        </label>
        <label>
          Entry
          <input type="number" value={draft.entry} step={0.1} onChange={set("entry")} />
        </label>
        <label>
          Stop
          <input type="number" value={draft.stop} step={0.1} onChange={set("stop")} />
        </label>
        <label>
          Target
          <input type="number" value={draft.target} step={0.1} onChange={set("target")} />
        </label>
      </form>

      <RiskRewardChart draft={draft} />

      <div className="trade-out">
        <div>
          <span className="muted">Side</span>
          <strong>{math.side}</strong>
        </div>
        <div>
          <span className="muted">R : R</span>
          <strong>1 : {math.rr.toFixed(2)}</strong>
        </div>
        <div>
          <span className="muted">Risk $</span>
          <strong>${math.riskDollars.toFixed(0)}</strong>
        </div>
        <div>
          <span className="muted">Reward $</span>
          <strong>${math.rewardDollars.toFixed(0)}</strong>
        </div>
        <div>
          <span className="muted">Size</span>
          <strong>{math.qty.toFixed(0)}</strong>
        </div>
      </div>
    </section>
  );
}
