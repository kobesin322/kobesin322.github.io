# site

Personal site for Kobe Sin. Hub-centric Starlink constellation: Vite + React + TypeScript + Three.js (React Three Fiber).

Work descriptions are public-layer only. Employer names are omitted on purpose.

## Develop

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

GitHub Pages deploys `dist/` from `main` via `.github/workflows/pages.yml`. Set the repo Pages source to **GitHub Actions** after the first successful workflow.

## Scene

- Land in the network. Drag to orbit.
- Click a star to fly in. The Hub is live. Trading and Photography are interiors — click the star again (or Enter world) to dive in.
- Photography’s star is a 3D camera, not a satellite. Leave world returns to that focused star.
- In the studio, click the camera (or Print gallery) for a 2D CSS coverflow of prints — no Three.js on that page. Swipe, drag, wheel, or arrows.
- In the trading pit, click **Run backtest** for a 2D walk-forward of three simple long/flat rules (dual MA, time-series momentum, Donchian). Equity curve and Sharpe animate in. Hash: `/#backtest`.
- Click a link to fly along it and read why the two domains connect.
- `Return`, the `KS` mark, or Escape goes back (gallery → studio / backtest → pit → focused star → overview).
- Share a star with a hash, e.g. `/#hub`, `/#trading`, `/#world/photography`, `/#gallery`, `/#backtest`.
