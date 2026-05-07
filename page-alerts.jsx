function PageAlerts() {
  const M = window.MERIDIAN;
  const [show, setShow] = React.useState(false);
  const [alerts] = React.useState(M.ALERTS);

  const stateConfig = {
    triggered: { color: '#EF4444', label: 'Triggered', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.3)' },
    active: { color: '#10B981', label: 'Active', bg: 'rgba(16,185,129,.06)', border: 'rgba(16,185,129,.25)' },
    warning: { color: '#F59E0B', label: 'Triggered ×2', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.3)' },
    paused: { color: '#5A616E', label: 'Paused', bg: 'rgba(255,255,255,.02)', border: 'var(--border)' },
  };

  return (
    <div className="content" data-screen-label="Alerts">
      <div className="between" style={{ marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13.5, color: 'var(--text-dim)', fontWeight: 300 }}>4 alerts configured · 2 currently triggered</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>{Icon.plus()} Create Alert</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map(a => {
          const s = stateConfig[a.state];
          return (
            <div key={a.id} className="card" style={{ padding: 18, borderColor: s.border, background: `linear-gradient(90deg, ${s.bg} 0%, transparent 60%), var(--surface)` }}>
              <div className="between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, display: 'grid', placeItems: 'center', color: s.color }}>
                    {Icon.bell({ width: 16, height: 16 })}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 300, marginTop: 3 }}>
                      {a.triggered} · Notify: {a.channel}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 500, padding: '4px 10px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 5, color: s.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 5px ${s.color}` }}></span>
                    {s.label}
                  </span>
                  <button className="btn btn-ghost">Edit</button>
                  <div className={`toggle ${a.state !== 'paused' ? 'on' : ''}`}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {show && (
        <div className="modal-backdrop" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create alert</h3>
            <p className="sub">Notify your team when thresholds are crossed.</p>
            <div className="field"><label>Metric</label><select className="select"><option>Daily spend</option><option>Team budget</option><option>Agent session cost</option><option>API error rate</option><option>Loop risk</option></select></div>
            <div className="field"><label>Condition</label><select className="select"><option>Exceeds</option><option>Drops below</option><option>Equals</option></select></div>
            <div className="field"><label>Threshold</label><input className="input" placeholder="$3,000" /></div>
            <div className="field"><label>Notification channel</label><select className="select"><option>Slack</option><option>Email</option><option>PagerDuty</option><option>Slack + PagerDuty</option></select></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShow(false)}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageAlerts = PageAlerts;
