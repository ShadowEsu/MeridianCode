# Meridian router service (skeleton)

Intended stack from the product spec:

| Piece | Tool |
|-------|------|
| Feature extraction | Python + **tiktoken** (token count) + optional heuristics |
| Classifier | **XGBoost** or **scikit-learn** (logistic / gradient boosting) |
| Quality scoring | Small LLM call (1–5) or rules |
| Persistence | SQLite or Postgres (`schema/meridian_ml_waste.sql`) |
| HTTP | **FastAPI** — `POST /v1/route` returns recommended model tier |

## Flow

1. Client sends prompt text (or precomputed features).
2. Service computes features → classifier → `cheap` / `mid` / `premium` label.
3. Downstream calls cheap model; **quality gate** runs; on fail, escalate.
4. After response, **log** `api_calls` with actual vs optimal cost (`waste = actual - optimal`).

## Run (dev)

```bash
cd python/router_service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Training (daily / on new data)

Full steps: **[TRAINING_GUIDE.md](./TRAINING_GUIDE.md)**

Quick start:

```bash
pip install -r requirements.txt
python train.py --data data/example_labeled.csv --out artifacts/router.joblib
export MERIDIAN_ROUTER_MODEL="$(pwd)/artifacts/router.joblib"
uvicorn main:app --reload --port 8001
```

`GET /health` shows whether the trained model is loaded.
