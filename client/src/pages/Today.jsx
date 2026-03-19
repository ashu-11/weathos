import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { rmAPI } from '../services/api';
import { Avatar, Badge, Spinner } from '../components/UI';

const STATUS_COLOR = {
  at_risk:    'var(--rose)',
  review:     'var(--ember)',
  action_due: 'var(--gold)',
  active:     'var(--sage)',
};

const STATUS_LABEL = {
  at_risk:    'Churn risk',
  review:     'Review due',
  action_due: 'Action due',
  active:     'Active',
};

const WHY_MAP = {
  at_risk:    'Churn risk — high priority contact',
  review:     'Portfolio review overdue',
  action_due: 'Product action required',
  active:     'Proactive engagement opportunity',
};

export default function Today() {
  const navigate = useNavigate();
  const { data, loading } = useFetch(useCallback(() => rmAPI.dashboard(), []));
  const [expanded, setExpanded] = useState({});

  if (loading || !data) {
    return <div className="loading"><Spinner /> Loading today's work…</div>;
  }

  const { rm, stats, actionQueue } = data;

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Stat strip */}
      <div className="stat-strip">
        <div className="stat-cell">
          <div className="stat-label">Total AUM</div>
          <div className="stat-value serif">₹{stats.aum} Cr</div>
          <div className="stat-delta delta-pos">↑ YTD performance</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">To call today</div>
          <div className="stat-value serif" style={{ color: 'var(--ember)' }}>{actionQueue.length}</div>
          <div className="stat-delta delta-ember">AI briefs ready</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Target</div>
          <div className="stat-value serif">{stats.targetPct}%</div>
          <div className="stat-delta delta-warn">₹{stats.gapCr} Cr gap</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Churn risk</div>
          <div className="stat-value serif" style={{ color: 'var(--rose)' }}>{stats.churnRisk}</div>
          <div className="stat-delta delta-neg">Needs attention</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Customers</div>
          <div className="stat-value serif">{stats.totalCustomers}</div>
          <div className="stat-delta" style={{ color: 'var(--ink-4)' }}>Active accounts</div>
        </div>
      </div>

      {/* Two-col layout */}
      <div className="two-col" style={{ height: 'calc(100vh - 52px - 78px)' }}>
        {/* Left: action queue */}
        <div className="col">
          <div className="sec-label">Call today — ordered by impact</div>

          {actionQueue.map((c, idx) => {
            const pip = STATUS_COLOR[c.status] || 'var(--ink-4)';
            const isOpen = expanded[c._id];
            return (
              <div key={c._id} className="work-item">
                {/* Top row */}
                <div className="wi-top">
                  <Avatar name={c.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div className="wi-name">{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                      ₹{c.aum} Cr · {c.daysSinceContact} days no contact
                    </div>
                  </div>
                  <Badge status={c.status} label={STATUS_LABEL[c.status]} />
                </div>

                {/* Why */}
                <div className="wi-why">
                  <div className="wi-pip" style={{ background: pip }} />
                  <span style={{ color: pip, fontWeight: 500 }}>{STATUS_LABEL[c.status]}</span>
                  <span style={{ color: 'var(--ink-4)' }}> — {WHY_MAP[c.status]}</span>
                </div>

                {/* AI Script */}
                <div className="wi-script">
                  <div className="wi-script-lbl">Open with</div>
                  <div className="wi-script-txt">
                    {isOpen ? c.briefAI : (c.briefAI?.length > 120 ? c.briefAI.slice(0, 120) + '…' : c.briefAI)}
                  </div>
                  {c.briefAI?.length > 120 && (
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [c._id]: !p[c._id] }))}
                      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 11, cursor: 'pointer', marginTop: 4, padding: 0 }}
                    >
                      {isOpen ? 'Show less' : 'Read full brief →'}
                    </button>
                  )}
                </div>

                {/* Goals summary */}
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 10 }}>
                  Goals: {c.goalsOnTrack}/{c.totalGoals} on track · Drift: {c.drift}%
                </div>

                {/* Actions */}
                <div className="wi-actions">
                  <button
                    className="wi-btn wi-btn-primary"
                    onClick={() => navigate(`/customers/${c._id}`)}
                  >
                    Open brief
                  </button>
                  <button
                    className="wi-btn wi-btn-ghost"
                    onClick={() => navigate(`/simulator?customerId=${c._id}`)}
                  >
                    Simulate →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: signals + AUM breakdown */}
        <div className="col">
          <div className="sec-label">RM overview</div>
          <div style={{ padding: '0 24px 20px' }}>
            {/* Target progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Target achievement</span>
                <span style={{ fontWeight: 500 }}>{stats.targetPct}% of ₹{rm.target} Cr</span>
              </div>
              <div style={{ height: 4, background: 'var(--p3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: stats.targetPct >= 80 ? 'var(--sage)' : stats.targetPct >= 50 ? 'var(--gold)' : 'var(--rose)',
                  width: `${Math.min(stats.targetPct, 100)}%`, transition: 'width .6s ease'
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 5 }}>
                ₹{stats.gapCr} Cr more to hit target this month
              </div>
            </div>

            {/* Action queue preview */}
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Priority order
            </div>
            <div style={{ border: '1px solid var(--ink-6)', borderRadius: 10, overflow: 'hidden' }}>
              {actionQueue.slice(0, 5).map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/customers/${c._id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px',
                    borderBottom: i < Math.min(actionQueue.length, 5) - 1 ? '1px solid var(--p3)' : 'none',
                    cursor: 'pointer', transition: 'background .1s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--p2)'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink-5)', width: 16 }}>0{i+1}</span>
                  <Avatar name={c.name} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-1)' }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{STATUS_LABEL[c.status]}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--sage)' }}>₹{c.aum} Cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
