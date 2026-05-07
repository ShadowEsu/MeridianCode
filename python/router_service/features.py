"""
Feature extraction for router / waste classifiers.
Extend with tiktoken, language detection, embeddings, etc.
"""
from __future__ import annotations

import re
from typing import Any

TASK_TYPES = [
    "unknown",
    "summarization",
    "coding",
    "translation",
    "classification",
    "reasoning",
    "creative",
]


def extract_features(prompt: str, task_type: str | None = None) -> dict[str, Any]:
    text = prompt or ""
    words = text.split()
    sents = max(1, len(re.split(r"[.!?]+", text.strip())) if text.strip() else 1)

    feats: dict[str, Any] = {
        "char_len": float(len(text)),
        "word_count": float(len(words)),
        "sentence_count": float(sents),
        "avg_words_per_sentence": float(len(words)) / float(sents),
        "has_code_fence": 1.0 if "```" in text else 0.0,
        "has_mathish": 1.0 if any(c in text for c in "∑∫√≤≥∂∞") else 0.0,
        "digit_ratio": _ratio(re.findall(r"\d", text), len(text)),
        "non_ascii_ratio": _non_ascii_ratio(text),
    }

    # Optional one-hot for task_type (keep in sync with TASK_TYPES in train.py)
    task = (task_type or "unknown").lower().strip()
    for t in TASK_TYPES:
        feats[f"task_{t}"] = 1.0 if task == t else 0.0

    return feats


def feature_names() -> list[str]:
    base = [
        "char_len",
        "word_count",
        "sentence_count",
        "avg_words_per_sentence",
        "has_code_fence",
        "has_mathish",
        "digit_ratio",
        "non_ascii_ratio",
    ]
    return base + [f"task_{t}" for t in TASK_TYPES]


def vectorize(feats: dict[str, Any]) -> list[float]:
    return [float(feats[name]) for name in feature_names()]


def _ratio(matches: list, denom: int) -> float:
    if denom <= 0:
        return 0.0
    return min(1.0, len(matches) / float(denom))


def _non_ascii_ratio(text: str) -> float:
    if not text:
        return 0.0
    n = sum(1 for c in text if ord(c) > 127)
    return n / float(len(text))
