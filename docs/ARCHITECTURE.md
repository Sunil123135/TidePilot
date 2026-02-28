# TidePilot Architecture

## Overview

TidePilot is a personal brand operating system: Voice Lab, Studio, Engagement Cockpit, and Weekly Operator Brief. Data flows through Prisma (Postgres), with an AI layer that returns schema-validated JSON (Zod).

## Data Flow

- **Voice**: Writing samples → Voice Lab → `extractVoiceProfile()` → VoiceProfile stored; used by Studio (rewrite-to-voice) and quality checks.
- **Brief**: Manual or cron trigger → `generateWeeklyBrief()` → WeeklyBrief stored; Home shows objective, insights, actions, post suggestions, engage-with list.
- **Engagement**: Import comments (manual/CSV/extension) → EngagementItem rows → `suggestReplies()` → reply suggestions; status updates (pending/replied/skipped).

## Monorepo

- `apps/web` — Next.js 14 App Router, Tailwind, shadcn/ui, Framer Motion.
- `packages/db` — Prisma schema + client; Postgres.
- `packages/ai` — Zod contracts + stub AI engine (swap for real LLM later).
- `packages/lib` — Shared utils (e.g. `cn`).
- `packages/ui` — Shared UI wrappers (optional).

## API / Server Actions

- `createWritingSample`, `generateVoiceProfile` (Voice Lab)
- `createDraft`, `updateDraft`, `rewriteDraftToVoice` (Studio)
- `updateEngagementStatus`, `suggestEngagementReplies` (Engagement)
- `generateWeeklyBrief`, `toggleBriefActionDone` (Home)
- Metering: record `ActionEvent` on each AI action; enforce workspace plan limits.

## AI Actions Contract

Each AI response must:

1. Validate against the corresponding Zod schema in `packages/ai/contracts`.
2. Include `id`, `type`, `created_at`, `data`, `render_hint`.
3. On validation failure: run auto-repair once, then re-validate.

Action types: `VOICE_EXTRACT`, `DRAFT_GENERATE`, `REWRITE_TO_VOICE`, `COMMENT_REPLY_SUGGEST`, `BRIEF_GENERATE`, `TOPIC_CLUSTER`, `POST_DIAGNOSTIC`.

## Security

- PII minimization: store only what the user explicitly imports (no scraping).
- Audit: `ActionEvent` records action_type, workspace_id, user_id, units.
- Rate limits: enforce per-workspace action limits (FREE vs PRO).

## Running Locally

1. `cp packages/db/.env.example packages/db/.env` and set `DATABASE_URL`.
2. `pnpm db:push` then `pnpm db:seed`.
3. `pnpm dev` — open `/` (marketing) or `/app` (app shell).
