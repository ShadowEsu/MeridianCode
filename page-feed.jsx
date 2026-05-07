function PageLiveFeed() {
  const M = window.MERIDIAN;
  const [paused, setPaused] = React.useState(false);
  const [feed, setFeed] = React.useState(() => generateInitialFeed());
  const [counters, setCounters] = React.useState({
    tps: 2340, rpm: 94, cpm: 0.42, savedHr: 43,
  });

  // Update counters every second
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCounters(c => ({
        tps: Math.max(1800, c.tps + Math.round((Math.random() - 0.5) * 120)),
        rpm: Math.max(60, c.rpm + Math.round((Math.random() - 0.5) * 8)),
        cpm: Math.max(0.2, +(c.cpm + (Math.random() - 0.5) * 0.05).toFixed(2)),
        savedHr: Math.max(20, c.savedHr + Math.round((Math.random() - 0.5) * 5)),
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  // Add new feed row every 1.5s
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setFeed(prev => [generateRow(), ...prev].slice(0, 60));
    }, 1500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="content" data-screen-label="Live Feed">
      <div className="grid-4" style={{ marginBottom: 18 }}>
        <CounterCard label="Tokens / sec" value={counters.tps.toLocaleString()} accent="#6366F1" />
        <CounterCard label="Requests / min" value={counters.rpm} accent="#10B981" />
        <CounterCard label="Cost / min" value={'$' + counters.cpm.toFixed(2)} accent="#F59E0B" />
        <CounterCard label="Saved / hour" value={'$' + counters.savedHr} accent="#34D399" emphasis />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="card-title">Live API Call Stream</div>
            <div className="card-sub">{paused ? 'Paused' : 'Live · streaming'} · last 60 calls</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setPaused(!paused)}>
              {paused ? Icon.play() : Icon.pause()}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-ghost">Filter</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px 70px 70px 70px 110px 70px 80px', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 10.5, color: 'var(--text-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Time</div><div>Model · Routing</div><div style={{textAlign:'right'}}>Cost</div><div style={{textAlign:'right'}}>In tok</div><div style={{textAlign:'right'}}>Out tok</div><div style={{textAlign:'right'}}>Latency</div><div>Team</div><div>Status</div><div></div>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
          {feed.map(row => <FeedRow key={row.id} row={row} />)}
        </div>
      </div>
    </div>
  );
}

function CounterCard({ label, value, accent, emphasis }) {
  return (
    <div className="card" style={{ padding: 20, borderColor: emphasis ? 'rgba(52,211,153,.25)' : undefined, background: emphasis ? 'radial-gradient(ellipse at top right, rgba(16,185,129,.05), transparent), var(--surface)' : undefined }}>
      <div className="kpi-label" style={{ color: emphasis ? 'var(--green-2)' : undefined }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 10, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: emphasis ? 'var(--green-2)' : 'var(--text)' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 11.5, color: 'var(--text-mute)', fontWeight: 300 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }}></span>
        Live · updating
      </div>
    </div>
  );
}

function FeedRow({ row }) {
  return (
    <div className={`feed-row ${row.routed ? 'routed' : ''} ${row.error ? 'error' : ''}`}>
      <div className="mono dim">{row.time}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {row.routedFrom && <span className="strikethrough">{row.routedFrom}</span>}
        {row.routedFrom && <span style={{ color: 'var(--green)', fontSize: 10 }}>→</span>}
        <span className={`model-badge model-${row.family}`}>{row.model}</span>
        {row.routed && <span className="tag tag-down" style={{ fontSize: 10 }}>Routed</span>}
      </div>
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${row.cost.toFixed(4)}</div>
      <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{row.inTok.toLocaleString()}</div>
      <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{row.outTok.toLocaleString()}</div>
      <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{row.latency}ms</div>
      <div style={{ color: 'var(--text-dim)' }}>{row.team}</div>
      <div>
        <span className={`dot-status status-${row.error ? 'red' : 'green'}`}></span>
        <span style={{ fontSize: 11 }}>{row.error ? 'Error' : 'OK'}</span>
      </div>
      <div className="mono dim" style={{ fontSize: 10 }}>{row.reqId}</div>
    </div>
  );
}

function generateRow() {
  const M = window.MERIDIAN;
  const teams = ['Engineering', 'Data Science', 'Marketing', 'Product', 'Sales', 'DevOps'];
  const idx = Math.floor(Math.random() * M.MODELS.length);
  const m = M.MODELS[idx];
  const routed = Math.random() > 0.55;
  let routedFrom = null;
  if (routed) {
    if (m.id === 'haiku') routedFrom = 'Claude Sonnet';
    else if (m.id === 'gpt4omini') routedFrom = 'GPT-4o';
    else if (m.id === 'geminiflash') routedFrom = 'Gemini Pro';
    else routedFrom = null;
  }
  const error = Math.random() > 0.96;
  const inTok = 200 + Math.floor(Math.random() * 4000);
  const outTok = 50 + Math.floor(Math.random() * 1500);
  const cost = ((inTok + outTok) / 1000) * m.costPer1K;
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2),
    time: now.toLocaleTimeString('en-US', { hour12: false }),
    model: m.short,
    family: m.family,
    routedFrom: routedFrom,
    routed: !!routedFrom,
    error,
    cost,
    inTok,
    outTok,
    latency: m.latency + Math.floor((Math.random() - 0.5) * 200),
    team: teams[Math.floor(Math.random() * teams.length)],
    reqId: 'req_' + Math.random().toString(36).slice(2, 8),
  };
}

function generateInitialFeed() {
  const arr = [];
  for (let i = 0; i < 22; i++) arr.push(generateRow());
  return arr;
}

window.PageLiveFeed = PageLiveFeed;
