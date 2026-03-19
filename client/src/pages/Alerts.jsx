import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch, useAsync } from '../hooks/useFetch';
import { alertAPI } from '../services/api';
import { Badge, Spinner, Toast } from '../components/UI';

const URGENCY_COLOR = { urgent: 'var(--ember)', review: 'var(--gold)', opportunity: 'var(--sage)', info: 'var(--ink-4)' };

export default function Alerts() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { data: alerts, loading, refetch } = useFetch(useCallback(() => alertAPI.list(), []));
  const { run: markRead } = useAsync(useCallback((id) => alertAPI.markRead(id), []));
  const { run: readAll }  = useAsync(useCallback(() => alertAPI.readAll(), []));

  const grouped = {
    urgent:      alerts?.filter(a => a.urgency === 'urgent')      || [],
    review:      alerts?.filter(a => a.urgency === 'review')      || [],
    opportunity: alerts?.filter(a => a.urgency === 'opportunity') || [],
    info:        alerts?.filter(a => a.urgency === 'info')        || [],
  };

  const handleMarkAll = async () => {
    await readAll();
    setToast({ msg: 'All alerts marked as read', type: 'success' });
    refetch();
  };

  const handleRead = async (id) => {
    await markRead(id);
    refetch();
  };

  if (loading) return <div className="loading"><Spinner /> Loading alerts…</div>;

  const SectionLabel = ({ label, count, color }) => count > 0 ? (
    <div className="sec-label" style={{ color: color || 'var(--ink-4)' }}>
      {label} <span style={{ fontWeight: 400, opacity: .7 }}>({count})</span>
    </div>
  ) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ink-6)',
      }}>
        <div>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink-1)' }}>Alerts</div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
            {alerts?.filter(a => !a.read).length || 0} unread · {alerts?.length || 0} total
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleMarkAll}>Mark all read</button>
      </div>

      {Object.entries(grouped).map(([urgency, items]) => {
        if (!items.length) return null;
        const color = URGENCY_COLOR[urgency];
        const labels = { urgent: 'Urgent action', review: 'Review', opportunity: 'Opportunities', info: 'Info' };
        return (
          <div key={urgency}>
            <SectionLabel label={labels[urgency]} count={items.length} color={color} />
            {items.map(alert => (
              <div
                key={alert._id}
                className="alert-item"
                style={{ opacity: alert.read ? 0.6 : 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-meta">
                      {alert.type?.replace('_', ' ')} ·{' '}
                      {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      {alert.affectedCount && ` · ${alert.affectedCount} customers`}
                      {alert.customer && (
                        <span
                          style={{ color: 'var(--gold)', cursor: 'pointer', marginLeft: 4 }}
                          onClick={() => navigate(`/customers/${alert.customer._id}`)}
                        >
                          → {alert.customer.name}
                        </span>
                      )}
                    </div>
                    {alert.detail && (
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>{alert.detail}</div>
                    )}
                    {alert.aiScript && (
                      <div className="alert-script">
                        <div className="alert-slbl" style={{ color }}>AI suggested response</div>
                        <div className="alert-stxt">{alert.aiScript}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginLeft: 14, flexShrink: 0 }}>
                    {!alert.read && (
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '5px 10px' }}
                        onClick={() => handleRead(alert._id)}
                      >
                        Mark read
                      </button>
                    )}
                    {urgency === 'urgent' && (
                      <button className="btn btn-dark" style={{ fontSize: 11, padding: '5px 12px' }}
                        onClick={() => navigate('/simulator')}>
                        Simulate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {(!alerts || alerts.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <div className="empty-text">No alerts today</div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
