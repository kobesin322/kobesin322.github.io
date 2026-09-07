import { useEffect, useRef } from "react";
import { computeTrade, type TradeDraft } from "./tradeMath";

type Props = {
  draft: TradeDraft;
};

export function RiskRewardChart({ draft }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const math = computeTrade(draft);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = el.clientWidth || 420;
      const height = 280;
      el.width = Math.floor(width * dpr);
      el.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const pad = { l: 72, r: 18, t: 18, b: 28 };
      const prices = [draft.stop, draft.entry, draft.target];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const span = Math.max(max - min, 0.0001);
      const y = (price: number) => pad.t + ((max - price) / span) * (height - pad.t - pad.b);
      const x0 = pad.l;
      const innerW = width - pad.l - pad.r;

      ctx.fillStyle = "#07141a";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#1c333c";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        const yy = pad.t + (i / 4) * (height - pad.t - pad.b);
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(width - pad.r, yy);
        ctx.stroke();
      }

      const entryY = y(draft.entry);
      const stopY = y(draft.stop);
      const targetY = y(draft.target);
      const riskTop = Math.min(entryY, stopY);
      const riskH = Math.abs(entryY - stopY);
      const rewardTop = Math.min(entryY, targetY);
      const rewardH = Math.abs(entryY - targetY);

      const riskW = innerW * 0.34;
      const rewardW = innerW * Math.min(0.72, 0.34 * Math.max(math.rr, 0.2));

      ctx.fillStyle = "rgba(255, 92, 106, 0.28)";
      ctx.fillRect(x0 + 8, riskTop, riskW, Math.max(riskH, 4));
      ctx.strokeStyle = "#ff5c6a";
      ctx.strokeRect(x0 + 8, riskTop, riskW, Math.max(riskH, 4));

      ctx.fillStyle = "rgba(62, 224, 160, 0.28)";
      ctx.fillRect(x0 + 8, rewardTop, rewardW, Math.max(rewardH, 4));
      ctx.strokeStyle = "#3ee0a0";
      ctx.strokeRect(x0 + 8, rewardTop, rewardW, Math.max(rewardH, 4));

      ctx.strokeStyle = "#ff8a3d";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x0, entryY);
      ctx.lineTo(width - pad.r, entryY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#8aa0aa";
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`TP ${draft.target.toFixed(2)}`, x0 - 8, targetY + 4);
      ctx.fillStyle = "#ff8a3d";
      ctx.fillText(`EN ${draft.entry.toFixed(2)}`, x0 - 8, entryY + 4);
      ctx.fillStyle = "#8aa0aa";
      ctx.fillText(`SL ${draft.stop.toFixed(2)}`, x0 - 8, stopY + 4);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ff5c6a";
      ctx.fillText("risk", x0 + 16, riskTop + Math.max(riskH, 16) / 2 + 4);
      ctx.fillStyle = "#3ee0a0";
      ctx.fillText("reward", x0 + 16, rewardTop + Math.max(rewardH, 16) / 2 + 4);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [draft, math.rr]);

  return (
    <div className="rr-chart">
      <canvas ref={canvas} aria-label="Risk and reward if this trade is opened" />
    </div>
  );
}
