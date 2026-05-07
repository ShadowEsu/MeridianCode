## Meridian ML plan (practical + beginner-friendly)

You “implement a machine learning AI” by building a loop:

**collect data → label outcomes → train a model → serve predictions → monitor + retrain**.

This plan is written for Meridian’s use case: routing prompts / controlling spend.

---

## 0) Pick one ML problem (start small)

Avoid “general AI.” Choose a narrow prediction you can validate:

- **Router (recommended first)**: given a request/prompt, predict **which tier** to use (`cheap | mid | premium`).
- **Waste detector (later)**: after a call, predict **was premium wasteful?** (`0/1`).
- **Anomaly**: detect spend spikes per team/key (`normal | spike`).

Start with **Router** because it has a clear business metric: savings with acceptable quality.

---

## 1) Define the label (what “correct” means)

ML needs ground truth. Decide your labeling rule:

### Router label (`label_tier`)
For each prompt:
- Run the prompt through multiple models/tiers (cheap → mid → premium) OR use historical outputs.
- Score output quality (human review or judge model rubric).
- Set `label_tier` = **cheapest tier that passes** your threshold.

### Waste label (`y_waste`)
For each past request:
- `y_waste = 1` if you used a premium tier but a cheaper tier would have met quality.
- `y_waste = 0` otherwise.

If you can’t label reliably, you can’t train reliably.

---

## 2) Log data in a “training-ready” shape

Create a dataset where each row is one request.

Minimum columns:
- `request_id`
- `timestamp`
- `team_id` (stable id; later user-editable groups map into this)
- `prompt` (or template id if you can’t store raw prompts)
- `task_type` (optional: “summarize”, “code”, “classify”…)
- `tokens_in`, `tokens_out` (if available)
- `latency_ms`
- `model_used` (or tier used)
- `cost_usd`
- `quality_score` (if you do scoring)
- `label_tier` (for router training) OR `y_waste` (for waste training)

Store as CSV/Parquet per day:
- `python/router_service/data/exports/YYYY-MM-DD_router_labeled.csv`

---

## 3) Feature engineering (turn rows into numbers)

Start with simple features you can compute fast:

Text features:
- length, word count, sentence count
- contains code fence (```), contains JSON-like braces, contains URLs
- digit ratio, non-ascii ratio

Metadata features:
- `task_type` one-hot
- `team_id` one-hot (optional; be careful of leakage)
- token estimates (if you have them)

Avoid embeddings at first—start with these “cheap” features.

---

## 4) Train a baseline model (keep it boring)

For router tier classification, good starter models:
- **Logistic Regression**
- **Linear SVM**
- **Gradient Boosting** (sklearn HistGradientBoosting / XGBoost if you later want)

Goal: beat a dumb baseline:
- Always-cheap
- Always-mid
- Heuristic on length (“if prompt > N chars, premium”)

Metrics:
- **Accuracy** (basic)
- **Cost-aware metric**: savings vs baseline subject to quality constraint
- Confusion matrix (how often it under-routes vs over-routes)

---

## 5) Evaluate like a product, not like a Kaggle project

You care about two things:

1) **Quality**: how often did the chosen tier pass?
2) **Savings**: how much cheaper than your current routing?

Do an “offline replay”:
- Use a held-out labeled set.
- Simulate routing decisions and compute expected spend and failure rate.

Only ship if failure rate is acceptable.

---

## 6) Serve predictions (simple architecture)

Two easy options:

### Option A: Python microservice (recommended for ML)
- FastAPI endpoint: `POST /predict-tier`
- Loads a trained artifact from disk (e.g. `router.joblib`)
- Returns `{ tier, confidence }`

### Option B: Node-only inference (later)
- Possible if you use a JS model format, but it’s extra friction.

Meridian already has `python/router_service/` scaffolding—use that.

---

## 7) Integrate into the UI + routing pipeline

In your “request submit” flow:

1) UI (or backend) sends prompt → router service
2) router returns tier
3) choose provider/model (cheap/mid/premium mapping)
4) execute call
5) log outcome + feedback (quality) for future training

Important: always allow overrides:
- User can “force premium”
- Or “rerun with premium” after a failure

Those overrides become great training signals.

---

## 8) Feedback loop (how it gets better)

Daily or weekly:
- export new labeled rows
- retrain
- compare to current model
- only promote if better (cost + quality)

Add basic monitoring:
- drift: prompt lengths changed? new task types?
- confidence: more low-confidence predictions?

---

## 9) What to build next (after the first working router)

- **Team customization**: map “prompt sources / apps / accounts” → `team_id` buckets users can edit.
- **Per-team policies**: Sales always premium for proposals; Engineering cheap for lint tasks.
- **Active learning**: sample low-confidence prompts for human review.

---

## Where this lives in your repo

- Training guide: `python/router_service/TRAINING_GUIDE.md`
- This plan: `ML_PLAN.md`

