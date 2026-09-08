import { useEffect, useMemo, useState } from "react";
import { runBacktest, STRATEGIES, type StrategyId } from "./engine";

type Props = {
  reduceMotion: boolean;
};

function fmtPct(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function fmtNum(value: number, digits = 2) {
  return value.toFixed(digits);
}

function linePath(values: number[], width: number, height: number, min: number, max: number) {
  const span = max - min || 1;
  const padX = 8;
  const padY = 16;
  return values
    .map((value, i) => {
      const x = padX + (i / Math.max(1, values.length - 1)) * (width - padX * 2);
      const y = height - padY - ((value - min) / span) * (height - padY * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function Count({
  value,
  format,
  play,
  reduceMotion,
}: {
  value: number;
  format: (n: number) => string;
  play: boolean;
  reduceMotion: boolean;
}) {
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!play) {
      setShown(0);
      return;
    }
    if (reduceMotion) {
      setShown(value);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 720);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      setShown(value * eased);
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [play, reduceMotion, value]);

  return <>{format(shown)}</>;
}

export function BacktestPage({ reduceMotion }: Props) {
  const [id, setId] = useState<StrategyId>("trend");
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<"run" | "done">(reduceMotion ? "done" : "run");
  const result = useMemo(() => runBacktest(id), [id, run]);
  const done = phase === "done";

  useEffect(() => {
    setPhase(reduceMotion ? "done" : "run");
    if (reduceMotion) return;
    const timer = window.setTimeout(() => setPhase("done"), 920);
    return () => window.clearTimeout(timer);
  }, [id, run, reduceMotion]);

  const min = Math.min(...result.equity, ...result.buyHold);
  const max = Math.max(...result.equity, ...result.buyHold);
  const equityPath = linePath(result.equity, 800, 240, min, max);
  const holdPath = linePath(result.buyHold, 800, 240, min, max);
  const stats = [
    { label: "Sharpe", value: result.metrics.sharpe, format: (n: number) => fmtNum(n), hint: "rf 0 · ann." },
    { label: "CAGR", value: result.metrics.cagr, format: (n: number) => fmtPct(n), hint: "5y walk-forward" },
    { label: "Max DD", value: result.metrics.maxDd, format: (n: number) => fmtPct(-Math.abs(n)), hint: "peak to trough" },
    { label: "Sortino", value: result.metrics.sortino, format: (n: number) => fmtNum(n), hint: "downside vol" },
    { label: "Calmar", value: result.metrics.calmar, format: (n: number) => fmtNum(n), hint: "CAGR / max DD" },
    { label: "Win days", value: result.metrics.winRate, format: (n: number) => fmtPct(n, 0), hint: "when in the book" },
    { label: "Trades", value: result.metrics.trades, format: (n: number) => String(Math.round(n)), hint: "round turns" },
    { label: "Total", value: result.metrics.totalReturn, format: (n: number) => fmtPct(n), hint: "vs $1 start" },
  ];

  return (
    <section className={`backtest${done ? " is-done" : " is-run"}`} aria-label="Backtest simulation">
      <div className="bt-glow" aria-hidden="true" />
      <div className="bt-head">
        <p className="kicker bt-kicker">
          <span className="dot" />
          {result.strategy.kicker}
        </p>
        <div className="bt-title-row">
          <h2 className="serif bt-title">{result.strategy.title}</h2>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setRun((n) => n + 1);
            }}
          >
            Run again
          </button>
        </div>
        <p className="bt-note">{result.strategy.note}</p>
      </div>

      <ol className="bt-strats">
        {STRATEGIES.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`bt-strat${item.id === id ? " is-on" : ""}`}
              onClick={() => setId(item.id)}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="bt-stage">
        <div className="bt-chart" aria-hidden={!done}>
          <svg viewBox="0 0 800 240" preserveAspectRatio="none" className="bt-svg">
            <path className="bt-hold" d={holdPath} fill="none" pathLength={1} />
            <path className="bt-equity" d={equityPath} fill="none" pathLength={1} />
          </svg>
          {!done && (
            <div className="bt-scan" aria-hidden="true">
              <span>Walking forward · no look-ahead</span>
            </div>
          )}
          <p className="bt-legend">
            <span className="bt-leg bt-leg-rule">Rule</span>
            <span className="bt-leg bt-leg-hold">Buy &amp; hold</span>
          </p>
        </div>

        <ul className="bt-stats">
          {stats.map((stat, i) => (
            <li key={stat.label} style={{ animationDelay: done && !reduceMotion ? `${0.08 + i * 0.06}s` : "0s" }}>
              <p>{stat.label}</p>
              <strong>
                <Count value={stat.value} format={stat.format} play={done} reduceMotion={reduceMotion} />
              </strong>
              <span>{stat.hint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bt-months" aria-label="Monthly returns">
        {result.monthly.map((month, i) => (
          <span
            key={month.label}
            className={`bt-month${month.value >= 0 ? " is-up" : " is-down"}`}
            title={`${month.label} ${fmtPct(month.value)}`}
            style={{
              ["--w" as string]: String(Math.min(1, Math.abs(month.value) / 0.08)),
              animationDelay: done && !reduceMotion ? `${0.35 + i * 0.012}s` : "0s",
            }}
          />
        ))}
      </div>
      <p className="bt-foot">
        Synthetic daily series (seed 322) · 2020–2025 · 5 bps per turn · buy &amp; hold Sharpe{" "}
        {fmtNum(result.holdMetrics.sharpe)} · {fmtPct(result.holdMetrics.totalReturn)} total. Not a live track
        record.
      </p>
    </section>
  );
}
