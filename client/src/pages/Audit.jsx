import { useState, useCallback } from 'react';
import { useFetch } from '../hooks/useFetch';
import { auditAPI } from '../services/api';
import { Badge, Spinner } from '../components/UI';

const EVENT_TYPES = [
  { value: '',     label: 'All events' },
  { value: 'auth', label: 'Auth' },
  { value: 'view', label: 'Data views' },
  { value: 'data', label: 'Data changes' },
  { value: 'txn',  label: 'Transactions' },
  { value: 'ai',   label: 'AI' },
];

const EVENT_BADGE = {
  auth: 'badge-sage',
  view: 'badge-dim',
  data: 'badge-gold',
  txn:  'badge-ember',
  ai:   'badge-dim',
  report: 'badge-dim',
};

export default function Audit() {
  const [event, setEvent] = useState('');
  const { data, loading } = useFetch(
    useCallback(() => auditAPI.list({ event, limit: 100 }), [event])
  );

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--ink-6)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink-1)' }}>Compliance & Audit Trail</div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
            {data?.total || 0} events · SHA-256 chained · 7yr SEBI retention
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(t => (
            <button
              key={t.value}
              className={`chip${event === t.value ? ' active' : ''}`}
              onClick={() => setEvent(t.value)}
              style={{ fontSize: 11 }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 11 }}>Export CSV</button>
      </div>

      {loading ? (
        <div className="loading"><Spinner /> Loading audit log…</div>
      ) : (
        data?.logs?.map((log, i) => (
          <div key={log._id || i} className="log-item">
            <div className="log-r1">
              <span className="log-time">
                {new Date(log.createdAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </span>
              <span className={`badge ${EVENT_BADGE[log.event] || 'badge-dim'}`} style={{ fontSize: 9 }}>
                {log.event?.toUpperCase()}
              </span>
              {log.customer && (
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>— {log.customer.name}</span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--ink-5)' }}>
                {log.ip} · {log.device?.substring(0, 20)}
              </span>
            </div>
            <div className="log-event">{log.action}</div>
            {(log.before || log.after) && (
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>
                {log.before && <span style={{ color: 'var(--rose)' }}>− {JSON.stringify(log.before)}</span>}
                {log.before && log.after && ' → '}
                {log.after && <span style={{ color: 'var(--sage)' }}>+ {JSON.stringify(log.after)}</span>}
              </div>
            )}
          </div>
        ))
      )}

      {data?.logs?.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◬</div>
          <div className="empty-text">No audit events for this filter</div>
        </div>
      )}
    </div>
  );
}
