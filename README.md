# TaskStack

TaskStack is a developer-focused “productivity OS” built with **Next.js 15** and **Tambo AI**. It combines a multi-tool productivity dashboard (Pomodoro, skill challenges, links, energy tracking, creative tools, and more) with an AI side panel that can call server-side tools and render interactive UI components.

> **Security note:** The current “workspace PIN” model is for local/demo use only. Don’t deploy publicly without real authentication/authorization.

## What’s in the app

- **Dashboard**: daily overview (Pomodoro count, challenges, recent links, current energy, and other key signals)
- **Pomodoro timer**: sessions tracked in Redis
- **Skills Track**: “skill challenges” you can complete (and optionally expand into steps + resources via OpenRouter)
- **Links**: save / tag / browse useful links
- **Energy**: log and visualize energy levels; switches to a recovery view when energy is low
- **Slow Productivity rules**: built-in reference
- **Creative tools**: distractions journal, code snippets, standup log, energy mapper, weekly review
- **Workspace onboarding**: create a new workspace (PIN) and optionally generate a starter setup via OpenRouter
- **AI side panel**: Tambo chat that can use the registered tools/components

## Quickstart

### Prereqs

- Node.js (this repo uses `npm` via `package-lock.json`)
- A **Tambo** API key (set as `NEXT_PUBLIC_TAMBO_API_KEY`)
- **Upstash Redis** credentials
- An **OpenRouter** API key (only required for AI workspace setup + challenge expansion)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` (you can start from `example.env.local`) and set:

```bash
# Tambo
NEXT_PUBLIC_TAMBO_API_KEY=...

# Optional: only needed if you’re running the Tambo API server yourself
NEXT_PUBLIC_TAMBO_URL=

# Upstash Redis (required for the productivity tools)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# OpenRouter (optional; used for AI workspace setup + challenge expansion; see Notes below)
OPENROUTER_API_KEY=...
```

Notes:

- You can create a Tambo API key in the Tambo dashboard: https://tambo.co/dashboard
- You can create an OpenRouter API key here: https://openrouter.ai/keys
- Minimum setup is Tambo + Upstash Redis; OpenRouter is only needed for AI workspace setup and challenge expansion.
- If `OPENROUTER_API_KEY` is missing, those AI actions will fail when invoked.
- The app currently persists most data via Upstash Redis in server actions in `src/services/productivity-service.ts`.
- `NEXT_PUBLIC_TAMBO_URL` is optional; by default the SDK uses Tambo’s hosted endpoint.

### 3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Useful routes

- `/` — main TaskStack UI (dashboard + AI side panel)
- `/chat` — full-screen Tambo chat
- `/interactables` — Tambo UI primitives playground
- `/api/test-redis` — sanity check Upstash Redis connectivity; useful if the dashboard widgets don’t seem to persist data

## How Tambo is wired up

Tambo is configured in `src/lib/tambo.ts`:

- `components`: React components that the model can render (Pomodoro timer, Skills Track, creative tools, etc.)
- `tools`: server-side functions the model can call (read/write challenges, save links, log distractions, …)

See the `components` and `tools` arrays in `src/lib/tambo.ts` for the current configuration.

At runtime, the `TamboProvider` is mounted in `src/app/page.tsx` (and also on `/chat` and `/interactables`).

### Adding a new tool

1. Implement a server action (or other server-side function) in `src/services/*`
2. Register it in `tools` in `src/lib/tambo.ts` with `inputSchema` + `outputSchema` (Zod)

### Adding a new component

1. Create a component under `src/components/*` and a Zod props schema
2. Register it in `components` in `src/lib/tambo.ts`

## Project notes / known limitations

- “Auth” is MVP-level: the workspace PIN (`up_XXXXXX`) is stored client-side in `localStorage` and used to scope Redis keys. Anyone with the PIN can access the workspace.
- Redis keys are scoped by the workspace PIN (see `getKeys()` in `src/services/productivity-service.ts`).
- Because Redis keys are scoped only by the workspace PIN, anyone who knows a PIN can read and modify all data for that workspace.
- This is for local/demo use only (no real authentication/authorization, no revocation, and not safe to expose publicly).
- AI workspace setup + challenge expansion require `OPENROUTER_API_KEY`. Without it, core productivity features still work, but those AI actions will fail when invoked.
- Don’t deploy this as-is to production without real authentication and security controls.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Further reading

- Tambo docs: https://docs.tambo.co
- Upstash Redis docs: https://upstash.com/docs/redis
- Project docs in this repo: `IMPLEMENTATION_PLAN.md`, `PHASE_1_COMPLETE.md`
