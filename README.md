# TidePilot

A personal brand operating system for professionals: Voice Lab, Studio, Engagement Cockpit, and Weekly Operator Brief.

## Stack

- **Monorepo**: pnpm + Turborepo
- **App**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Data**: Prisma + PostgreSQL (use a free cloud DB e.g. Neon/Supabase if you don’t run Postgres locally).
- **AI**: Zod contracts + stub engine (swap for real LLM when ready)

## Setup

**If `pnpm` is not recognized:** Install it first (Node.js required). In a terminal:

- **Option A (recommended):** `npm install -g pnpm@9.14.2` (uses your user npm prefix; no admin needed if npm prefix is in your user folder).
- **Option B:** Run your terminal **as Administrator**, then run `corepack enable` so the `pnpm` from the project’s `packageManager` is available.

Then continue with the steps below.

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment**

   Copy `packages/db/.env.example` to `packages/db/.env`. You need a **PostgreSQL** URL. If you don’t have Postgres installed, use a free cloud database (see step 3).

3. **Database** (required for /app features like Voice Lab, Studio, Goals)

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

   Or reset (drops and recreates):

   ```bash
   pnpm db:reset
   ```

   **No Postgres installed?** Use a free cloud DB (no install):

   1. Sign up at [Neon](https://neon.tech) or [Supabase](https://supabase.com) and create a project.
   2. Copy the **PostgreSQL connection string**.
   3. In `packages/db/.env` set `DATABASE_URL="postgresql://..."` (paste your URL).
   4. Run `pnpm db:push` then `pnpm db:seed`.

4. **Run**

   ```bash
   pnpm dev
   ```

   - Marketing: [http://localhost:3000](http://localhost:3000)
   - App: [http://localhost:3000/app](http://localhost:3000/app)

## Demo Script (after `pnpm db:reset`)

1. Open `/app`
2. **Voice Lab** (`/app/voice`) — add samples, generate voice profile
3. **Studio** (`/app/studio`) — open a draft, use “Rewrite to voice”
4. **Engagement** (`/app/engagement`) — open an item, generate reply suggestions
5. **Home** (`/app`) — generate this week’s brief

All flows work with seeded data and stub AI; no external APIs required.

## Scripts

| Command       | Description                |
|---------------|----------------------------|
| `pnpm dev`    | Start dev server           |
| `pnpm build`  | Build all packages         |
| `pnpm lint`   | Lint                       |
| `pnpm db:push`| Push Prisma schema         |
| `pnpm db:seed`| Seed database              |
| `pnpm db:reset`| Reset DB and seed         |
| `pnpm db:studio`| Open Prisma Studio       |

## Env vars

- `DATABASE_URL` — PostgreSQL connection string (e.g. from [Neon](https://neon.tech) or [Supabase](https://supabase.com) if you don’t run Postgres locally).

## Docs

- [Architecture](docs/ARCHITECTURE.md) — data flow, API, AI contracts, security.
