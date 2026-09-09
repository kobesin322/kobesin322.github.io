/**
 * DATA — swap this object with a real backtest dump.
 *
 * Months run DATA.start → DATA.end inclusive (YYYY-MM).
 * Each strategy.equity is monthly *cumulative* profit in R, same length as that span.
 * Combined is the per-month sum of the three unless DATA.combined is a number[].
 *
 *   DATA.strategies[n].equity[i]  →  cumulative R at month i
 *   DATA.combined                 →  optional override, same length
 *   DATA.basket                   →  footer stats (not derived from the chart)
 */
const DATA = {
  start: "2019-01",
  end: "2026-08",
  axisEnd: "2027-01",
  combined: null,
  strategies: [
    {
      id: "ts_momentum_winner_bias",
      timeframe: "H1",
      color: "#3b82f6",
      description:
        "Gold pushes unusually fast in one direction and the trend agrees - it buys the continuation.",
      trades: 1562,
      winRate: 50,
      profitFactor: 1.19,
      contribution: 145,
      equity: null,
    },
    {
      id: "kurze_ma_trendfolge",
      timeframe: "H1",
      color: "#eab308",
      description:
        "Price crosses its short moving average while that average turns the same way. It exits on the opposite cross.",
      trades: 1250,
      winRate: 30,
      profitFactor: 1.26,
      contribution: 153,
      equity: null,
    },
    {
      id: "high_proximity_momentum",
      timeframe: "M30",
      color: "#22c55e",
      description:
        "Gold sits close to the high of the last few weeks and takes out a new one - it buys proximity to the high.",
      trades: 796,
      winRate: 51,
      profitFactor: 1.27,
      contribution: 100,
      equity: null,
    },
  ],
  basket: {
    trades: 3608,
    profitFactor: 1.23,
    rPerTrade: 0.11,
    tStat: 4.72,
    quality: "98 %",
    accountReturn: "512 %",
    riskPerTrade: "1.5 %",
    venue: "XAUUSD (Vantage)",
    window: "January 2019 to August 2026",
  },
};

const WAYPOINTS = {
  ts_momentum_winner_bias: [
    ["2019-01", 0],
    ["2020-01", 9],
    ["2021-01", 24],
    ["2022-01", 41],
    ["2022-09", 31],
    ["2023-06", 30],
    ["2024-01", 52],
    ["2025-01", 92],
    ["2026-01", 124],
    ["2026-08", 145],
  ],
  kurze_ma_trendfolge: [
    ["2019-01", 0],
    ["2020-01", 11],
    ["2021-01", 26],
    ["2022-01", 46],
    ["2022-09", 37],
    ["2023-06", 40],
    ["2024-01", 58],
    ["2025-01", 98],
    ["2026-01", 134],
    ["2026-08", 153],
  ],
  high_proximity_momentum: [
    ["2019-01", 0],
    ["2020-01", 7],
    ["2021-01", 19],
    ["2022-01", 33],
    ["2022-09", 22],
    ["2023-06", 27],
    ["2024-01", 44],
    ["2025-01", 70],
    ["2026-01", 90],
    ["2026-08", 100],
  ],
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function monthList(start, end) {
  const out = [];
  let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function equityFromWaypoints(months, waypoints, seed) {
  const rng = mulberry32(seed);
  const keys = waypoints.map(([t, v]) => ({ i: months.indexOf(t), v }));
  const values = new Array(months.length).fill(0);
  for (let p = 0; p < keys.length - 1; p += 1) {
    const a = keys[p];
    const b = keys[p + 1];
    const span = Math.max(1, b.i - a.i);
    for (let i = a.i; i <= b.i; i += 1) {
      const t = (i - a.i) / span;
      values[i] = a.v + (b.v - a.v) * t;
    }
  }
  for (let i = 1; i < values.length - 1; i += 1) {
    if (keys.some((k) => k.i === i)) continue;
    values[i] += (rng() - 0.46) * 2.45 + Math.sin(i * 0.73) * 0.85;
  }
  values[0] = keys[0].v;
  values[values.length - 1] = keys[keys.length - 1].v;
  return values.map((v) => Math.round(v * 10) / 10);
}

function padToAxis(values, dataMonths, axisMonths) {
  return axisMonths.map((m) => {
    const i = dataMonths.indexOf(m);
    return i === -1 ? null : values[i];
  });
}

function formatR(n) {
  const abs = Math.abs(n).toFixed(0);
  return `${n >= 0 ? "+" : "−"}${abs} R`.replace("−-", "−");
}

function formatTrades(n) {
  return n.toLocaleString("en-US");
}

const DATA_MONTHS = monthList(DATA.start, DATA.end);
const AXIS_MONTHS = monthList(DATA.start, DATA.axisEnd);

DATA.strategies.forEach((strategy, i) => {
  if (!strategy.equity) {
    strategy.equity = equityFromWaypoints(
      DATA_MONTHS,
      WAYPOINTS[strategy.id],
      1100 + i * 97,
    );
  }
});

function combinedEquity() {
  if (Array.isArray(DATA.combined)) return DATA.combined;
  const len = DATA.strategies[0].equity.length;
  return Array.from({ length: len }, (_, i) => {
    const sum = DATA.strategies.reduce((acc, s) => acc + s.equity[i], 0);
    return Math.round(sum * 10) / 10;
  });
}

function renderCards() {
  const root = document.getElementById("strategy-cards");
  root.innerHTML = DATA.strategies
    .map(
      (s) => `
      <article class="card">
        <div class="card-bar" style="background:${s.color}"></div>
        <div class="card-body">
          <div class="card-top">
            <h2 class="card-id">${s.id}</h2>
            <span class="tf">${s.timeframe}</span>
          </div>
          <p class="card-desc">${s.description}</p>
          <div class="stats">
            <div>
              <span class="stat-label">Trades</span>
              <span class="stat-value">${formatTrades(s.trades)}</span>
            </div>
            <div>
              <span class="stat-label">Win rate</span>
              <span class="stat-value">${s.winRate}%</span>
            </div>
            <div>
              <span class="stat-label">Profit factor</span>
              <span class="stat-value">${s.profitFactor.toFixed(2)}</span>
            </div>
            <div>
              <span class="stat-label">Contribution</span>
              <span class="stat-value is-pos">${formatR(s.contribution)}</span>
            </div>
          </div>
        </div>
      </article>`,
    )
    .join("");
}

function renderFooter() {
  const b = DATA.basket;
  document.getElementById("basket-footer").innerHTML = `
    <p class="foot-line">
      <span class="n">${formatTrades(b.trades)}</span> trades
      &nbsp;·&nbsp; profit factor <span class="n">${b.profitFactor.toFixed(2)}</span>
      &nbsp;·&nbsp; <span class="n">+${b.rPerTrade.toFixed(3)} R</span> per trade
      &nbsp;·&nbsp; t = <span class="n">+${b.tStat.toFixed(2)}</span>
    </p>
    <p class="foot-note">
      Real-tick backtest on ${b.venue}, ${b.quality} history quality, ${b.window}, spread and commission included.<br />
      The traded account turned that into +${b.accountReturn} at ${b.riskPerTrade} risk per trade. Past results are no promise of future performance.
    </p>
  `;
}

const endLabelPlugin = {
  id: "endLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((ds, index) => {
      const meta = chart.getDatasetMeta(index);
      if (!meta || meta.hidden) return;
      let last = null;
      for (let i = meta.data.length - 1; i >= 0; i -= 1) {
        const pt = meta.data[i];
        if (pt && ds.data[i] != null && Number.isFinite(pt.x)) {
          last = pt;
          break;
        }
      }
      if (!last) return;
      ctx.save();
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      ctx.fillStyle = ds.borderColor;
      ctx.textBaseline = "middle";
      ctx.fillText(ds.endLabel, last.x + 8, last.y);
      ctx.restore();
    });
  },
};

function yearTick(value, months) {
  const label = months[value];
  if (!label || !label.endsWith("-01")) return "";
  const year = Number(label.slice(0, 4));
  if (year < 2020) return "";
  return String(year);
}

function buildChart() {
  const combined = combinedEquity();
  const byId = Object.fromEntries(DATA.strategies.map((s) => [s.id, s]));
  const yellow = byId.kurze_ma_trendfolge;
  const blue = byId.ts_momentum_winner_bias;
  const green = byId.high_proximity_momentum;
  const lastCombined = combined[combined.length - 1];

  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = "#5d6b80";

  const canvas = document.getElementById("equity-chart");
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: AXIS_MONTHS,
      datasets: [
        {
          label: yellow.id,
          data: padToAxis(yellow.equity, DATA_MONTHS, AXIS_MONTHS),
          borderColor: yellow.color,
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.18,
          endLabel: formatR(yellow.contribution),
        },
        {
          label: blue.id,
          data: padToAxis(blue.equity, DATA_MONTHS, AXIS_MONTHS),
          borderColor: blue.color,
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.18,
          endLabel: formatR(blue.contribution),
        },
        {
          label: green.id,
          data: padToAxis(green.equity, DATA_MONTHS, AXIS_MONTHS),
          borderColor: green.color,
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.18,
          endLabel: formatR(green.contribution),
        },
        {
          label: "all three combined",
          data: padToAxis(combined, DATA_MONTHS, AXIS_MONTHS),
          borderColor: "#f4f7fb",
          borderWidth: 2.4,
          pointRadius: 0,
          pointHoverRadius: 3.5,
          tension: 0.16,
          endLabel: formatR(Math.round(lastCombined)),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      layout: { padding: { top: 8, right: 58, left: 2, bottom: 4 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#152033",
          borderColor: "#1e2c42",
          borderWidth: 1,
          titleColor: "#e8edf5",
          bodyColor: "#e8edf5",
          bodySpacing: 4,
          padding: 10,
          itemSort(a, b) {
            return b.datasetIndex - a.datasetIndex;
          },
          callbacks: {
            title(items) {
              const m = AXIS_MONTHS[items[0].dataIndex];
              if (!m) return "";
              const [y, mo] = m.split("-");
              const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              return `${names[Number(mo) - 1]} ${y}`;
            },
            label(item) {
              if (item.parsed.y == null) return null;
              return ` ${item.dataset.label}: ${item.parsed.y.toFixed(1)} R`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#5d6b80",
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: false,
            callback(_, index) {
              return yearTick(index, AXIS_MONTHS);
            },
          },
        },
        y: {
          min: 0,
          max: 400,
          ticks: {
            color: "#5d6b80",
            font: { size: 11 },
            stepSize: 100,
            callback(value) {
              return value;
            },
          },
          grid: {
            color(ctx) {
              return ctx.tick.value === 0 ? "transparent" : "#1a2740";
            },
            lineWidth: 1,
          },
          border: { display: false },
        },
      },
    },
    plugins: [
      endLabelPlugin,
      {
        id: "zeroDash",
        beforeDatasetsDraw(chart) {
          const yScale = chart.scales.y;
          const { left, right } = chart.chartArea;
          const y = yScale.getPixelForValue(0);
          const ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "#3d516c";
          ctx.lineWidth = 1;
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
          ctx.stroke();
          ctx.restore();
        },
      },
    ],
  });
}

renderCards();
renderFooter();
buildChart();
