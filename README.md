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
- Click a star to fly in. The Hub (`Kobe Sin`) is the only live interior; other stars are concept stubs.
- Click a link to fly along it and read why the two domains connect.
- `Return`, the `KS` mark, or Escape goes back to the overview.
- Share a star with a hash, e.g. `/#hub` or `/#forecasting`.
