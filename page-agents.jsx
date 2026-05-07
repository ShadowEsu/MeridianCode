function PageAgents() {
  const M = window.MERIDIAN;
  const warnAgent = M.AGENTS.find(a => a.status === 'warning') || M.AGENTS[0];
  const activeCount = M.AGENTS.filter(a => a.status === 'running').length || 18;
  const riskCount = M.AGENTS.filter(a => a.status === 'warning').length || 2;

  return (
    <div className="content" data-screen-label="Agent Monitor">
      {/* Runaway alert bar (Stitch) */}
      <div
        style={{
          margin: '-28px -28px 18px',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'rgba(147,0,10,.20)',
          borderBottom: '1px solid rgba(239,68,68,.30)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ color: 'var(--red)', display: 'grid', placeItems: 'center' }}>
            {Icon.warning({ width: 16, height: 16 })}
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 700, color: '#FCA5A5', textTransform: 'uppercase' }}>
            Runaway risk detected
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,218,214,.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Agent "{warnAgent?.name || 'Neural_Scraper_v4'}" is executing a recursive loop in Production environment.
          </div>
        </div>
        <button className="btn btn-danger" style={{ padding: '7px 12px', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          Intercept now
        </button>
      </div>

      {/* Stitch bento layout */}
      <div className="stitch-grid-12" style={{ marginBottom: 16 }}>
        {/* Cost Avoidance */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: `calc(18px * var(--ui))`, borderColor: 'rgba(45,45,49,1)', background: 'var(--surface)' }}>
          <div className="between" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: `calc(14px * var(--ui))`, fontWeight: 600, color: 'var(--indigo-2)', fontFamily: 'var(--font-display)' }}>Cost Avoidance</div>
            <div style={{ color: 'var(--indigo-2)' }}>{Icon.bell({ width: 16, height: 16 })}</div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div className="kpi-label" style={{ color: 'rgba(255,255,255,.35)' }}>WITHOUT MERIDIAN (EST.)</div>
              <div style={{ fontSize: `calc(32px * var(--ui))`, color: 'rgba(255,255,255,.28)', textDecoration: 'line-through', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                $14,282.50
              </div>
            </div>
            <div>
              <div className="kpi-label" style={{ color: 'var(--green-2)' }}>SAVED THIS MONTH</div>
              <div style={{ fontSize: `calc(32px * var(--ui))`, color: 'var(--green-2)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                $9,410.15
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(45,45,49,.55)', color: 'rgba(255,255,255,.45)', fontStyle: 'italic', fontSize: 12.5 }}>
            "Autonomous intercept triggered 42 times in last 24h."
          </div>
        </div>

        {/* Critical Active Sessions */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gap: 12 }}>
          <div className="between">
            <div style={{ fontSize: `calc(15px * var(--ui))`, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>Critical Active Sessions</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)' }} />
                {activeCount} active
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--amber-2)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--amber)' }} />
                {riskCount} at risk
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            {M.AGENTS.slice(0, 4).map(a => <StitchAgentCard key={a.name} a={a} />)}
          </div>
        </div>
      </div>

      {/* Middle row: kill switch + table */}
      <div className="stitch-grid-12" style={{ marginBottom: 16 }}>
        <div className="glass-panel" style={{ gridColumn: 'span 3', padding: `calc(18px * var(--ui))` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ color: 'var(--red)' }}>{Icon.warning({ width: 16, height: 16 })}</div>
            <div style={{ fontSize: `calc(14.5px * var(--ui))`, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>Kill Switch Protocol</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <KillCheck label="Lock Virtual Keys" sub="Revoke all active session auth" />
            <KillCheck label="Pause Loop Agents" sub="Suspend sessions > 70% risk" />
            <KillCheck label="Global Shutdown" sub="Full operational cessation" />
            <button className="btn btn-danger" style={{ marginTop: 6, width: '100%', justifyContent: 'center', letterSpacing: '0.10em', textTransform: 'uppercase', fontSize: 11 }}>
              Execute selected override
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ gridColumn: 'span 9', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: `calc(14.5px * var(--ui))`, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>Historical Cost Anomalies</div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>{Icon.download()}</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'rgba(255,255,255,.35)', background: 'rgba(255,255,255,.04)', borderBottom: '1px solid var(--border-2)' }}>
                  <th style={th}>Agent name</th>
                  <th style={th}>Completion status</th>
                  <th style={{ ...th, textAlign: 'right' }}>Duration</th>
                  <th style={{ ...th, textAlign: 'right' }}>Total cost</th>
                  <th style={{ ...th, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {M.AGENT_HISTORY.slice(0, 4).map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(45,45,49,.55)' }}>
                    <td style={td}><span style={{ color: 'rgba(255,255,255,.88)', fontWeight: 600 }}>{h.name}</span></td>
                    <td style={td}>
                      <StatusPill status={h.status} />
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: 'rgba(255,255,255,.45)' }}>{h.duration}</td>
                    <td style={{ ...td, textAlign: 'right', color: '#fff', fontWeight: 700 }}>${h.cost}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px', color: 'var(--indigo-2)' }}>View log</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="card-title">Historical Agent Runs</div>
            <div className="card-sub">{M.AGENT_HISTORY.length} sessions · last 14 days</div>
          </div>
          <button className="btn">{Icon.download()} Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Agent</th><th>Team</th><th>Start</th><th>Duration</th><th style={{textAlign:'right'}}>Calls</th><th style={{textAlign:'right'}}>Cost</th><th>Status</th><th>Loop</th><th style={{textAlign:'right'}}>Cost Avoided</th></tr>
          </thead>
          <tbody>
            {M.AGENT_HISTORY.map((h, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 400 }}>{h.name}</td>
                <td className="dim">{h.team}</td>
                <td className="mono dim" style={{ fontSize: 11 }}>{h.start}</td>
                <td>{h.duration}</td>
                <td style={{ textAlign: 'right' }}>{h.calls.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>${h.cost}</td>
                <td>
                  <span className={`dot-status status-${h.status === 'completed' ? 'green' : h.status === 'warning' ? 'amber' : 'red'}`}></span>
                  <span style={{ fontSize: 11.5, textTransform: 'capitalize' }}>{h.status}</span>
                </td>
                <td>
                  {h.loop === 'Yes'
                    ? <span style={{ color: '#FCA5A5', fontWeight: 500, fontSize: 11.5 }}>● Yes</span>
                    : <span className="dim">No</span>}
                </td>
                <td style={{ textAlign: 'right', color: h.avoided > 0 ? 'var(--green-2)' : 'var(--text-mute)', fontWeight: h.avoided > 0 ? 600 : 300, fontSize: h.avoided > 0 ? 14 : 12.5 }}>
                  {h.avoided > 0 ? '$' + h.avoided.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: '12px 16px', fontWeight: 700, fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' };
const td = { padding: '12px 16px' };

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();
  const map = {
    completed: ['var(--green)', 'Intercepted'],
    warning: ['var(--amber)', 'Warning'],
    terminated: ['var(--red)', 'Forced kill'],
  };
  const [c, label] = map[s] || ['rgba(255,255,255,.25)', 'Normal exit'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: c }} />
      <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700, color: c }}>{label}</span>
    </span>
  );
}

function KillCheck({ label, sub }) {
  return (
    <label style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>
      <input type="checkbox" style={{ marginTop: 2 }} />
      <div style={{ display: 'grid', gap: 2 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.88)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.35)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>{sub}</div>
      </div>
    </label>
  );
}

function StitchAgentCard({ a }) {
  const isRisk = a.status === 'warning';
  const riskColor = isRisk ? 'var(--red)' : 'rgba(255,255,255,.55)';
  const riskLabel = isRisk ? 'LOOP RISK' : 'STABLE';
  const riskPct = typeof a.loopRisk === 'number' ? a.loopRisk : 12;
  const bars = isRisk ? [2, 4, 6, 5, 8] : [1, 2, 1, 3, 2];
  return (
    <div className="glass-panel" style={{ padding: 16, borderColor: 'var(--border-2)' }}>
      <div className="between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'rgba(255,255,255,.88)', fontFamily: 'var(--font-display)' }}>{a.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>ID: {a.id || '0x9482..FE4'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, color: riskColor }}>{riskLabel}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: riskColor, marginTop: 4 }}>{riskPct}%</div>
        </div>
      </div>
      <div className="between" style={{ alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,.35)' }}>SESSION COST</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 6 }}>${Number(a.cost || 24.18).toFixed(2)}</div>
        </div>
        <div style={{ width: 96, height: 34, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: h * 4, background: isRisk ? 'rgba(239,68,68,.25)' : 'rgba(99,102,241,.45)' }} />
          ))}
          <div style={{ flex: 1, height: (isRisk ? 8 : 6) * 4, background: isRisk ? 'var(--red)' : 'var(--indigo)' }} />
        </div>
      </div>
    </div>
  );
}

function AgentCard({ a }) {
  const statusColor = a.status === 'running' ? 'var(--green)' : a.status === 'warning' ? 'var(--amber)' : 'var(--red)';
  const statusLabel = a.status === 'running' ? 'Running' : a.status === 'warning' ? 'Warning' : 'Terminated';
  const isWarning = a.status === 'warning';
  const isTerminated = a.status === 'terminated';

  // Sparkline data
  const sparkData = a.sparkType === 'spike' ? [10, 11, 12, 14, 18, 28, 42, 60, 85, 120]
    : a.sparkType === 'runaway' ? [12, 24, 48, 96, 180, 280, 380, 480, 580, 700]
    : Array.from({ length: 10 }, (_, i) => 20 + Math.sin(i) * 3 + i * 0.5);

  return (
    <div className="card" style={{
      borderColor: isWarning ? 'rgba(245,158,11,.4)' : isTerminated ? 'rgba(239,68,68,.3)' : undefined,
      boxShadow: isWarning ? '0 0 0 1px rgba(245,158,11,.2), 0 0 30px -10px rgba(245,158,11,.3)' : undefined,
      background: isWarning ? 'radial-gradient(ellipse at top right, rgba(245,158,11,.06), transparent 60%), var(--surface)' : undefined,
    }}>
      <div className="between">
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{a.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 300, marginTop: 2 }}>{a.team} · {a.duration}</div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: statusColor, fontWeight: 500, padding: '4px 10px', background: `${statusColor}1a`, border: `1px solid ${statusColor}40`, borderRadius: 5 }}>
          <span className={`dot-status ${a.status === 'running' ? 'status-green' : a.status === 'warning' ? 'status-amber' : 'status-red'}`}></span>
          {statusLabel}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18 }}>
        <div>
          <div className="kpi-label">Calls</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{a.calls.toLocaleString()}</div>
        </div>
        <div>
          <div className="kpi-label">Cost</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums', color: a.cost > 30 ? 'var(--amber-2)' : 'var(--text)' }}>${a.cost.toFixed(2)}</div>
        </div>
        <div>
          <div className="kpi-label">Loop risk</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4, color: a.loopRisk > 70 ? '#FCA5A5' : a.loopRisk > 40 ? 'var(--amber-2)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{a.loopRisk}%</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Sparkline data={sparkData} color={isWarning ? '#F59E0B' : isTerminated ? '#EF4444' : '#10B981'} width={180} height={36} fill={true} />
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 9px' }}>{Icon.pause()}</button>
          <button className="btn btn-danger" style={{ padding: '6px 10px' }}>Terminate</button>
          <button className="btn">Logs</button>
        </div>
      </div>
    </div>
  );
}

function KillRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-dim)', fontWeight: 300 }}>{label}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div className="toggle on"></div>
      </div>
    </div>
  );
}

/** Small stat block (was shared with Model Router page; keep local now that router script is optional). */
function Stat({ label, value, sub, highlight }) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 8, letterSpacing: '-0.02em', color: highlight ? 'var(--green-2)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-mute)', fontWeight: 300, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

window.PageAgents = PageAgents;
