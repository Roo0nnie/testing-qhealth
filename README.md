# QHealth (Insight-Genie)

React web app for **camera-based health scans** using the [Insight-Genie](https://insightgenie.ai) API. The scan runs inside an embedded Insight-Genie iframe; results are mapped to vitals, shown in the UI, and can be forwarded to a **GALE** backend when configured.

Package name: `qhealth-insight-genie-app`.

## Quick start

### Prerequisites

- Node.js 18.12+ and pnpm 10+
- Webcam access in the browser
- Insight-Genie API credentials (base URL, API key, API secret)

### First-time setup

Use pnpm for this project. Do not run `npm install`; the repo is configured with
`pnpm-lock.yaml` and `packageManager`.

```powershell
pnpm install
```

If this is your first local setup, create `.env` from the example file and fill
in your real credentials:

```powershell
Copy-Item .env_example .env
```

### Run locally without build/tooling warnings

Run the commands in this order:

```powershell
pnpm install
pnpm run build
pnpm run dev
```

- `pnpm install` installs the exact dependency set from `pnpm-lock.yaml`.
- `pnpm run build` verifies the production bundle and writes `dist/`.
- `pnpm run dev` starts the HTTPS webpack dev server with hot reload.

The dev server uses **HTTPS** on port **8001** by default. Open
`https://10.10.0.5:8001/` when `WEBPACK_DEV_SERVER_HOST=10.10.0.5`, or set
`WEBPACK_DEV_SERVER_HOST=localhost` in `.env` and open `https://localhost:8001/`.
Accept the browser warning for the self-signed certificate.

If port `8001` is already in use, stop the old dev server or change
`WEBPACK_DEV_SERVER_PORT` in `.env`.

If you access the dev server through a **tunnel / public domain** (e.g.
`https://qhealth-webbased.quanbyit.com/`), keep `WEBPACK_DEV_SERVER_PUBLIC_URL`
unset unless you need to force the HMR WebSocket to a specific URL/path (for
reverse proxies that expose the WS endpoint at a custom path like `/ws`).

### Environment variables

Copy `.env_example` to `.env` and set:

| Variable | Purpose |
| -------- | ------- |
| `INSIGHT_GENIE_BASE_URL` | Insight-Genie API base (e.g. `https://api.insightgenie.ai`) |
| `INSIGHT_GENIE_API_KEY` | API key |
| `INSIGHT_GENIE_API_SECRET` | API secret |

Webpack injects these at build time (see `webpack.config.js`).

Optional **GALE** integration (posting scan results to your backend):

| Variable | Purpose |
| -------- | ------- |
| `GALE_API_BASE_URL` | GALE API base URL |
| `GALE_API_KEY` | GALE API key |
| `GALE_SCAN_SOURCE_SYSTEM_NAME` | Source system name (default: `QHealth System`) |
| `GALE_SCAN_SOURCE_PUBLISHER` | Publisher label (default: `QHealth`) |
| `GALE_API_ENABLED` | Set to `false` to disable GALE calls |

### Using the app

1. Ensure `.env` has valid Insight-Genie variables.
2. Open the dev URL, allow camera when prompted.
3. Complete the face scan in the Insight-Genie flow; vitals and health-style results appear when the scan finishes.

There is **no** Biosense Signal SDK or separate “license key” field in this branch—authentication is via Insight-Genie env vars.

## Documentation

- **[GALE_API_INTEGRATION_GUIDE.md](./GALE_API_INTEGRATION_GUIDE.md)** — embedding the scan URL in third-party apps and receiving results at a GALE endpoint.

## Scripts

- `pnpm run dev` — webpack dev server (hot reload, HTTPS)
- `pnpm run build` — production build to `dist/`
- `pnpm run vercel-build` — same as `pnpm run build` (for Vercel)
- `pnpm run format` / `pnpm run format:check` — Prettier

## Features

- Insight-Genie **video iframe** flow: auth token, iframe URL, postMessage-driven scan state
- Mapped vitals and structured **health results** (categories such as cardiovascular, HRV, blood-related, etc.)
- Session hooks for **QHealth client API** events (session created, measurement started/complete)
- Optional **GALE** submission after a successful scan
- Responsive layout; Tailwind-based UI components

## Tech stack

- React 17, TypeScript
- Webpack 5
- Tailwind CSS, Radix UI, styled patterns from existing components
- Insight-Genie HTTP API (`src/services/insightGenieAPI.ts`) and adapter (`src/services/insightGenieAdapter.ts`)

## Browser support

Recent Chrome, Edge, Firefox, and Safari (camera and secure context required for scanning).

## License / credentials

This application does not ship Insight-Genie or GALE credentials. You must obtain API access from the respective providers and configure `.env` accordingly.
