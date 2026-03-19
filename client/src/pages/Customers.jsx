import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { customerAPI } from '../services/api';
import { Avatar, Badge, Spinner, Icon } from '../components/UI';

const STATUS_OPTS = [
  { value: '', label: 'All customers' },
  { value: 'at_risk',    label: 'At risk' },
  { value: 'review',     label: 'Review due' },
  { value: 'action_due', label: 'Action due' },
  { value: 'active',     label: 'Active' },
];

const SORT_OPTS = [
  { value: '-aum',             label: 'AUM ↓' },
  { value: 'aum',              label: 'AUM ↑' },
  { value: '-churnScore',      label: 'Churn risk ↓' },
  { value: '-daysSinceContact',label: 'Days silent ↓' },
  { value: 'name',             label: 'Name A–Z' },
];

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('');
  const [sort,   setSort]   = useState('-aum');

  const { data: customers, loading } = useFetch(
    useCallback(() => customerAPI.list({ search, status, sort }), [search, status, sort])
  );

  const riskColor = (score) =>
    score >= 70 ? 'var(--rose)' : score >= 40 ? 'var(--gold)' : 'var(--sage)';

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid var(--ink-6)',
      }}>
        <div className="search-box" style={{ width: 280 }}>
          <Icon.Search />
          <input
            placeholder="Search by name, PAN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="btn btn-ghost"
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ borderRadius: 100, padding: '7px 14px', fontSize: 12 }}
        >
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          className="btn btn-ghost"
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ borderRadius: 100, padding: '7px 14px', fontSize: 12 }}
        >
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-4)' }}>
          {customers?.length || 0} accounts
        </span>
      </div>

      {loading ? (
        <div className="loading"><Spinner /> Loading customers…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>AUM</th>
              <th>XIRR</th>
              <th>Drift</th>
              <th>Goals</th>
              <th>Churn risk</th>
              <th>Days silent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map(c => (
              <tr key={c._id} onClick={() => navigate(`/customers/${c._id}`)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.name} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{c.riskProfile}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="serif" style={{ fontSize: 15, color: 'var(--ink-1)' }}>₹{c.aum} Cr</span>
                </td>
                <td>
                  <span style={{ color: c.xirr >= 12 ? 'var(--sage)' : 'var(--gold)', fontWeight: 500 }}>
                    {c.xirr}%
                  </span>
                </td>
                <td>
                  <span style={{ color: c.drift > 8 ? 'var(--rose)' : c.drift > 4 ? 'var(--gold)' : 'var(--sage)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    {c.drift}%
                  </span>
                </td>
                <td>
                  <Badge
                    label={`${c.goals?.filter(g => g.status === 'on_track').length || 0}/${c.goals?.length || 0}`}
                    status={c.goals?.every(g => g.status === 'on_track') ? 'active' : 'review'}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 4, background: 'var(--p3)', borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${c.churnScore}%`,
                        background: riskColor(c.churnScore), borderRadius: 2,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: riskColor(c.churnScore), fontFamily: 'DM Mono, monospace' }}>
                      {c.churnScore}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 12,
                    color: c.daysSinceContact > 30 ? 'var(--rose)' : c.daysSinceContact > 14 ? 'var(--gold)' : 'var(--ink-4)',
                  }}>
                    {c.daysSinceContact}d
                  </span>
                </td>
                <td><Badge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
