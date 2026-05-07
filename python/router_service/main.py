"""
Meridian routing API.
Set MERIDIAN_ROUTER_MODEL=/path/to/router.joblib after running train.py to use the classifier.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Meridian Router", version="0.1.0")

_bundle: dict | None = None


class RouteRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    task_hint: str | None = None


class RouteResponse(BaseModel):
    recommended_tier: str
    features: dict[str, Any]
    note: str


def _load_bundle() -> dict | None:
    global _bundle
    path = os.environ.get("MERIDIAN_ROUTER_MODEL", "").strip()
    if not path:
        return None
    p = Path(path)
    if not p.is_file():
        return None
    if _bundle is None:
        import joblib

        _bundle = joblib.load(p)
    return _bundle


def _heuristic_fallback(prompt: str) -> tuple[dict[str, Any], str]:
    words = prompt.split()
    sents = max(1, prompt.count(".") + prompt.count("?") + prompt.count("!"))
    avg = len(words) / sents
    feats = {
        "char_len": len(prompt),
        "token_estimate": max(1, len(words)),
        "avg_words_per_sentence": round(avg, 2),
        "has_code_fence": "```" in prompt,
        "has_mathish": any(c in prompt for c in "∑∫√≤≥"),
    }
    if feats["has_code_fence"] or feats["char_len"] > 4000:
        tier = "premium"
    elif avg > 28 or feats["has_mathish"]:
        tier = "mid"
    else:
        tier = "cheap"
    return feats, tier


@app.get("/health")
def health():
    b = _load_bundle()
    return {
        "ok": True,
        "service": "meridian-router",
        "model_loaded": b is not None,
        "model_path": os.environ.get("MERIDIAN_ROUTER_MODEL") or None,
    }


@app.post("/v1/route", response_model=RouteResponse)
def route(req: RouteRequest):
    from features import extract_features, vectorize

    feats_dict = extract_features(req.prompt, req.task_hint)
    api_feats = {k: float(v) for k, v in feats_dict.items() if not str(k).startswith("task_")}

    b = _load_bundle()
    if b is not None:
        vec = vectorize(feats_dict)
        tier_idx = b["pipeline"].predict([vec])[0]
        tier = str(b["label_encoder"].inverse_transform([tier_idx])[0])
        return RouteResponse(
            recommended_tier=tier,
            features=api_feats,
            note="Loaded from MERIDIAN_ROUTER_MODEL (train.py output).",
        )

    hfeats, tier = _heuristic_fallback(req.prompt)
    return RouteResponse(
        recommended_tier=tier,
        features=hfeats,
        note="Heuristic fallback — set MERIDIAN_ROUTER_MODEL after training.",
    )
