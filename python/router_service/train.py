#!/usr/bin/env python3
"""
Train router classifier: prompt (+ optional task_type) -> label_tier (cheap/mid/premium).

Usage:
  python train.py --data data/example_labeled.csv --out artifacts/router.joblib

CSV columns:
  - prompt (required)
  - label_tier (required): cheap | mid | premium
  - task_type (optional): summarization, coding, ...
"""
from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

from features import extract_features, feature_names, vectorize

TIER_ORDER = ["cheap", "mid", "premium"]


def load_dataset(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    for col in ("prompt", "label_tier"):
        if col not in df.columns:
            raise SystemExit(f"CSV must contain column: {col}")
    df["label_tier"] = df["label_tier"].str.lower().str.strip()
    bad = ~df["label_tier"].isin(TIER_ORDER)
    if bad.any():
        raise SystemExit(f"Invalid label_tier values: {df.loc[bad, 'label_tier'].unique()}")
    if "task_type" not in df.columns:
        df["task_type"] = "unknown"
    return df


def row_to_x(row) -> list[float]:
    tt = row["task_type"]
    task = str(tt).strip() if pd.notna(tt) and str(tt).strip() else None
    p = extract_features(str(row["prompt"]), task)
    return vectorize(p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, required=True, help="Labeled CSV path")
    ap.add_argument("--out", type=Path, default=Path("artifacts/router.joblib"))
    ap.add_argument("--test-size", type=float, default=0.2)
    ap.add_argument("--random-state", type=int, default=42)
    args = ap.parse_args()

    df = load_dataset(args.data)
    if len(df) < 10:
        print("Warning: <10 rows; model will be weak. Collect more labels.")

    X_raw = [row_to_x(r) for _, r in df.iterrows()]
    y_text = df["label_tier"].tolist()

    le = LabelEncoder()
    le.fit(TIER_ORDER)
    y = le.transform(y_text)

    strat = y if len(set(y)) > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X_raw, y, test_size=args.test_size, random_state=args.random_state, stratify=strat
    )

    clf = HistGradientBoostingClassifier(
        max_depth=6,
        learning_rate=0.08,
        max_iter=200,
        random_state=args.random_state,
    )
    pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            ("clf", clf),
        ]
    )

    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)
    print(classification_report(y_test, pred, target_names=le.classes_))

    args.out.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "pipeline": pipe,
        "label_encoder": le,
        "feature_names": feature_names(),
        "tier_order": TIER_ORDER,
    }
    joblib.dump(bundle, args.out)
    print(f"Wrote {args.out.resolve()}")


if __name__ == "__main__":
    main()
