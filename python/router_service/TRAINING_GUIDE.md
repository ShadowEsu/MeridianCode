# How to train Meridian’s ML router (full steps)

You’re training a **supervised model** that maps **prompt features → which model tier is enough** (cheap / mid / premium).  
Separately, you can train a **waste detector** on logged calls: **features + “was premium used?” → was it wasteful** (premium used but quality said cheap was fine).

Run retraining **daily** (or weekly) whenever you have **new labeled rows** or **new `api_calls` exports** so the router tracks drift in your org’s prompts and APIs.

---

## 1. Decide what you optimize

| Model | Question it answers | Label source |
|--------|---------------------|--------------|
| **Router** | “Which tier should this prompt use first?” | Cheapest tier that **passed** your quality bar on a held-out eval |
| **Waste (optional)** | “Was this call wasteful?” (premium when cheap enough) | From `api_calls`: `waste > 0` and `quality_score` high, or human review |

Start with the **router**; add **waste** once `api_calls` has volume.

---

## 2. Build a training dataset (labels)

Each **row** is one prompt (or one logged request) with a **correct tier** (or wasteful flag).

**Router labels (CSV / Parquet):**

- `prompt` — full text (or redacted template)
- `task_type` — summarization, coding, … (optional column; can be one-hot encoded)
- `label_tier` — `cheap` | `mid` | `premium` (what you *should* have routed to first)

**How to get labels (same idea as the product spec):**

1. Sample prompts from production (or synthetic + real mix).
2. For each prompt, run **multiple models** (cheap → expensive) or use historical logs.
3. **Score outputs** (LLM-as-judge 1–5, rubric, or human spot-check).
4. Set `label_tier` = **cheapest model whose score ≥ your threshold**.

**Waste labels (from DB export):**

- Join `api_calls` where you trust `quality_score` and `optimal_model`.
- `y_waste = 1` if `waste > epsilon` and cheap tier would have passed quality (e.g. `quality_score >= 4` and `model_used` is premium).

Store files by day: `data/exports/2026-05-04_labeled.csv` so “different datasets” = different dated files or merged pool.

---

## 3. Feature engineering (what the code does)

For each `prompt` string the trainer computes numbers the model can learn:

- Token count (tiktoken, encoding for your main provider)
- Length, sentence count, avg words per sentence
- Flags: code fence, math-ish chars, non-ASCII ratio
- Optional: `task_type` one-hot

See `features.py` — extend with your own signals (language ID, user tier, etc.).

---

## 4. Train locally (one-off)

From repo root:

```bash
cd python/router_service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Put labeled data next to the example:

```bash
# CSV columns: prompt,label_tier  (optional: task_type)
python train.py --data data/example_labeled.csv --out artifacts/router.joblib
```

Inspect metrics printed (accuracy / log loss). Tune `--test-size` and add more data before trusting production.

---

## 5. Point the API at the trained model

```bash
export MERIDIAN_ROUTER_MODEL="$(pwd)/artifacts/router.joblib"
uvicorn main:app --port 8001
```

`main.py` loads this path if set; otherwise it keeps the heuristic.

---

## 6. Run training **every day** on new data

**Pattern:** each night (or morning) you:

1. **Export** new prompts + labels (or `api_calls` rows) to `data/exports/YYYY-MM-DD.csv`.
2. **Merge** last N days into `data/training_merged.csv` (append + dedupe by `request_id` or hash).
3. **Run** `python train.py --data data/training_merged.csv --out artifacts/router.joblib`.
4. **Restart** or hot-reload the router process so it loads the new `router.joblib`.
5. **Log** train metrics somewhere (file, Slack) for regression checks.

### Option A — cron (Mac / Linux)

```cron
0 3 * * * cd /path/to/MeridianCode/python/router_service && . .venv/bin/activate && python train.py --data data/training_merged.csv --out artifacts/router.joblib && pkill -HUP uvicorn
```

(Adjust paths; use a small wrapper script instead of one long line.)

### Option B — GitHub Actions (nightly)

- Workflow checks out repo (or pulls exports from S3).
- Runs `train.py`, commits `artifacts/` **or** uploads artifact to storage.
- Deploy step restarts Fly/Railway/etc.

### Option C — Airflow / Prefect

Same commands as tasks in a DAG; pass `--data` as a parameter from the latest export task.

---

## 7. “Different datasets and APIs”

- **Different datasets:** one CSV per source (team, product, API provider). Concatenate for a **global** model, or train **per-tenant** `router_team_eng.joblib` and pick model by `team_id` in the API.
- **Different APIs:** pricing differs — your **label** is tier (cheap/mid/premium), not provider name. Map tier → concrete model per provider in config (YAML/JSON) so one classifier serves OpenAI + Anthropic + Google.

---

## 8. Quality gate + feedback loop (after routing)

Training only knows **static labels**. In production:

1. Route to **cheap** first.
2. Run **quality check**; if fail → escalate.
3. **Log** `api_calls` with `actual_cost`, `optimal_cost`, `waste`, `quality_score`, `escalated`.

Weekly/monthly: **query** high-waste rows where quality was fine → **add** those prompts (or feature rows) back into training with label `cheap`. That’s how the model “learns” what you used to waste.

---

## 9. Evaluation before you ship a new model

- Hold out 10–20% of rows **by time** (last week), not random, to catch drift.
- Compare **average simulated cost** on the holdout: old model vs new model (using your `COST_PER_1K` table).
- Only promote if cost ↓ or quality-neutral per spot-checks.

---

## 10. Files in this repo

| File | Role |
|------|------|
| `features.py` | Text → numeric vector |
| `train.py` | Fit sklearn classifier, save `joblib` |
| `data/example_labeled.csv` | Tiny example to run `train.py` |
| `main.py` | Serves routes; loads `MERIDIAN_ROUTER_MODEL` if set |
| `schema/meridian_ml_waste.sql` | Where production logs should land |

This is the full loop: **label → features → train → serve → log → export → retrain**.
