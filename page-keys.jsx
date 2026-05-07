function PageKeys({ keysFilter }) {
  const M = window.MERIDIAN;
  const [filter, setFilter] = React.useState(keysFilter || '');

  React.useEffect(() => { if (keysFilter) setFilter(keysFilter); }, [keysFilter]);

  const filteredKeys = M.VIRTUAL_KEYS.filter(k =>
    !filter || k.name.toLowerCase().includes(filter.toLowerCase()) || k.team.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="content" data-screen-label="Virtual Keys">
      {/* Header section (Stitch) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div className="kpi-label" style={{ color: 'var(--indigo-2)' }}>Operational overview</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: `calc(28px * var(--ui))`, letterSpacing: '-0.02em', color: '#fff', marginTop: 6 }}>
            Budgets &amp; Allocation
          </div>
          <div style={{ marginTop: 8, maxWidth: 720, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>
            Financial governance for agent infrastructure. Monitor token consumption, liquidity reserves, and attribution across virtual team environments.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 14, minWidth: 160 }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,.45)' }}>Total spend</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', marginTop: 8 }}>$14,204.50</div>
          </div>
          <div className="glass-panel" style={{ padding: 14, minWidth: 160 }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,.45)' }}>Est. savings</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--green-2)', marginTop: 8 }}>+$2,840.12</div>
          </div>
        </div>
      </div>

      {/* Bento stats */}
      <div className="stitch-grid-3" style={{ marginBottom: 16 }}>
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: 18, overflow: 'hidden', position: 'relative' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#fff', fontWeight: 600 }}>Consumption Velocity</div>
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,.55)' }}>Across all active virtual clusters.</div>
          </div>
          <div style={{ height: 110, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
            {[0.4,0.6,0.55,0.8,0.65,0.9,0.75].map((h,i)=>(
              <div key={i} style={{ flex: 1, height: `${h*100}%`, background: i === 6 ? 'var(--indigo)' : `rgba(99,102,241,${0.18 + i*0.06})` }} />
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 18, background: 'var(--surface-2)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#fff', fontWeight: 600 }}>Risk Profile</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <RiskRow label="Over Budget" value="3 keys" tone="red" />
            <RiskRow label="Idle Resources" value="12% fleet" tone="amber" />
            <RiskRow label="Healthy Status" value="42 keys" tone="green" />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center', letterSpacing: '0.10em', textTransform: 'uppercase', fontSize: 11 }}>
            Reconcile all
          </button>
        </div>
      </div>

      {/* Dense table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.03)' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <button type="button" style={tabBtnActive}>ALL TEAMS</button>
            <button type="button" style={tabBtn}>ENGINEERING</button>
            <button type="button" style={tabBtn}>MARKETING</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>{Icon.warning({ width: 14, height: 14 })}</button>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>{Icon.download()}</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-2)' }}>
                <th style={th}>Key ID / Identifier</th>
                <th style={th}>Team entity</th>
                <th style={{ ...th, textAlign: 'right' }}>Spend (MTD)</th>
                <th style={th}>Budget allocation</th>
                <th style={{ ...th, textAlign: 'right' }}>Efficiency</th>
                <th style={{ ...th, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {filteredKeys.slice(0, 8).map(k => {
                const pct = (k.spend / k.budget) * 100;
                const tone = pct > 100 ? 'red' : pct > 90 ? 'amber' : 'indigo';
                return (
                  <tr key={k.name} style={{ borderBottom: '1px solid rgba(45,45,49,.55)' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'rgba(129,140,248,.95)' }}>{Icon.key({ width: 16, height: 16 })}</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{k.name}</span>
                      </div>
                    </td>
                    <td style={{ ...td, color: 'rgba(255,255,255,.55)' }}>{k.team}</td>
                    <td style={{ ...td, textAlign: 'right', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>${k.spend.toLocaleString()}</td>
                    <td style={td}>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <div style={{ fontSize: 10.5, color: tone === 'amber' ? 'var(--amber-2)' : tone === 'red' ? '#FCA5A5' : 'rgba(255,255,255,.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {pct.toFixed(0)}% of ${Math.round(k.budget/1000)}k
                        </div>
                        <div style={{ height: 4, background: 'var(--border-2)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: tone === 'amber' ? 'var(--amber)' : tone === 'red' ? 'var(--red)' : 'var(--indigo)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: tone === 'red' ? 'var(--red)' : 'var(--green-2)', fontWeight: 600 }}>+{(Math.random()*20).toFixed(1)}%</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <KeyStatus pct={pct} status={k.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,.45)', fontSize: 12 }}>
          <span>Showing 1-{Math.min(8, filteredKeys.length)} of {M.VIRTUAL_KEYS.length} virtual keys</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>Prev</button>
            <button className="btn" style={{ padding: '6px 10px', background: '#fff', color: '#000', borderColor: '#fff' }}>1</button>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>2</button>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabBtn = {
  background: 'transparent',
  border: '0',
  padding: '6px 4px',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,.45)',
};

const tabBtnActive = {
  ...tabBtn,
  color: '#fff',
  borderBottom: '2px solid #6366F1',
};

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', fontWeight: 700, whiteSpace: 'nowrap' };
const td = { padding: '12px 16px', whiteSpace: 'nowrap' };

function RiskRow({ label, value, tone }) {
  const map = { red: ['var(--red)', 'rgba(239,68,68,.10)'], amber: ['var(--amber)', 'rgba(245,158,11,.10)'], green: ['var(--green)', 'rgba(16,185,129,.10)'] };
  const [c, bg] = map[tone] || map.green;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,.55)' }}>{label}</span>
      <span style={{ padding: '4px 8px', background: bg, border: `1px solid ${c}33`, color: c, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 800 }}>
        {value}
      </span>
    </div>
  );
}

function KeyStatus({ pct, status }) {
  const s = String(status || '').toLowerCase();
  const tone = pct > 100 ? 'red' : pct > 90 ? 'amber' : s === 'active' ? 'green' : 'amber';
  const map = {
    green: ['var(--green)', 'Active'],
    amber: ['var(--amber)', 'At Risk'],
    red: ['var(--red)', 'Over Limit'],
  };
  const [c, label] = map[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, background: `${c}12`, border: `1px solid ${c}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: c }}>{label}</span>
    </span>
  );
}

window.PageKeys = PageKeys;
