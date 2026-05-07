// Mock data — consistent across all pages
const KPI = {
  totalSpend: 84320,
  totalSaved: 93450,
  routingSavings: 31450,
  loopSavings: 62000,
  totalCalls: 2847391,
  tokens: "18.4B",
  budgetCap: 115000,
  budgetUsedPct: 73,
  projectedEOM: 97200,
};

const MODELS = [
  { id: 'sonnet', name: 'Claude 3.5 Sonnet', short: 'Sonnet', family: 'claude', color: '#6366F1', deep: '#3730A3', costPer1K: 0.003, callsMonth: 1456000, spend: 43200, latency: 880, status: 'green', share: 51.2 },
  { id: 'haiku', name: 'Claude Haiku 3.5', short: 'Haiku', family: 'claude', color: '#A5B4FC', deep: '#4F46E5', costPer1K: 0.0008, callsMonth: 217000, spend: 6400, latency: 320, status: 'green', share: 7.6 },
  { id: 'gpt4o', name: 'GPT-4o', short: 'GPT-4o', family: 'gpt', color: '#10B981', deep: '#065F46', costPer1K: 0.0025, callsMonth: 770000, spend: 22900, latency: 720, status: 'green', share: 27.1 },
  { id: 'gpt4omini', name: 'GPT-4o Mini', short: 'GPT-4o Mini', family: 'gpt', color: '#34D399', deep: '#059669', costPer1K: 0.0006, callsMonth: 116000, spend: 3500, latency: 280, status: 'green', share: 4.1 },
  { id: 'geminipro', name: 'Gemini 1.5 Pro', short: 'Gemini Pro', family: 'gemini', color: '#F59E0B', deep: '#92400E', costPer1K: 0.0012, callsMonth: 285000, spend: 8400, latency: 540, status: 'green', share: 10.0 },
  { id: 'geminiflash', name: 'Gemini Flash', short: 'Gemini Flash', family: 'gemini', color: '#FBBF24', deep: '#D97706', costPer1K: 0.0003, callsMonth: 38000, spend: 950, latency: 180, status: 'amber', share: 1.0 },
];

/**
 * Spend-by-team = user-editable buckets (future).
 * Each row has stable `id` for routing rules. Later: map provider accounts, workspaces, or “prompt ingress”
 * (which app/page sent the call) → `id`, and let users rename/reorder groups in Settings.
 */
const TEAMS = [
  { id: 'engineering', name: 'Engineering', members: 12, budget: 40000, spend: 34200, calls: '1.2M', tokens: '7.4B', latency: 720, topModel: 'Claude Sonnet', savings: 12400 },
  { id: 'data-science', name: 'Data Science', members: 8, budget: 25000, spend: 22100, calls: '810K', tokens: '4.9B', latency: 680, topModel: 'GPT-4o', savings: 8200 },
  { id: 'marketing', name: 'Marketing', members: 5, budget: 15000, spend: 11200, calls: '420K', tokens: '2.6B', latency: 410, topModel: 'Claude Haiku', savings: 6100 },
  { id: 'product', name: 'Product', members: 6, budget: 12000, spend: 8900, calls: '280K', tokens: '1.7B', latency: 380, topModel: 'GPT-4o Mini', savings: 3200 },
  { id: 'sales', name: 'Sales', members: 4, budget: 10000, spend: 5100, calls: '190K', tokens: '0.9B', latency: 220, topModel: 'Gemini Flash', savings: 1300 },
  { id: 'devops', name: 'DevOps', members: 3, budget: 8000, spend: 2820, calls: '97K', tokens: '0.4B', latency: 340, topModel: 'Claude Haiku', savings: 250 },
];

/** Product contract for future Settings: traffic labels → TEAMS[].id */
const TEAM_SPEND_CUSTOMIZATION = {
  schemaVersion: 1,
  description: 'User-defined groupings for spend charts; map API accounts, apps, or prompt sources into TEAMS buckets.',
};

const TEAM_COLORS = {
  Engineering: '#F59E0B',
  'Data Science': '#FBBF24',
  Marketing: '#EC4899',
  Product: '#10B981',
  Sales: '#F59E0B',
  DevOps: '#14B8A6',
};

const VIRTUAL_KEYS = [
  { name: 'eng-prod-main', team: 'Engineering', budget: 15000, spend: 13950, requests: 480000, status: 'active', mask: 'sk-mer_a3f9...8c21' },
  { name: 'eng-staging', team: 'Engineering', budget: 8000, spend: 4120, requests: 220000, status: 'active', mask: 'sk-mer_b71e...d403' },
  { name: 'ds-research', team: 'Data Science', budget: 12000, spend: 11050, requests: 410000, status: 'active', mask: 'sk-mer_c204...91fa' },
  { name: 'ds-batch', team: 'Data Science', budget: 8000, spend: 6420, requests: 240000, status: 'active', mask: 'sk-mer_d8a7...02bd' },
  { name: 'mkt-content', team: 'Marketing', budget: 7000, spend: 5800, requests: 180000, status: 'active', mask: 'sk-mer_e114...77a9' },
  { name: 'mkt-social', team: 'Marketing', budget: 5000, spend: 3210, requests: 140000, status: 'active', mask: 'sk-mer_f9b2...4e16' },
  { name: 'product-bot', team: 'Product', budget: 6000, spend: 4980, requests: 160000, status: 'active', mask: 'sk-mer_104a...8821' },
  { name: 'product-search', team: 'Product', budget: 4000, spend: 2800, requests: 95000, status: 'active', mask: 'sk-mer_22c8...09ef' },
  { name: 'sales-assist', team: 'Sales', budget: 6000, spend: 3200, requests: 110000, status: 'active', mask: 'sk-mer_3f0d...b65a' },
  { name: 'sales-leads', team: 'Sales', budget: 4000, spend: 1700, requests: 65000, status: 'active', mask: 'sk-mer_47e1...a322' },
  { name: 'devops-ops', team: 'DevOps', budget: 5000, spend: 2200, requests: 64000, status: 'active', mask: 'sk-mer_5b9c...d0ff' },
  { name: 'devops-monitor', team: 'DevOps', budget: 3000, spend: 620, requests: 28000, status: 'paused', mask: 'sk-mer_6df3...1c08' },
];

const ALERTS = [
  { id: 1, name: 'Daily spend exceeds $3,000', triggered: '2 days ago', state: 'triggered', count: 1, channel: 'Slack' },
  { id: 2, name: 'Engineering team exceeds 90% monthly budget', triggered: 'Not yet triggered', state: 'active', count: 0, channel: 'Email' },
  { id: 3, name: 'Any agent session exceeds $50', triggered: '2x this month', state: 'warning', count: 2, channel: 'Slack + PagerDuty' },
  { id: 4, name: 'API error rate exceeds 5% in any 10-min window', triggered: '—', state: 'paused', count: 0, channel: 'PagerDuty' },
];

const ROUTING_RULES = [
  { id: 1, condition: 'Simple classification tasks', target: 'Claude Haiku', requests: 831000, saved: 18200, enabled: true },
  { id: 2, condition: 'Long-form generation > 4K tokens', target: 'Claude Sonnet', requests: 412000, saved: 0, enabled: true },
  { id: 3, condition: 'Code generation', target: 'GPT-4o', requests: 203000, saved: 7800, enabled: true },
  { id: 4, condition: 'Fast responses < 200ms', target: 'Gemini Flash', requests: 97000, saved: 5450, enabled: true },
  { id: 5, condition: 'Embedding generation', target: 'GPT-4o Mini', requests: 61000, saved: 0, enabled: false },
];

const AGENTS = [
  { name: 'ResearchBot', team: 'Data Science', status: 'running', duration: '4h 12m', calls: 1840, cost: 8.20, loopRisk: 12, sparkType: 'flat' },
  { name: 'ContentAgent', team: 'Marketing', status: 'warning', duration: '0h 47m', calls: 892, cost: 31.40, loopRisk: 78, sparkType: 'spike' },
  { name: 'CodeReviewBot', team: 'Engineering', status: 'running', duration: '2h 03m', calls: 620, cost: 4.10, loopRisk: 8, sparkType: 'flat' },
  { name: 'DataPipelineAgent', team: 'DevOps', status: 'terminated', duration: '0h 12m', calls: 1204, cost: 47.00, loopRisk: 97, sparkType: 'runaway' },
];

// Generate 30 days of daily savings & spend
const fmtMoney = (n, opts = {}) => {
  const o = Object.assign({ minimumFractionDigits: 0, maximumFractionDigits: 0 }, opts);
  return '$' + Number(n).toLocaleString('en-US', o);
};
const fmtMoneyShort = n => {
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(1) + 'k';
  return '$' + n.toFixed(0);
};
const fmtNum = n => Number(n).toLocaleString('en-US');

// Seeded random for deterministic data
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);

// 30-day series
const ROUTING_SAVINGS_30 = (() => {
  const arr = [];
  for (let i = 0; i < 30; i++) {
    let v = 800 + i * 25;
    if (i > 10 && i < 16) v -= 400;
    if (i > 25) v += 300;
    v += (rng() - 0.5) * 200;
    arr.push(Math.max(400, Math.round(v)));
  }
  return arr;
})();

const SPEND_30 = (() => {
  const arr = [];
  for (let i = 0; i < 30; i++) {
    let v = 2400 + i * 25;
    if (i === 22) v = 3800;
    else if (i > 22) v = 3100 + (rng() - 0.5) * 200;
    v += (rng() - 0.5) * 250;
    arr.push(Math.max(1800, Math.round(v)));
  }
  return arr;
})();

// Historical agent runs
const AGENT_HISTORY = (() => {
  const names = ['ResearchBot', 'ContentAgent', 'CodeReviewBot', 'DataPipelineAgent', 'SummarizerBot', 'SupportAgent', 'CrawlerAgent', 'AnalyticsBot', 'TestGenAgent', 'DocAgent'];
  const teams = ['Engineering', 'Data Science', 'Marketing', 'DevOps', 'Product', 'Sales'];
  const rows = [];
  const r = mulberry32(99);
  for (let i = 0; i < 22; i++) {
    const isLoop = i === 3 || i === 11;
    rows.push({
      name: names[Math.floor(r() * names.length)] + '-' + (i+1),
      team: teams[Math.floor(r() * teams.length)],
      start: `Apr ${1 + Math.floor(r() * 30)}, ${(8 + Math.floor(r()*12)).toString().padStart(2,'0')}:${Math.floor(r()*60).toString().padStart(2,'0')}`,
      duration: isLoop ? '0h 18m' : `${Math.floor(r()*5)}h ${Math.floor(r()*59)}m`,
      cost: isLoop ? (i === 3 ? 47.00 : 38.50) : (r() * 30 + 1).toFixed(2),
      calls: isLoop ? 1100 + Math.floor(r() * 400) : 200 + Math.floor(r() * 1500),
      status: isLoop ? 'terminated' : (r() > 0.85 ? 'warning' : 'completed'),
      loop: isLoop ? 'Yes' : 'No',
      avoided: isLoop ? (i === 3 ? 31000 : 19000) : 0,
    });
  }
  return rows;
})();

// Request logs
const REQUEST_LOGS = (() => {
  const r = mulberry32(7);
  const rows = [];
  const teams = ['Engineering', 'Data Science', 'Marketing', 'Product', 'Sales', 'DevOps'];
  const statuses = ['Success', 'Success', 'Success', 'Success', 'Success', 'Error', 'Rate Limited'];
  for (let i = 0; i < 48; i++) {
    const m = MODELS[Math.floor(r() * MODELS.length)];
    const reroute = r() > 0.55;
    const orig = reroute ? MODELS[Math.floor(r() * 2)] : null;
    const inTok = Math.floor(200 + r() * 8000);
    const outTok = Math.floor(50 + r() * 2000);
    const cost = ((inTok + outTok) / 1000) * m.costPer1K;
    rows.push({
      id: 'req_' + (10000000 + Math.floor(r() * 89999999)).toString(36),
      time: `2026-05-03 ${(8 + Math.floor(r()*12)).toString().padStart(2,'0')}:${Math.floor(r()*60).toString().padStart(2,'0')}:${Math.floor(r()*60).toString().padStart(2,'0')}`,
      model: m.short,
      modelFamily: m.family,
      routedFrom: orig ? orig.short : '',
      team: teams[Math.floor(r() * teams.length)],
      inTok, outTok,
      cost: cost,
      latency: m.latency + Math.floor((r() - 0.5) * 200),
      status: statuses[Math.floor(r() * statuses.length)],
      saving: orig ? ((inTok + outTok)/1000) * (orig.costPer1K - m.costPer1K) : 0,
    });
  }
  return rows;
})();

// Containers (Fleet view)
const CONTAINERS = MODELS.map((m, i) => ({
  id: 'CNT-' + (1001 + i),
  ...m,
  apiKey: 'sk-' + m.id + '_' + 'x'.repeat(20) + (i+10).toString(16) + 'a4',
  callsToday: Math.round(m.callsMonth / 30),
  spendToday: m.spend / 30,
}));

/** When true, UI shows illustrative numbers — not live customer data */
const uiDemoSampleData = true;

/** Blended $/1K (in+out avg) for router / waste math — illustrative */
const COST_PER_1K_ROUTER = {
  'claude-3-5-sonnet': 0.015,
  'claude-haiku': 0.00025,
  'gpt-4o': 0.005,
  'gpt-4o-mini': 0.00015,
  'gemini-1-5-pro': 0.00125,
  'gemini-flash': 0.000075,
};

/** Labeled examples — same shape as a real training export */
const TRAINING_DATASET_EXAMPLES = [
  { prompt: 'Summarize this paragraph', taskType: 'summarization', complexity: 'low', bestModel: 'Haiku', costSaved: 0.004 },
  { prompt: 'Write production-grade Python auth system', taskType: 'coding', complexity: 'high', bestModel: 'Sonnet', costSaved: 0 },
  { prompt: 'Translate this sentence', taskType: 'translation', complexity: 'low', bestModel: 'Flash', costSaved: 0.003 },
  { prompt: 'Classify this ticket as bug or feature', taskType: 'classification', complexity: 'low', bestModel: '4o Mini', costSaved: 0.002 },
  { prompt: 'Prove this inequality for all n ≥ 3', taskType: 'reasoning', complexity: 'high', bestModel: 'Sonnet', costSaved: 0 },
  { prompt: 'Write a haiku about the ocean', taskType: 'creative', complexity: 'low', bestModel: 'Haiku', costSaved: 0.001 },
];

const PROMPT_FEATURE_DIMENSIONS = [
  'Token count (e.g. tiktoken)',
  'Sentence complexity (avg words / sentence)',
  'Task type: classification, summarization, coding, translation, creative, reasoning',
  'Flags: code block, math notation, non‑English',
  'Expected output length: short vs long‑form',
];

const ML_CLASSIFIER_STACK = {
  featureExtraction: 'Python + tiktoken (token counts); optional NLP features',
  classifier: 'XGBoost or scikit-learn (logistic regression) — fast, explainable',
  qualityGate: 'Cheap grader LLM 1–5 or heuristic; fail → escalate to next tier',
  storage: 'SQLite / Postgres for api_calls + rollups',
  serving: 'FastAPI POST /route — features in, model label out',
};

const ML_PIPELINE_STEPS = [
  { n: 1, title: 'Training dataset', body: 'Labeled rows: prompt, task type, complexity, cheapest model that passed quality. Build by multi-model eval + quality threshold.' },
  { n: 2, title: 'Feature engineering', body: 'Turn prompts into numeric vectors the classifier learns from.' },
  { n: 3, title: 'Train classifier', body: 'XGBClassifier or similar: X = features, y = model tier / label.' },
  { n: 4, title: 'Quality gate', body: 'Route to cheap model first; if quality fails, escalate (Sonnet / 4o / Pro).' },
  { n: 5, title: 'Feedback loop', body: 'Log chosen model, accept vs regenerate, cost — retrain on waste cases over time.' },
];

/** Sample logged calls — mirrors production api_calls table */
const API_CALLS_SAMPLE = [
  { id: 1, timestamp: '2026-05-03 14:22:01', userId: 'usr_eng_01', modelUsed: 'gpt-4o', optimalModel: 'gpt-4o-mini', promptTokens: 420, completionTokens: 180, actualCost: 0.003, optimalCost: 0.00009, waste: 0.00291, taskType: 'summarization', qualityScore: 4.5, escalated: false },
  { id: 2, timestamp: '2026-05-03 14:19:44', userId: 'usr_mkt_02', modelUsed: 'claude-3-5-sonnet', optimalModel: 'claude-haiku', promptTokens: 890, completionTokens: 320, actualCost: 0.0182, optimalCost: 0.0003, waste: 0.0179, taskType: 'classification', qualityScore: 4.2, escalated: false },
  { id: 3, timestamp: '2026-05-03 14:15:12', userId: 'usr_ds_03', modelUsed: 'gpt-4o', optimalModel: 'gpt-4o', promptTokens: 2100, completionTokens: 1400, actualCost: 0.0175, optimalCost: 0.0175, waste: 0, taskType: 'coding', qualityScore: 4.8, escalated: true },
  { id: 4, timestamp: '2026-05-03 14:08:33', userId: 'usr_eng_01', modelUsed: 'gemini-1-5-pro', optimalModel: 'gemini-flash', promptTokens: 310, completionTokens: 95, actualCost: 0.00051, optimalCost: 0.00003, waste: 0.00048, taskType: 'translation', qualityScore: 4.0, escalated: false },
  { id: 5, timestamp: '2026-05-03 13:55:00', userId: 'agent-content', modelUsed: 'claude-3-5-sonnet', optimalModel: 'claude-haiku', promptTokens: 1200, completionTokens: 800, actualCost: 0.03, optimalCost: 0.0005, waste: 0.0295, taskType: 'summarization', qualityScore: 3.2, escalated: true },
];

const SPEND_SUMMARY = [
  { period: '2026-04', totalSpent: 78200, totalWaste: 12400, totalSaved: 28900, callsRouted: 890000, callsEscalated: 12000 },
  { period: '2026-05', totalSpent: 84320, totalWaste: 10850, totalSaved: 31450, callsRouted: 945000, callsEscalated: 9800 },
];

const WASTE_INSIGHTS = {
  monthWasteUsd: 10850,
  enterpriseCheapPromptPct: '60–80%',
  enterpriseCheapNote: 'Share of enterprise prompts that can be served by a smaller model without quality loss (industry rule-of-thumb).',
  byModel: [
    { model: 'GPT-4o', overkillCalls: 340, wasteUsd: 4200 },
    { model: 'Claude 3.5 Sonnet', overkillCalls: 218, wasteUsd: 5100 },
    { model: 'Gemini 1.5 Pro', overkillCalls: 94, wasteUsd: 890 },
  ],
  byTaskType: [
    { task: 'Summarization', pctOverprovisioned: 78, wasteUsd: 3200 },
    { task: 'Classification', pctOverprovisioned: 62, wasteUsd: 2100 },
    { task: 'Coding', pctOverprovisioned: 22, wasteUsd: 400 },
  ],
  topOffenders: [
    { name: 'ContentAgent', team: 'Marketing', wasteUsd: 1820 },
    { name: 'eng-prod-main', team: 'Engineering', wasteUsd: 1240 },
    { name: 'SupportAgent', team: 'Product', wasteUsd: 890 },
  ],
};

const WASTE_TREND_30 = (() => {
  const r = mulberry32(404);
  const arr = [];
  let w = 520;
  for (let i = 0; i < 30; i++) {
    w = Math.max(280, w + (r() - 0.42) * 35 - (i > 18 ? 8 : 0));
    arr.push(Math.round(w));
  }
  return arr;
})();

/** Index of prompts & ideas from the founder notebook (titles + use-case) — not full text */
const PROMPT_LIBRARY_INDEX = [
  { part: 'Security', items: [
    { title: 'Full security audit of the proxy', use: 'Enumerate attack surfaces — auth, key storage, proxy injection, tenant isolation' },
    { title: 'Zero-trust virtual API key system', use: 'HMAC-prefixed keys, signing, multi-tenant B2B' },
    { title: 'SOC 2 Type II readiness', use: 'Trust Service Criteria checklist for AI middleware' },
  ]},
  { part: 'Machine learning', items: [
    { title: 'MLP anomaly detector on spend', use: 'sklearn pipeline, time features, spike detection' },
    { title: 'Auto-retraining pipeline', use: 'Weekly cron, F1 compare, promote model, Slack summary' },
    { title: 'Incremental / online learning', use: 'Improve detector as new spend patterns arrive' },
  ]},
  { part: 'Database & analytics', items: [
    { title: 'Multi-tenant Postgres (Supabase)', use: 'orgs, teams, virtual_keys, api_requests, RLS' },
    { title: 'SQLite → Supabase migration', use: 'SQLAlchemy dual-target, zero-downtime' },
    { title: 'ClickHouse analytics', use: 'High-volume api_requests, MergeTree, MVs' },
  ]},
  { part: 'Product & design', items: [
    { title: 'AI Waste Detector panel', use: 'CFO-grade visual hierarchy for waste vs optimal' },
    { title: '5-step onboarding', use: 'Connect provider → budget → invite → alerts → first waste replay' },
    { title: 'Enterprise design system', use: 'Tokens, motion, accessibility' },
  ]},
  { part: 'Go-to-market', items: [
    { title: 'Pricing & packaging', use: 'Tiers, usage metric, seat vs spend' },
    { title: 'Data moat & benchmarks', use: 'Anonymized industry datasets, competitor positioning' },
  ]},
];

window.MERIDIAN = {
  ...KPI,
  KPI, MODELS, TEAMS, TEAM_SPEND_CUSTOMIZATION, TEAM_COLORS, VIRTUAL_KEYS, ALERTS, ROUTING_RULES, AGENTS, AGENT_HISTORY, REQUEST_LOGS, CONTAINERS,
  ROUTING_SAVINGS_30, SPEND_30,
  fmtMoney, fmtMoneyShort, fmtNum,
  uiDemoSampleData,
  COST_PER_1K_ROUTER, TRAINING_DATASET_EXAMPLES, PROMPT_FEATURE_DIMENSIONS, ML_CLASSIFIER_STACK, ML_PIPELINE_STEPS,
  API_CALLS_SAMPLE, SPEND_SUMMARY, WASTE_INSIGHTS, WASTE_TREND_30, PROMPT_LIBRARY_INDEX,
};
