// Model Router page — neural graph + savings bank + rules
function PageRouter() {
  const M = window.MERIDIAN;
  const [hovered, setHovered] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [rules, setRules] = React.useState(M.ROUTING_RULES);
  const [nodes, setNodes] = React.useState(() => initNodes());
  const [t, setT] = React.useState(0);
  const dragRef = React.useRef({ id: null, ox: 0, oy: 0, vx: 0, vy: 0 });

  React.useEffect(() => {
    let raf;
    const tick = () => {
      setT(p => p + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function initNodes() {
    const cx = 400, cy = 240;
    const arr = [{ id: 'meridian', x: cx, y: cy, r: 38, color: '#6366F1', name: 'Meridian', center: true }];
    const radii = 175;
    M.MODELS.forEach((m, i) => {
      const ang = (i / M.MODELS.length) * Math.PI * 2 - Math.PI / 2;
      arr.push({
        id: m.id,
        x: cx + radii * Math.cos(ang) + (i % 2 === 0 ? 12 : -12),
        y: cy + radii * Math.sin(ang) * 0.78,
        r: 18 + (m.share / 51) * 14,
        color: m.color,
        name: m.short,
        full: m.name,
        share: m.share,
        model: m,
      });
    });
    return arr;
  }

  const onMouseDown = (e, id) => {
    if (id === 'meridian') return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, ox: 0, oy: 0 };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.id) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    setNodes(ns => ns.map(n => n.id === dragRef.current.id ? { ...n, x: n.x + dx, y: n.y + dy } : n));
  };
  const onMouseUp = () => { dragRef.current = { id: null }; };

  const meridian = nodes[0];
  const idleOsc = Math.sin(t * 0.04) * 1.5;

  return (
    <div className="content" data-screen-label="Model Router">
      {/* GRAPH */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        <div className="between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="card-title">Routing Network</div>
            <div className="card-sub">Drag nodes · Hover for details · Click to inspect</div>
          </div>
          <button className="btn btn-primary">{Icon.plus()} Connect Model</button>
        </div>
        <svg viewBox="0 0 800 480" style={{ width: '100%', height: 480, display: 'block', background: '#080A0E', cursor: dragRef.current.id ? 'grabbing' : 'default' }}
          onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        >
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="#1A1F2A" />
            </pattern>
            <radialGradient id="halo-meridian">
              <stop offset="0%" stopColor="#818CF8" stopOpacity=".7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </radialGradient>
            {M.MODELS.map(m => (
              <radialGradient key={m.id} id={`halo-${m.id}`}>
                <stop offset="0%" stopColor={m.color} stopOpacity=".6" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <rect width="800" height="480" fill="url(#dots)" />

          {/* Connections */}
          {nodes.slice(1).map((n, i) => {
            const mx = (meridian.x + n.x) / 2 + (i % 2 === 0 ? 18 : -18);
            const my = (meridian.y + n.y) / 2 + (i % 2 === 0 ? -10 : 10);
            return (
              <g key={'c-' + n.id}>
                <path d={`M${meridian.x},${meridian.y} Q${mx},${my} ${n.x},${n.y}`} stroke={n.color} strokeOpacity="0.18" strokeWidth="1.2" fill="none" />
                {/* Animated dots */}
                {[0, 0.3, 0.6, 0.9].map((off, di) => {
                  const speed = n.model ? Math.max(0.0008, n.model.share * 0.0001) : 0.001;
                  const p = ((t * speed + off) % 1);
                  const tt = p;
                  const x = (1-tt)*(1-tt)*meridian.x + 2*(1-tt)*tt*mx + tt*tt*n.x;
                  const y = (1-tt)*(1-tt)*meridian.y + 2*(1-tt)*tt*my + tt*tt*n.y;
                  return <circle key={di} cx={x} cy={y} r="1.8" fill={n.color} opacity={0.7 - p * 0.6} />;
                })}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const isCenter = n.center;
            const r = n.r + (isCenter ? idleOsc : 0);
            const isSelected = selected === n.id;
            return (
              <g key={n.id} onMouseDown={(e) => onMouseDown(e, n.id)} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} onClick={() => !isCenter && setSelected(n.id)} style={{ cursor: isCenter ? 'default' : 'grab' }}>
                <circle cx={n.x} cy={n.y} r={r * 2.4} fill={`url(#halo-${isCenter ? 'meridian' : n.id})`} />
                <circle cx={n.x} cy={n.y} r={r} fill={n.color} opacity="0.92" stroke={isSelected ? '#fff' : 'rgba(255,255,255,.2)'} strokeWidth={isSelected ? 2 : 1} />
                <text x={n.x} y={n.y + r + 16} textAnchor="middle" fill="#E6E8EC" fontSize="11" fontWeight={isCenter ? 600 : 400}>{n.name}</text>
                {isCenter && <text x={n.x} y={n.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="500" letterSpacing="1">CORE</text>}
              </g>
            );
          })}

          {/* Tooltip */}
          {hovered && hovered !== 'meridian' && (() => {
            const n = nodes.find(x => x.id === hovered);
            if (!n || !n.model) return null;
            const m = n.model;
            const tx = Math.min(n.x + 26, 580);
            const ty = Math.max(20, n.y - 80);
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width="200" height="116" rx="8" fill="#14171F" stroke="#262A33" />
                <text x={tx + 12} y={ty + 18} fill="#E6E8EC" fontSize="11.5" fontWeight="500">{m.name}</text>
                <text x={tx + 12} y={ty + 36} fill="#9097A3" fontSize="10">${m.costPer1K.toFixed(4)} / 1K tokens</text>
                <text x={tx + 12} y={ty + 54} fill="#9097A3" fontSize="10">{m.callsMonth.toLocaleString()} calls · ${m.spend.toLocaleString()}</text>
                <text x={tx + 12} y={ty + 72} fill="#9097A3" fontSize="10">{m.latency}ms avg latency</text>
                <text x={tx + 12} y={ty + 92} fill={m.status === 'green' ? '#34D399' : '#FBBF24'} fontSize="10">● {m.status === 'green' ? 'Healthy' : 'Degraded'}</text>
                <text x={tx + 12} y={ty + 108} fill="#6366F1" fontSize="10">2 routing rules → this model</text>
              </g>
            );
          })()}

          {/* Minimap */}
          <g transform="translate(672, 388)">
            <rect width="120" height="80" rx="6" fill="#0F1218" stroke="#262A33" />
            {nodes.map(n => (
              <circle key={'mm-' + n.id} cx={6 + (n.x / 800) * 108} cy={6 + (n.y / 480) * 68} r={n.center ? 2.5 : 1.6} fill={n.color} />
            ))}
            <text x="6" y="-4" fontSize="9" fill="#5A616E">MINIMAP</text>
          </g>
        </svg>
      </div>

      {/* RULES TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        <div className="between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="card-title">Routing Rules</div>
            <div className="card-sub">{rules.filter(r => r.enabled).length} active · ${rules.reduce((s, r) => s + r.saved, 0).toLocaleString()} saved this month</div>
          </div>
          <button className="btn">{Icon.plus()} New Rule</button>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Condition</th><th>Target Model</th><th style={{ textAlign: 'right' }}>Requests</th><th style={{ textAlign: 'right' }}>Money Saved</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 400 }}>{r.condition}</td>
                <td><span className="model-badge model-claude" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>→ {r.target}</span></td>
                <td style={{ textAlign: 'right' }}>{r.requests.toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: r.saved > 0 ? 'var(--green-2)' : 'var(--text-mute)', fontWeight: r.saved > 0 ? 600 : 300, fontSize: r.saved > 0 ? 14 : 12.5 }}>
                  {r.saved > 0 ? '$' + r.saved.toLocaleString() : '—'}
                </td>
                <td>
                  <div className={`toggle ${r.enabled ? 'on' : ''}`} onClick={() => setRules(rs => rs.map(x => x.id === r.id ? { ...x, enabled: !x.enabled } : x))}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EFFECTIVENESS + BANK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 18 }}>
        <div className="card">
          <div className="card-title">Routing Effectiveness</div>
          <div className="card-sub">Last 30 days</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 22 }}>
            <Stat label="Rerouted" value="1,134,500" sub="39.8% of traffic" />
            <Stat label="Saved" value={M.fmtMoney(M.routingSavings)} sub="vs default model" highlight />
            <Stat label="Quality match" value="96.2%" sub="output equivalence" />
          </div>
          <div style={{ marginTop: 28 }}>
            <AreaChart data={M.ROUTING_SAVINGS_30} color="#10B981" height={140} labels={['Apr 4','Apr 10','Apr 16','Apr 22','Apr 28']} />
          </div>
        </div>

        <SavingsBank amount={M.routingSavings} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 8, letterSpacing: '-0.02em', color: highlight ? 'var(--green-2)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-mute)', fontWeight: 300, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function SavingsBank({ amount }) {
  const fillPct = 0.72; // visual fill
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="card-title">Savings Vault</div>
      <div className="card-sub">Banked from smart routing this month</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 18 }}>
        <svg viewBox="0 0 200 180" width="200" height="180" style={{ flexShrink: 0 }}>
          {/* Roof / pediment */}
          <polygon points="20,60 180,60 100,18" className="bank-line" />
          <line x1="14" y1="62" x2="186" y2="62" className="bank-line" />
          <line x1="20" y1="60" x2="20" y2="160" className="bank-line" />
          <line x1="180" y1="60" x2="180" y2="160" className="bank-line" />
          <line x1="14" y1="160" x2="186" y2="160" className="bank-line" />
          {/* Columns */}
          {[40, 70, 100, 130, 160].map((x, i) => (
            <line key={i} x1={x} y1="68" x2={x} y2="150" className="bank-line" />
          ))}
          {/* Steps */}
          <line x1="10" y1="166" x2="190" y2="166" className="bank-line" />
          <line x1="6" y1="172" x2="194" y2="172" className="bank-line" />
          {/* Vault opening — fills with stacked bills */}
          <rect x="62" y="78" width="76" height="60" className="bank-line" />
          {/* Bills stacking */}
          {[0, 1, 2, 3, 4].map(i => {
            const visible = i < Math.round(fillPct * 5);
            return visible && (
              <g key={i}>
                <rect x={66} y={132 - i * 11} width="68" height="8" className="bank-bill" rx="1" />
                <text x={100} y={138 - i * 11} fill="#34D399" fontSize="6" textAnchor="middle" fontFamily="monospace">$</text>
              </g>
            );
          })}
          {/* Gold bars */}
          <rect x={70} y={140} width="14" height="4" className="bank-fill" rx="0.5" />
          <rect x={88} y={140} width="14" height="4" className="bank-fill" rx="0.5" />
          <rect x={106} y={140} width="14" height="4" className="bank-fill" rx="0.5" />
          <rect x={124} y={140} width="10" height="4" className="bank-fill" rx="0.5" />
          {/* "$" sign on pediment */}
          <text x="100" y="48" fill="var(--text-dim)" fontSize="14" textAnchor="middle" fontFamily="serif" fontWeight="300">$</text>
          <line x1="92" y1="50" x2="108" y2="50" className="bank-line" />
        </svg>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>Saved by routing</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 8, fontVariantNumeric: 'tabular-nums', color: 'var(--green-2)' }}>${amount.toLocaleString()}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', fontWeight: 300, marginTop: 6, lineHeight: 1.5, maxWidth: 220 }}>
            Routing 1.13M requests to cheaper models with equivalent output quality.
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11.5, padding: '4px 9px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 6, color: 'var(--green-2)', fontWeight: 500 }}>
            ↓ vs always-default cost
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageRouter = PageRouter;
