export function Branch() {
  return (
    <div style={{ padding: 48 }}>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink-1)', marginBottom: 6 }}>Branch dashboard</div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 28 }}>Mumbai West · 24 RMs · Team AUM ₹4,240 Cr</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Team AUM', value: '₹4,240 Cr', delta: '↑ 14.2% YTD', color: 'var(--sage)' },
          { label: 'RMs on target', value: '18 / 24', delta: '75% team', color: 'var(--gold)' },
          { label: 'Churn risk', value: '14', delta: 'Across team', color: 'var(--rose)' },
          { label: 'KYC expiries', value: '3', delta: 'This month', color: 'var(--ember)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div className="serif" style={{ fontSize: 26, color: 'var(--ink-1)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: s.color, marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Full branch dashboard coming soon — showing team performance, RM rankings, compliance overview.</div>
    </div>
  );
}

export function Training() {
  const modules = [
    { icon: '🎭', title: 'Customer conversation roleplay', desc: 'AI plays the customer. Practice opening, objections, and close.', pct: 75, due: false },
    { icon: '🛡️', title: 'Objection handling simulator', desc: '18 scenarios. AI scores your responses in real time.', pct: 40, due: true },
    { icon: '📚', title: 'New fund briefing — Mar 2026', desc: '4 new funds added this month with AI talking points.', pct: 0, due: true },
    { icon: '📋', title: 'SEBI compliance refresher', desc: 'Annual compliance training. Mandatory by March 31.', pct: 100, due: false },
  ];

  return (
    <div style={{ padding: 48 }}>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink-1)', marginBottom: 6 }}>RM Training</div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 28 }}>AI roleplay · Objection handling · Product certifications</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {modules.map((m, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = ''}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>{m.title}</div>
                  {m.due && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 100, background: 'var(--ember-bg)', color: 'var(--ember)', fontWeight: 500 }}>Due</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>{m.desc}</div>
                <div style={{ height: 3, background: 'var(--p3)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{ height: '100%', background: m.pct === 100 ? 'var(--sage)' : 'var(--gold)', width: `${m.pct}%`, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                  {m.pct === 100 ? '✓ Completed' : m.pct === 0 ? 'Not started' : `${m.pct}% complete`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
