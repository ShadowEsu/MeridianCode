// First-time setup wizard after sign up / first login
function SetupWizard({ user, onDone }) {
  const [step, setStep] = React.useState(0);
  const total = 3;

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else finish();
  };
  const back = () => step > 0 && setStep(step - 1);

  const finish = () => {
    try {
      localStorage.setItem('meridian_setup_v1_' + user.id, '1');
    } catch { /* ignore */ }
    onDone();
  };

  const steps = [
    {
      title: 'Welcome aboard',
      body: 'Meridian helps you see AI spend, route models, and watch agents — all in one place. Your account is ready; everything you see next is designed to get you productive quickly.',
      hint: 'You can reopen tips anytime from Settings (coming soon).',
    },
    {
      title: 'Sample dashboard',
      body: 'Charts, dollars, and call counts on Overview and other pages are placeholder examples so the UI feels real. They are not your live usage yet.',
      hint: 'When you connect billing or ingest logs, these panels will swap to real data.',
    },
    {
      title: 'Connect your APIs',
      body: 'Use Virtual Keys to allocate budgets per team and track usage. In this demo build, all figures are sample data and provider connections are not wired to a backend yet.',
      hint: 'Next: we’ll add real telemetry ingestion + key management back in behind auth.',
    },
  ];

  const s = steps[step];

  return (
    <div className="setup-overlay" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <div className="setup-modal">
        <div className="setup-progress">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={'setup-dot' + (i === step ? ' active' : '') + (i < step ? ' done' : '')} />
          ))}
        </div>
        <h2 id="setup-title" className="setup-title">{s.title}</h2>
        <p className="setup-body">{s.body}</p>
        <p className="setup-hint">{s.hint}</p>
        <div className="setup-actions">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={back}>Back</button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={finish}>Skip</button>
            <button type="button" className="btn btn-primary" onClick={next}>
              {step < total - 1 ? 'Next' : 'Open Meridian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SetupWizard = SetupWizard;
