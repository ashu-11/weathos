// ── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  );
}

// ── Badge ────────────────────────────────────────────────
const statusMap = {
  active:     'badge-sage',
  at_risk:    'badge-rose',
  review:     'badge-gold',
  action_due: 'badge-gold',
  churned:    'badge-dim',
  urgent:     'badge-ember',
  opportunity:'badge-sage',
  info:       'badge-dim',
  verified:   'badge-sage',
  pending:    'badge-gold',
  expired:    'badge-rose',
  confirmed:  'badge-sage',
  processing: 'badge-gold',
  failed:     'badge-rose',
  on_track:   'badge-sage',
  off_track:  'badge-rose',
};

export function Badge({ label, status, className = '' }) {
  const cls = status ? (statusMap[status] || 'badge-dim') : '';
  return <span className={`badge ${cls} ${className}`}>{label || status?.replace('_', ' ')}</span>;
}

// ── Avatar ───────────────────────────────────────────────
const colors = [
  { bg: '#F5EDE8', fg: '#7A3E1E' },
  { bg: '#EBF5EE', fg: '#2E6E4A' },
  { bg: '#F5EBEC', fg: '#7A2E3C' },
  { bg: '#FBF5E8', fg: '#9A7A2E' },
  { bg: '#EBF2FA', fg: '#1A4A7A' },
];

export function Avatar({ name = '', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color.bg, color: color.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.33), fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── GoalBar ──────────────────────────────────────────────
const goalColors = { on_track: 'var(--sage)', at_risk: 'var(--gold)', off_track: 'var(--rose)' };

export function GoalBar({ goal }) {
  const color = goalColors[goal.status] || 'var(--sage)';
  return (
    <div className="goal-row">
      <div className="goal-top">
        <div>
          <div className="goal-name">{goal.name}</div>
          <div className="goal-tgt">Target ₹{(goal.targetAmount / 10000000).toFixed(1)} Cr · {goal.targetYear}</div>
        </div>
        <Badge status={goal.status} />
      </div>
      <div className="goal-track">
        <div className="goal-fill" style={{ width: `${goal.pctFunded}%`, background: color }} />
      </div>
      <div className="goal-foot">
        <span>₹{(goal.savedAmount / 100000).toFixed(0)} L saved</span>
        <span style={{ fontWeight: 500, color }}>{goal.pctFunded}%</span>
      </div>
    </div>
  );
}

// ── AllocRow ─────────────────────────────────────────────
export function AllocRow({ label, nowPct, afterPct, color }) {
  return (
    <div className="alloc-row">
      <span className="alloc-name" style={{ color }}>{label}</span>
      <div className="alloc-track" style={{ flex: 1 }}>
        <div className="alloc-before" style={{ width: `${nowPct}%` }} />
        <div className="alloc-after"  style={{ width: `${afterPct || nowPct}%`, background: color }} />
      </div>
      <span className="alloc-pct" style={{ color: afterPct ? color : 'var(--ink-5)' }}>
        {afterPct || nowPct}%
      </span>
    </div>
  );
}

// ── ConfirmToast ─────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const bg   = type === 'success' ? 'var(--sage-bg)'  : 'var(--rose-bg)';
  const fg   = type === 'success' ? 'var(--sage)'     : 'var(--rose)';
  const border = type === 'success' ? '1px solid var(--sage)' : '1px solid var(--rose)';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: fg, border, borderRadius: 10,
      padding: '12px 18px', fontSize: 13, maxWidth: 320,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,.1)',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: fg, fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────
export const Icon = {
  Today:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Customers: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Chat:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  AddUser:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  More:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  Bell:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Simulator: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Txn:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Shield:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Branch:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Training:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Arrow:     () => <span style={{ fontSize: 14, color: 'var(--ink-5)' }}>›</span>,
};
