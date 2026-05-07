// ML routing, waste tracking, training data, prompt library index (from product notebook)
function PageIntelligence() {
  const M = window.MERIDIAN;
  const W = M.WASTE_INSIGHTS;

  return (
    <div className="content" data-screen-label="Model Intelligence">
      <div className="card" style={{ marginBottom: 18, padding: '24px 28px', background: 'linear-gradient(135deg, rgba(99,102,241,.08), rgba(16,185,129,.06))' }}>
        <div className="between" style={{ alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div className="kpi-label" style={{ color: 'var(--indigo-2)' }}>Model intelligence · waste layer</div>
            <div className="card-title" style={{ fontSize: 20, marginTop: 6 }}>Teach the router which prompts need premium models</div>
            <p className="card-sub" style={{ maxWidth: 720, marginTop: 10, lineHeight: 1.65 }}>
              Every prompt has traits — length, complexity, task type. Cheap models (Haiku, 4o&nbsp;Mini, Flash) handle simple work;
              expensive ones (Sonnet, GPT‑4o, Gemini&nbsp;Pro) are for hard tasks. A classifier learns the boundary; every call logs
              <strong> actual vs optimal cost </strong> so you see waste and retrain on real failures.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="kpi-label">This month · est. waste</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--amber-2)', fontVariantNumeric: 'tabular-nums' }}>{M.fmtMoney(W.monthWasteUsd)}</div>
            <div className="dim" style={{ fontSize: 11.5, marginTop: 4 }}>Sample figures · {W.enterpriseCheapPromptPct} of prompts often routable to small models</div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Routing pipeline</div>
        <div className="card-sub">Prompt → features → classifier → cheap model → quality gate → escalate if needed → log api_calls</div>
        <div className="intel-flow" style={{ marginTop: 20 }}>
          <div className="intel-flow-step">Prompt</div>
          <span className="intel-flow-arrow">→</span>
          <div className="intel-flow-step">Router</div>
          <span className="intel-flow-arrow">→</span>
          <div className="intel-flow-step intel-cheap">Haiku / Mini / Flash</div>
          <span className="intel-flow-arrow">→</span>
          <div className="intel-flow-step">Quality check</div>
          <span className="intel-flow-arrow">↓</span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="tag tag-down" style={{ margin: 0 }}>pass → return</span>
            <span className="tag tag-amber" style={{ margin: 0 }}>fail → Sonnet / 4o / Pro</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 22 }}>
          {M.ML_PIPELINE_STEPS.map(s => (
            <div key={s.n} style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--indigo-2)', letterSpacing: '0.08em' }}>STEP {s.n}</div>
              <div style={{ fontWeight: 600, marginTop: 6, fontSize: 13 }}>{s.title}</div>
              <div className="dim" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5, fontWeight: 300 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="intel-stack-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Training dataset (examples)</div>
          <div className="card-sub">Label = cheapest model that still passed your quality bar</div>
          <div className="scroll-y" style={{ marginTop: 14, maxHeight: 280 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Prompt</th><th>Task</th><th>Complexity</th><th>Best model</th><th style={{ textAlign: 'right' }}>Saved</th>
                </tr>
              </thead>
              <tbody>
                {M.TRAINING_DATASET_EXAMPLES.map((r, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 220, fontWeight: 400 }}>{r.prompt}</td>
                    <td>{r.taskType}</td>
                    <td>{r.complexity}</td>
                    <td>{r.bestModel}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.costSaved > 0 ? '$' + r.costSaved.toFixed(3) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Feature engineering</div>
          <div className="card-sub">Turn text into numbers the classifier learns</div>
          <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.75, fontWeight: 300 }}>
            {M.PROMPT_FEATURE_DIMENSIONS.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div className="kpi-label" style={{ marginBottom: 8 }}>Classifier stack</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--text-dim)' }}>
              <div><strong style={{ color: 'var(--text)' }}>Features:</strong> {M.ML_CLASSIFIER_STACK.featureExtraction}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>Model:</strong> {M.ML_CLASSIFIER_STACK.classifier}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>Quality:</strong> {M.ML_CLASSIFIER_STACK.qualityGate}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>DB:</strong> {M.ML_CLASSIFIER_STACK.storage}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>API:</strong> {M.ML_CLASSIFIER_STACK.serving}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost reference */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Illustrative $/1K tokens (blended)</div>
        <div className="card-sub">Used to compute actual_cost, optimal_cost, and waste on each logged call</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {Object.entries(M.COST_PER_1K_ROUTER).map(([k, v]) => (
            <span key={k} className="mono" style={{ fontSize: 11.5, padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
              {k.replace(/-/g, '·')} <span style={{ color: 'var(--green-2)' }}>${v}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Waste dashboard */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="between">
            <div>
              <div className="card-title">Waste trend (sample)</div>
              <div className="card-sub">Daily $ left on the table — should fall as the router improves</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <AreaChart data={M.WASTE_TREND_30} color="#F59E0B" height={160} labels={['Week 1', '', 'Week 2', '', 'Week 3', '', 'Week 4']} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Rollups · spend_summary</div>
          <div className="card-sub">Pre-aggregated periods for fast dashboard queries</div>
          <table className="tbl" style={{ marginTop: 12 }}>
            <thead>
              <tr><th>Period</th><th style={{ textAlign: 'right' }}>Spent</th><th style={{ textAlign: 'right' }}>Waste</th><th style={{ textAlign: 'right' }}>Saved</th><th style={{ textAlign: 'right' }}>Routed</th><th style={{ textAlign: 'right' }}>Escalated</th></tr>
            </thead>
            <tbody>
              {M.SPEND_SUMMARY.map(row => (
                <tr key={row.period}>
                  <td className="mono">{row.period}</td>
                  <td style={{ textAlign: 'right' }}>{M.fmtMoney(row.totalSpent)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--amber-2)' }}>{M.fmtMoney(row.totalWaste)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--green-2)' }}>{M.fmtMoney(row.totalSaved)}</td>
                  <td style={{ textAlign: 'right' }}>{M.fmtNum(row.callsRouted)}</td>
                  <td style={{ textAlign: 'right' }}>{M.fmtNum(row.callsEscalated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="intel-stack-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Waste by model</div>
          <div className="card-sub">Premium used where cheap would suffice</div>
          {W.byModel.map(row => (
            <div key={row.model} className="between" style={{ marginTop: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}>{row.model}</span>
              <span className="dim" style={{ fontSize: 12 }}>{row.overkillCalls} calls</span>
              <span style={{ color: 'var(--amber-2)', fontWeight: 600, fontSize: 13 }}>{M.fmtMoney(row.wasteUsd)}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Waste by task type</div>
          <div className="card-sub">Where over-provisioning clusters</div>
          {W.byTaskType.map(row => (
            <div key={row.task} style={{ marginTop: 14 }}>
              <div className="between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{row.task}</span>
                <span style={{ color: 'var(--amber-2)', fontWeight: 600 }}>{M.fmtMoney(row.wasteUsd)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{row.pctOverprovisioned}% calls over-provisioned (sample)</div>
              <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ width: row.pctOverprovisioned + '%', height: '100%', background: 'linear-gradient(90deg,#F59E0B,#EF4444)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Top offenders</div>
          <div className="card-sub">Users & agents burning margin</div>
          {W.topOffenders.map((row, i) => (
            <div key={row.name} className="between" style={{ marginTop: i === 0 ? 12 : 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{row.name}</div>
                <div className="dim" style={{ fontSize: 11.5 }}>{row.team}</div>
              </div>
              <span style={{ color: 'var(--amber-2)', fontWeight: 600 }}>{M.fmtMoney(row.wasteUsd)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* api_calls sample */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">api_calls · sample rows</div>
        <div className="card-sub">Log every call: model_used, optimal_model, tokens, actual_cost, optimal_cost, waste, quality_score, escalated</div>
        <div className="scroll-y" style={{ marginTop: 14, maxHeight: 320 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>id</th><th>time</th><th>user</th><th>used</th><th>optimal</th><th style={{ textAlign: 'right' }}>in/out</th>
                <th style={{ textAlign: 'right' }}>actual</th><th style={{ textAlign: 'right' }}>optimal</th><th style={{ textAlign: 'right' }}>waste</th>
                <th>task</th><th style={{ textAlign: 'right' }}>Q</th><th>esc</th>
              </tr>
            </thead>
            <tbody>
              {M.API_CALLS_SAMPLE.map(r => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{r.timestamp}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{r.userId}</td>
                  <td>{r.modelUsed}</td>
                  <td>{r.optimalModel}</td>
                  <td style={{ textAlign: 'right', fontSize: 11.5 }}>{r.promptTokens}/{r.completionTokens}</td>
                  <td style={{ textAlign: 'right' }}>${r.actualCost.toFixed(4)}</td>
                  <td style={{ textAlign: 'right' }}>${r.optimalCost.toFixed(4)}</td>
                  <td style={{ textAlign: 'right', color: r.waste > 0 ? 'var(--amber-2)' : 'var(--text-mute)' }}>${r.waste.toFixed(4)}</td>
                  <td>{r.taskType}</td>
                  <td style={{ textAlign: 'right' }}>{r.qualityScore}</td>
                  <td>{r.escalated ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retrain */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Feedback loop → retrain</div>
        <div className="card-sub">Mine waste history for new training rows</div>
        <pre style={{
          margin: '14px 0 0',
          padding: 16,
          background: '#0A0C10',
          border: '1px solid var(--border)',
          borderRadius: 10,
          fontSize: 11.5,
          lineHeight: 1.55,
          overflow: 'auto',
          color: 'var(--text-dim)',
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}>{`# Example: premium used but quality says cheap would have worked
SELECT * FROM api_calls
WHERE model_used IN ('claude-3-5-sonnet', 'gpt-4o')
  AND quality_score >= 4
  AND optimal_model != model_used;

# → feed rows into training set: "this prompt shape did not need premium"`}</pre>
      </div>

      {/* Prompt library */}
      <div className="card">
        <div className="card-title">Prompt library index</div>
        <div className="card-sub">Notebook prompts & ideas integrated for reference (titles + how to use). Full prompt text lives in your source PDF.</div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {M.PROMPT_LIBRARY_INDEX.map(section => (
            <div key={section.part} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'var(--surface-2)', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--indigo-2)' }}>{section.part}</div>
              <div style={{ padding: '12px 14px' }}>
                {section.items.map((it, j) => (
                  <div key={j} style={{ padding: '10px 0', borderBottom: j < section.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{it.title}</div>
                    <div className="dim" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5, fontWeight: 300 }}>{it.use}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="dim" style={{ fontSize: 11.5, marginTop: 16, lineHeight: 1.6 }}>
          Python skeleton: <code className="mono" style={{ fontSize: 11 }}>python/router_service/</code>
          · SQL: <code className="mono" style={{ fontSize: 11 }}>schema/meridian_ml_waste.sql</code>
        </p>
      </div>

    </div>
  );
}

window.PageIntelligence = PageIntelligence;
