-- Meridian: ML routing feedback + spend / waste tracking
-- SQLite-compatible DDL (also valid for Postgres with minor type tweaks)

CREATE TABLE IF NOT EXISTS api_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  user_id TEXT,
  model_used TEXT NOT NULL,
  optimal_model TEXT,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  actual_cost REAL NOT NULL DEFAULT 0,
  optimal_cost REAL NOT NULL DEFAULT 0,
  waste REAL NOT NULL DEFAULT 0,
  task_type TEXT,
  quality_score REAL,
  escalated INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_api_calls_ts ON api_calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_calls_user ON api_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_task ON api_calls(task_type);

CREATE TABLE IF NOT EXISTS spend_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period TEXT NOT NULL UNIQUE,
  total_spent REAL NOT NULL DEFAULT 0,
  total_waste REAL NOT NULL DEFAULT 0,
  total_saved REAL NOT NULL DEFAULT 0,
  calls_routed INTEGER NOT NULL DEFAULT 0,
  calls_escalated INTEGER NOT NULL DEFAULT 0
);

-- Training export (optional separate table or materialized from api_calls)
CREATE TABLE IF NOT EXISTS routing_training_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_hash TEXT,
  prompt_excerpt TEXT,
  task_type TEXT,
  complexity TEXT,
  feature_json TEXT,
  label_model TEXT,
  cost_saved REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
