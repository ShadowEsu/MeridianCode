## Meridian — Stitch design doc

### One-liner
Meridian is an AI spend + operations dashboard that makes model usage feel like a “fleet”: you connect providers as containers, watch spend by team, and keep agents from running away.

This repo is currently **frontend-only demo mode** (sample data, no auth/backend). The design is intentionally “real product” even with mock numbers.

---

## Goals
- **CFO clarity**: instant understanding of *spend, savings, and who is responsible*.
- **Operator confidence**: see routing/agent risk at a glance; make changes safely later.
- **Perplexity/Claude vibe**: editorial serif typography (Crimson Pro) with quiet density, clean hierarchy, and tabular numerals for stats.

---

## Information architecture (IA)

### Sidebar sections
- **Overview**: main KPI + charts + spend by team
- **Live Feed**: rolling activity stream
- **Request Logs**: searchable history
- **Agent Monitor**: runaway protection + status
- **Virtual Keys**: per-key budgets + allocation
- **Fleet View**: connect providers as “containers”
- **Alerts**: thresholds + notifications

Removed for now:
- Intelligence / Model Router pages (kept in repo, not loaded in `Meridian.html`)

---

## Visual system

### Typography
- **Primary**: `Crimson Pro` (serif, editorial, Claude-like)
- **Numerals**: `tabular-nums` everywhere for aligned dollar/call columns
- **Tone**: calm, premium, “analysis UI” not playful

### Color
Dark base with muted borders and restrained highlights:
- Background: near-black
- Surfaces: 2-layer cards
- Accent: indigo/violet for product identity
- Status: green/amber/red (always paired with text/shape)

### Layout
- 240px sidebar + main canvas
- Cards with consistent padding + border radius
- Dense tables with readable spacing (not cramped)

---

## Key screens (what they communicate)

### Overview
Purpose: “How are we doing this month?”
- Hero: **Total Saved**
- KPI row: spend, calls, tokens, projection
- Charts: daily savings + daily spend trend
- Distribution: donut by model
- Accountability: **Spend by team** bars
- Budget gauge: used vs projected vs cap

### Fleet View
Purpose: “Connect providers and make the system tangible.”
- **Ship + cargo grid** metaphor: each slot = one connection
- “Connect API” creates a new container and places it into the deck
- Side panel: container stats + disconnect action

### Agent Monitor
Purpose: “Prevent runaway cost.”
- Top warning bar if any agent is risky
- “Without Meridian” horror story panel (cost avoidance)
- Active agent cards with cost + loop risk + sparkline
- Kill switch checklist + historical runs table

### Virtual Keys
Purpose: “Budgets and allocation by key / team.”
- Table-like presentation, budget percent, savings
- (Future) routing policies per key/team

---

## Interaction design

### Patterns
- **Card-first navigation**: high-level insight → drill down later
- **Tables for truth**: logs/history are dense and scannable
- **Status chips + dots**: redundant encoding (color + label)

### Fleet “Connect API”
Current demo behavior:
- Adds a container client-side (no backend persistence)
Future behavior:
- Persist connections on server + encrypt provider keys

---

## Data model (demo now, customizable later)

### Teams (future customization)
Spend by team uses stable IDs so users can later customize groupings.

Future intent:
- “Traffic sources” (apps, accounts, prompt ingress pages) map into `team_id`
- Settings will let users rename/reorder teams and change mappings

### Containers
Seeded containers come from the mock model list; user-added containers get generated IDs.

---

## ML roadmap (kept in mind, not required for demo)

Meridian’s “AI” is not a chatbot UI; it’s **decision automation**.

Phase 1 (simplest):
- **Router classifier**: predict tier (`cheap | mid | premium`) from prompt + metadata
- Offline replay evaluation: quality threshold + savings metric

Phase 2:
- Waste detection, anomaly detection
- Active learning: sample low-confidence prompts for labeling

Implementation notes live in:
- `ML_PLAN.md`
- `python/router_service/TRAINING_GUIDE.md`

---

## Future backend (explicitly deferred)

When backend is re-enabled:
- Auth (session cookies)
- JSON store for users + encrypted provider keys
- Proxy endpoints to providers

This is intentionally deferred so the frontend design can be validated first.

---

## “Stitch” submission notes (what to highlight)
- Strong **hierarchy**: savings + spend + accountability
- **Editorial typography** with tabular numerals (data legibility)
- Differentiated metaphor: **Fleet** turns abstract provider connections into something users understand instantly
- Clear path to personalization: teams + mappings + policies

