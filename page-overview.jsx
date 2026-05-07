function PageOverview() {
  const M = window.MERIDIAN;
  const labels = ['Apr 4', 'Apr 10', 'Apr 16', 'Apr 22', 'Apr 28'];

  const teamColors = {
    Engineering: '#F59E0B',
    'Data Science': '#FBBF24',
    Marketing: '#EC4899',
    Product: '#10B981',
    Sales: '#F59E0B',
    DevOps: '#14B8A6',
  };

  return (
    <div className="content" data-screen-label="Overview">
      {/* Overview layout aligned to provided HTML (glass KPI cards + charts + table) */}
      <div style={{ display: 'grid', gap: 16 }}>
        {/* Hero Row: KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20, overflow: 'hidden' }}>
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <div className="kpi-label">Total Revenue</div>
              <div style={{ color: 'var(--indigo-2)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Payments
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 300, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  $93,450
                </div>
                <div style={{ marginTop: 8, fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--indigo-2)', fontWeight: 500 }}>
                  +12.4% FROM PREV MONTH
                </div>
              </div>
              <MiniBars color="rgba(99,102,241,1)" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 20, overflow: 'hidden' }}>
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <div className="kpi-label">Active Agents</div>
              <div style={{ color: 'var(--amber-2)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Robot
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 300, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  42
                </div>
                <div style={{ marginTop: 8, fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--amber-2)', fontWeight: 500 }}>
                  98% ALLOCATION RATE
                </div>
              </div>
              <MiniBars color="rgba(245,158,11,1)" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 20, overflow: 'hidden' }}>
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <div className="kpi-label">Fleet Uptime</div>
              <div style={{ color: 'var(--green-2)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Ops
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 300, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  99.99%
                </div>
                <div style={{ marginTop: 8, fontSize: 10.5, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--green-2)', fontWeight: 500 }}>
                  NOMINAL OPERATIONAL STATUS
                </div>
              </div>
              <MiniBars color="rgba(16,185,129,1)" />
            </div>
          </div>
        </div>

        {/* Second Row: Charts (7/3 split) */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20 }}>
            <div className="between" style={{ alignItems: 'center' }}>
              <div className="kpi-label" style={{ color: 'var(--text)' }}>Financial Overview</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 10.5, color: 'var(--text-dim)', fontWeight: 400, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, background: 'var(--indigo-2)', display: 'inline-block' }} />
                  Projected
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, background: 'rgba(255,255,255,.18)', display: 'inline-block' }} />
                  Actual
                </span>
              </div>
            </div>

            {/* Simple bar-pair chart (React-friendly, no Tailwind) */}
            <div style={{ marginTop: 18, height: 280, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, alignItems: 'end', position: 'relative' }}>
              <ChartGridLines />
              {[
                { m: 'JAN', a: 0.60, p: 0.40 },
                { m: 'FEB', a: 0.55, p: 0.45 },
                { m: 'MAR', a: 0.75, p: 0.65 },
                { m: 'APR', a: 0.40, p: 0.50 },
                { m: 'MAY', a: 0.90, p: 0.80 },
                { m: 'JUN', a: 0.85, p: 0.70 },
              ].map(({ m, a, p }) => (
                <div key={m} style={{ position: 'relative', zIndex: 2, display: 'grid', gap: 6, justifyItems: 'stretch' }}>
                  <div style={{ height: Math.round(280 * a), background: 'rgba(255,255,255,.10)', borderRadius: 6 }} />
                  <div style={{ height: Math.round(280 * p), background: 'rgba(99,102,241,.95)', borderRadius: 6 }} />
                  <div style={{ marginTop: 6, fontSize: 10.5, color: 'rgba(255,255,255,.35)', letterSpacing: '0.10em', textTransform: 'uppercase', textAlign: 'center', fontWeight: 600 }}>
                    {m}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div className="kpi-label" style={{ color: 'var(--text)' }}>Model Distribution</div>
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', paddingTop: 8 }}>
              <div style={{ position: 'relative' }}>
                <Donut
                  size={180}
                  hole={64}
                  slices={[
                    { value: 58, color: 'rgba(99,102,241,.95)' },
                    { value: 32, color: 'rgba(245,158,11,.95)' },
                    { value: 10, color: 'rgba(255,255,255,.12)' },
                  ]}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>V4.2</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Dominant
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', marginTop: 18, display: 'grid', gap: 10 }}>
                <LegendRow label="MERIDIAN PRIME" pct="58%" color="rgba(99,102,241,.95)" />
                <LegendRow label="NEXUS CORE" pct="32%" color="rgba(245,158,11,.95)" />
                <LegendRow label="LEGACY X" pct="10%" color="rgba(255,255,255,.18)" />
              </div>
            </div>
          </div>
        </div>

        {/* Third Row: Transaction Table (styled like glass panel) */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div className="kpi-label" style={{ color: 'var(--text)' }}>System Transactions</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" type="button" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Export CSV</button>
              <button className="btn btn-ghost" type="button" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Filter</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr style={{ color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>Transaction ID</th>
                  <th style={th}>Asset Name</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Status</th>
                  <th style={th}>Timestamp</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text)' }}>
                <TxRow id="#TX-984210" asset="Atlas Heavy Carrier" amount="$12,400.00" status="Active" statusColor="var(--indigo-2)" ts="2023.10.24 14:22:01" />
                <TxRow id="#TX-984211" asset="Sentry Drone Hive" amount="$4,250.00" status="Alert" statusColor="var(--amber-2)" ts="2023.10.24 15:45:12" alt />
                <TxRow id="#TX-984212" asset="Ion Grid Relay" amount="$28,900.00" status="Inactive" statusColor="rgba(255,255,255,.35)" ts="2023.10.24 16:10:55" />
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border)', background: 'rgba(10,10,11,.35)' }}>
                  <td colSpan={6} style={{ padding: 0 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '14px 16px',
                        border: '0',
                        borderRadius: 0,
                        background: 'transparent',
                        color: 'var(--indigo-2)',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                      }}
                    >
                      + Add New Action
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Keep existing team spend/budget section as a real-data-backed module */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-title">Spend by team</div>
            <div className="card-sub">
              {M.TEAMS.length} groups · {M.fmtMoney(M.totalSpend)} total ·{' '}
              <span className="dim" title={M.TEAM_SPEND_CUSTOMIZATION.description}>
                Future: map accounts and prompt sources to each group
              </span>
            </div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {M.TEAMS.map(t => {
                const pct = (t.spend / t.budget) * 100;
                const c = teamColors[t.name];
                return (
                  <div key={t.id || t.name}>
                    <div className="between" style={{ marginBottom: 7 }}>
                      <div style={{ fontSize: 13 }}>{t.name}</div>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 300, fontSize: 11.5 }}>
                        <span>{M.fmtMoney(t.spend)}</span>
                        <span style={{ color: pct > 80 ? 'var(--amber-2)' : 'var(--text-mute)', fontWeight: 500, minWidth: 38, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <HBar value={t.spend} max={t.budget} color={c} height={5} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Budget Utilization</div>
            <div className="card-sub">{M.fmtMoney(M.budgetCap)} monthly cap</div>
            <div style={{ marginTop: 20 }}>
              <BudgetGauge used={M.totalSpend} cap={M.budgetCap} projected={M.projectedEOM} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = { padding: '14px 18px', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' };

function KPICard({ label, value, sub, spark, sparkColor, amber }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="between">
        <div className="kpi-label">{label}</div>
        <Sparkline data={spark} color={sparkColor} width={70} height={22} fill={false} />
      </div>
      <div className="kpi-value" style={{ color: amber ? 'var(--amber-2)' : 'var(--text)' }}>{value}</div>
      <div className="kpi-foot">{sub}</div>
    </div>
  );
}

function BudgetGauge({ used, cap, projected }) {
  const pct = (used / cap) * 100;
  const projPct = (projected / cap) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber-2)', letterSpacing: '-0.02em' }}>{pct.toFixed(0)}%</div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 300 }}>used</div>
      </div>
      <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,.04)', borderRadius: 7, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}></div>
        <div style={{ position: 'absolute', top: -3, bottom: -3, left: projPct + '%', width: 2, background: '#FCA5A5', boxShadow: '0 0 6px #EF4444' }}></div>
      </div>
    </div>
  );
}

function MiniBars({ color }) {
  const bars = [0.4, 0.6, 0.5, 0.8, 0.7];
  return (
    <div style={{ width: 92, height: 44, display: 'flex', alignItems: 'flex-end', gap: 6, paddingBottom: 6, opacity: 0.9 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 10, height: Math.round(44 * h), background: color, opacity: 0.2 + i * 0.2 }} />
      ))}
    </div>
  );
}

function ChartGridLines() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', display: 'grid', gridTemplateRows: 'repeat(4, 1fr)' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />
    </div>
  );
}

function LegendRow({ label, pct, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.65)' }}>
        <span style={{ width: 8, height: 8, background: color, display: 'inline-block' }} />
        <span>{label}</span>
      </div>
      <div style={{ color: 'var(--text)', fontWeight: 500, letterSpacing: 0 }}>{pct}</div>
    </div>
  );
}

function TxRow({ id, asset, amount, status, statusColor, ts, alt }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)', background: alt ? 'rgba(255,255,255,.02)' : 'transparent' }}>
      <td style={{ padding: '14px 18px', color: 'var(--indigo-2)', fontWeight: 500, whiteSpace: 'nowrap' }}>{id}</td>
      <td style={{ padding: '14px 18px', fontStyle: 'italic' }}>{asset}</td>
      <td style={{ padding: '14px 18px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{amount}</td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, background: statusColor, display: 'inline-block' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500 }}>{status}</span>
        </span>
      </td>
      <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap' }}>{ts}</td>
      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
        <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }}>…</button>
      </td>
    </tr>
  );
}

window.PageOverview = PageOverview;
