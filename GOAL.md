# Meridian — Agent Goal Brief

> **Prompt for an autonomous coding agent.** Read this top-to-bottom before any
> changes. Stop and ask the user only when a decision blocks progress; otherwise
> deliver the milestones below in order, end-to-end.

---

## 1. Mission

Turn this Meridian repo from a static demo into a **production-shaped AI cost
intelligence dashboard**:

1. Real, secure **email + verification-code** sign in / sign up.
2. **Supabase** as the data + auth backing store (no local JSON in production).
3. A **working backend** for keys, agents, requests, and budgets.
4. A **fully responsive UI** that works on phone / tablet / laptop / 4K.
5. A **machine-learning router** the user retrains weekly to (a) pick the
   cheapest viable API per prompt, and (b) detect waste/runaway patterns.
6. **Hardened security** on every public surface (rate limit, validation,
   secrets, headers, audit logs).

The user wants to *learn* by training the ML model themselves — never train it
silently for them. Always leave training scripts + docs they can run.

---

## 2. Non-negotiables

- **Never commit secrets.** Use `.env` + Supabase project keys. `.env.example`
  must always be a safe placeholder.
- **Never log raw API keys, JWTs, or verification codes.** Mask before logging.
- **Never disable existing security middleware** (`helmet`, rate limiters,
  zod validation) when adding features. Extend it.
- **Never break the static demo path** (`npm start`) while the API server
  (`npm run start:api`) gets the real wiring. Keep both runnable.
- **Always remove “fleet view” code** if it reappears — it has been intentionally
  deleted.
- **Never use a build step the user hasn’t explicitly approved.** This project
  uses `<script type="text/babel">` + `@babel/standalone`. Don’t introduce
  Vite/Next/CRA without asking.

---

## 3. Milestones (do in this order)

### Milestone 1 — Real auth (email + verification code)

Replace the bypassed demo auth with a real flow.

- **Provider**: Supabase Auth (email OTP / magic link with 6-digit code).
- **Flow**:
  1. User enters email on `/auth`.
  2. Server requests Supabase to send a one-time code.
  3. User enters code → exchange for a Supabase session.
  4. Server sets an **httpOnly, Secure, SameSite=Lax** cookie holding our own
     short-lived JWT bound to `supabase.user.id`.
  5. `/api/auth/me` returns `{ user: { id, email } }` from the cookie.
  6. `/api/auth/logout` clears cookie + Supabase session.
- **Files to touch**:
  - `page-auth.jsx` (re-enable + restyle to match Stitch shell)
  - `app.jsx` (gate behind `useSession()` hook; remove `DEMO_USER`)
  - `server/index.with-api.js` (new `POST /api/auth/request-code`,
    `POST /api/auth/verify-code`, keep `/logout` + `/me`)
  - new `server/supabase-admin.js` (uses `SUPABASE_SERVICE_ROLE_KEY` only on
    the server, never in the browser)
  - `.env.example` add: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
    `SUPABASE_SERVICE_ROLE_KEY`
- **Security checks**:
  - Rate-limit `request-code` per IP **and** per email (3/min, 20/day).
  - Rate-limit `verify-code` per IP + per email; lock the email after 5
    failed attempts in 15 minutes.
  - Codes expire in 10 minutes; single-use; constant-time compare.
  - Validate email with `zod`’s `.email().max(254)`.

### Milestone 2 — Move data to Supabase

- Add tables (use Supabase SQL migrations under `supabase/migrations/`):
  - `users` (mirrors `auth.users` id + email; one row per user)
  - `provider_keys` (`id`, `user_id`, `provider`, `label`, `mask`, `iv`,
    `ciphertext`, `auth_tag`, `created_at`, RLS enforced)
  - `agents` (`id`, `user_id`, `name`, `team`, `status`, `started_at`)
  - `agent_runs` (`id`, `agent_id`, `started_at`, `ended_at`, `cost_usd`,
    `calls`, `loop_score`, `terminated_reason`)
  - `requests` (`id`, `user_id`, `agent_id`, `model`, `provider`,
    `prompt_hash`, `tokens_in`, `tokens_out`, `cost_usd`, `latency_ms`,
    `created_at`)
  - `budgets` (`user_id`, `team`, `monthly_cap_usd`, `soft_cap_usd`)
- **Row-Level Security** must be `enable + force` on every user table; policy:
  `user_id = auth.uid()`.
- Replace `server/json-store.js` calls with a `server/store-supabase.js`.
  Keep the JSON store alive only as a *fallback for offline dev*, behind a
  `MERIDIAN_STORE=json|supabase` env switch.

### Milestone 3 — Backend that actually does things

- `POST /api/provider-keys` already exists — keep encryption (AES-256-GCM with
  `ENCRYPTION_KEY`) but persist into Supabase. Never return decrypted keys.
- `GET /api/agents`, `POST /api/agents`, `POST /api/agents/:id/terminate`.
- `GET /api/requests?from=&to=&team=` for the live feed / logs page.
- `GET /api/budgets` + `PUT /api/budgets/:team`.
- `GET /api/insights/summary` returns:
  `{ totalSpend, totalSaved, projectedEOM, modelMix, teamSpend }`.
- All write routes must use the existing `userWriteLimiter` and `validate(...)`
  middleware. All proxy routes (LLM upstream calls) must use `proxyLimiter`.

### Milestone 4 — Responsive everywhere

- All pages must work cleanly at: **360px, 768px, 1024px, 1440px, 2560px**.
- Replace any hard `gridTemplateColumns: 'repeat(N, ...)'` with the existing
  `.stitch-grid-12 / -3 / -2` helpers (which already collapse).
- `.header` is sticky; **search popover must always layer above cards** (already
  fixed with `z-index: 10000` — keep it).
- Sidebar should optionally collapse to icons-only at ≤860px (toggle button,
  remembered via `localStorage.meridian_sidebar`).
- Tables get horizontal scroll on small screens, never break the layout.
- Use `clamp()` for hero metric font sizes. Example:
  `font-size: clamp(28px, 4vw, 48px);`

### Milestone 5 — ML cost router (user trains weekly)

This is the part the user explicitly wants to learn. **Do not auto-train.**
Provide scripts + docs they invoke.

- **What it predicts**: for each incoming request, the cheapest model that is
  likely to succeed at acceptable quality (label = whether the routed call had
  to be retried/escalated).
- **Inputs (features)**: token estimate, prompt domain (zero-shot classifier
  category), required capability (vision/code/json), team, hour-of-day,
  recent failure rate per model, current per-token price, expected latency.
- **Models to ship**:
  - **v0 baseline**: rules table — pick cheapest model whose token cost
    ≤ team’s per-call cap and that satisfies declared capabilities.
  - **v1 supervised**: gradient-boosted classifier (LightGBM/XGBoost) →
    predict `P(success | model, features)`; pick `argmin cost` with
    `P(success) ≥ threshold`.
  - **v2 anomaly**: isolation-forest / EWMA on `(prompt_hash, agent_id)` for
    loop / runaway detection — feeds the Agent Monitor’s “Loop risk %”.
- **Where it lives**: `python/router_service/` (already scaffolded). Add:
  - `train_weekly.py` — pulls last 7 days of `requests` from Supabase,
    trains v1 + v2, writes versioned artifacts to
    `python/router_service/artifacts/YYYY-WW/`.
  - `serve.py` — FastAPI: `POST /route` returns `{ model, provider, why }`,
    `POST /loop-score` returns `{ score, reasons }`.
  - `TRAINING_GUIDE.md` (already there) — extend with a one-command weekly
    runbook the user follows.
- **Wiring**: Node API calls the FastAPI service over HTTP localhost; the
  Node side caches the latest weights’ version and falls back to v0 rules
  if the Python service is down. **Never** block a real LLM call on the
  router being healthy.

### Milestone 6 — Security hardening (continuous)

- `helmet` with a strict CSP for the production HTML (allow only the domains
  we actually use: Supabase, the LLM proxies, your fonts).
- Move React/ReactDOM/Babel from `<script type="text/babel">` to
  pre-compiled bundles for production (keep dev mode as is). Document the
  switch under `npm run build`.
- Add `audit_log` table + write entries on: sign-in, key create/revoke,
  budget change, agent terminate. Show last 50 entries on a Settings page.
- Rotate JWTs every 24h; force re-auth after 7 days idle.
- Add a `meridian doctor` script that prints which secrets are missing and
  which RLS policies are off.

---

## 4. Working agreements

- **Branching**: feature-per-milestone (`feat/auth-otp`, `feat/supabase-store`,
  `feat/ml-router-v1`, etc.). One PR per milestone, with screenshots and a
  Test Plan.
- **Tests** (lightweight is fine):
  - `vitest` for the Node helpers (validation, masking, rate-limit keygen).
  - `pytest` for the Python router (feature pipeline + thresholding).
- **Demo data** stays toggleable via `M.uiDemoSampleData` so the user can show
  the UI even without Supabase wired.
- **Docs**: every milestone updates `README.md` with a clear "How to run".
- **Privacy**: never send full prompts to the router service in production —
  send features + `prompt_hash` only.

---

## 5. Acceptance criteria (definition of done)

- I can sign up with my real email, get a 6-digit code, paste it, and land
  in the dashboard.
- I can add an OpenAI key on the Virtual Keys page; it stores encrypted in
  Supabase; the masked view is what the UI shows.
- I can create an Agent, start a fake run, see it on Agent Monitor with a
  live loop score from the Python service.
- I can resize the browser from 360px to 2560px and nothing overlaps,
  the search popover always sits above cards.
- I can run `python python/router_service/train_weekly.py` and a new
  artifact appears under `artifacts/YYYY-WW/`. The Node API picks it up
  on next request.
- A failing Python service does **not** take the dashboard down.
- `npm run start:api` boots clean with `helmet`, rate limit, and zod active.
- No secrets in the repo. `.env.example` only.

---

## 6. What to ask the user before starting

1. Supabase project URL + anon key + service role key (provided privately).
2. Preferred email sender (Supabase default, Resend, Postmark…).
3. Target hosting (Vercel / Fly.io / Railway / their VPS).
4. Whether the ML router runs on the same box or a separate Python service.

If any of those four are unanswered, build everything else and stub the
specific integration behind an env flag.
