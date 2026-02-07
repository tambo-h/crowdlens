# CrowdLens

CrowdLens is a developer-focused “productivity OS” built with **Next.js 15** and **Tambo AI**. It combines a multi-tool productivity dashboard (Pomodoro, habits, links, weekly review, etc.) with an AI side panel that can call server-side tools and render interactive UI components.

## What’s in the app

- **Dashboard**: daily overview (Pomodoro count, habit completion, streaks, recent links)
- **Pomodoro timer**: sessions tracked in Redis
- **Habits**: toggle completion + streak tracking
- **Links**: save / tag / browse useful links
- **Slow Productivity rules**: built-in reference
- **Creative tools**: distractions journal, code snippets, standup log, energy mapper, weekly review
- **AI side panel**: Tambo chat that can use the registered tools/components

## Quickstart

### Prereqs

- Node.js (this repo uses `npm` via `package-lock.json`)
- A **Tambo** API key (set as `NEXT_PUBLIC_TAMBO_API_KEY`)
- **Upstash Redis** credentials

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
```

Notes:

- You can create a Tambo API key in the Tambo dashboard: https://tambo.co/dashboard
- The app currently persists most data via Upstash Redis in server actions in `src/services/productivity-service.ts`.
- `NEXT_PUBLIC_TAMBO_URL` is optional; by default the SDK uses Tambo’s hosted endpoint.

### 3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Useful routes

- `/` — main CrowdLens UI (dashboard + AI side panel)
- `/chat` — full-screen Tambo chat
- `/interactables` — Tambo UI primitives playground
- `/api/test-redis` — sanity check Upstash Redis connectivity; useful if the dashboard widgets don’t seem to persist data

## How Tambo is wired up

Tambo is configured in `src/lib/tambo.ts`:

- `components`: React components that the model can render (Pomodoro timer, habit tracker, weekly review, etc.)
- `tools`: server-side functions the model can call (read/write habits, save links, log distractions, …)

See the `components` and `tools` arrays in `src/lib/tambo.ts` for the current configuration.

At runtime, the `TamboProvider` is mounted in `src/app/page.tsx` (and also on `/chat` and `/interactables`).

### Adding a new tool

1. Implement a server action (or other server-side function) in `src/services/*`
2. Register it in `tools` in `src/lib/tambo.ts` with `inputSchema` + `outputSchema` (Zod)

### Adding a new component

1. Create a component under `src/components/*` and a Zod props schema
2. Register it in `components` in `src/lib/tambo.ts`

## Project notes / known limitations

- The current Redis keying in `src/services/productivity-service.ts` is hard-coded to a placeholder user (`user_1`).
- In non-local environments, this means all users share the same data; don’t deploy this as-is to production without adding proper auth and per-user keying.

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
