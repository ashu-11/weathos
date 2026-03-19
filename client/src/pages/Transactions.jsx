import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch, useAsync } from '../hooks/useFetch';
import { txnAPI, customerAPI } from '../services/api';
import { Badge, Spinner, Toast } from '../components/UI';

const TXN_TYPES = [
  { value: 'sip_new',     label: 'SIP — New' },
  { value: 'sip_modify',  label: 'SIP — Modify' },
  { value: 'sip_cancel',  label: 'SIP — Cancel' },
  { value: 'lumpsum',     label: 'Lump sum buy' },
  { value: 'switch',      label: 'Switch' },
  { value: 'stp',         label: 'STP' },
  { value: 'swp',         label: 'SWP' },
];

const FUNDS = [
  'Parag Parikh Flexi Cap', 'HDFC Mid Cap Opportunities', 'SBI Gilt Fund',
  'HDFC Short Duration Fund', 'Mirae Asset Large Cap', 'Axis Bluechip Fund',
  'ICICI Prudential BAF', 'Axis Long Term Equity (ELSS)', 'HDFC Corporate Bond',
  'SBI Short Duration Fund',
];

export default function Transactions() {
  const [searchParams] = useSearchParams();
  const initCustomer = searchParams.get('customerId') || '';

  const [form, setForm] = useState({
    customerId: initCustomer, type: 'sip_new', fund: '', amount: '', sipDate: '1', mandate: '',
  });
  const [toast, setToast] = useState(null);

  const { data: customers } = useFetch(useCallback(() => customerAPI.list(), []));
  const { data: txns, loading, refetch } = useFetch(useCallback(() => txnAPI.list(), []));
  const { run: place, loading: placing } = useAsync(useCallback((d) => txnAPI.create(d), []));

  const customer = customers?.find(c => c._id === form.customerId);
  const highRisk = ['Axis Small Cap', 'Nippon Small Cap'].some(f => form.fund?.includes(f));
  const suitability = !highRisk || customer?.riskProfile !== 'conservative';

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePlace = async () => {
    if (!form.customerId || !form.fund || !form.amount) {
      setToast({ msg: 'Please fill all required fields', type: 'error' });
      return;
    }
    try {
      await place(form);
      setToast({ msg: 'Order placed successfully', type: 'success' });
      refetch();
    } catch (e) {
      setToast({ msg: e || 'Failed to place order', type: 'error' });
    }
  };

  const statusColor = { confirmed: 'var(--sage)', processing: 'var(--gold)', pending: 'var(--ink-4)', failed: 'var(--rose)' };

  return (
    <div style={{ maxWidth: 1400 }}>
      <div className="two-col" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Left: new transaction form */}
        <div className="col">
          <div style={{ padding: '18px 24px 10px', borderBottom: '1px solid var(--p3)' }}>
            <div className="serif" style={{ fontSize: 18, color: 'var(--ink-1)' }}>New transaction</div>
          </div>

          <div style={{ padding: '18px 24px 0' }}>
            {/* Customer */}
            <div className="field">
              <label>Customer *</label>
              <select value={form.customerId} onChange={e => setF('customerId', e.target.value)}>
                <option value="">Select customer…</option>
                {customers?.map(c => (
                  <option key={c._id} value={c._id}>{c.name} — ₹{c.aum} Cr</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="field">
              <label>Transaction type *</label>
              <select value={form.type} onChange={e => setF('type', e.target.value)}>
                {TXN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Fund */}
            <div className="field">
              <label>Fund *</label>
              <select value={form.fund} onChange={e => setF('fund', e.target.value)}>
                <option value="">Select fund…</option>
                {FUNDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div className="field">
                <label>Amount (₹) *</label>
                <input
                  type="text"
                  placeholder="e.g. 42000"
                  value={form.amount}
                  onChange={e => setF('amount', e.target.value)}
                />
              </div>
              {form.type.startsWith('sip') && (
                <div className="field">
                  <label>SIP date</label>
                  <select value={form.sipDate} onChange={e => setF('sipDate', e.target.value)}>
                    {[1, 5, 10, 15, 20, 25].map(d => (
                      <option key={d} value={d}>{d}th of month</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="field">
              <label>Mandate</label>
              <select value={form.mandate} onChange={e => setF('mandate', e.target.value)}>
                <option value="">Select mandate…</option>
                {customer?.sips?.map((s, i) => (
                  <option key={i} value={s.mandate}>{s.mandate}</option>
                ))}
                <option value="NACH-NEW">Register new NACH mandate</option>
              </select>
            </div>

            {/* Suitability */}
            {form.fund && form.customerId && (
              <div className={suitability ? 'suitability-ok' : 'suitability-warn'}>
                {suitability
                  ? `✓ Suitability check passed — ${form.fund} is suitable for ${customer?.riskProfile} profile`
                  : `⚠ Suitability concern — ${form.fund} may not be suitable for conservative profile`
                }
              </div>
            )}

            <button
              className="btn-full"
              style={{ marginBottom: 16, borderRadius: 100 }}
              onClick={handlePlace}
              disabled={placing}
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>

        {/* Right: pending / recent orders */}
        <div className="col">
          <div style={{ padding: '18px 24px 10px', borderBottom: '1px solid var(--p3)' }}>
            <div className="serif" style={{ fontSize: 18, color: 'var(--ink-1)' }}>Recent orders</div>
          </div>

          {loading ? (
            <div className="loading"><Spinner /></div>
          ) : (
            txns?.map(t => (
              <div key={t._id} className="row-item" style={{ cursor: 'default' }}>
                <div style={{ flex: 1 }}>
                  <div className="row-title">{t.fund || '—'}</div>
                  <div className="row-sub">
                    {t.customer?.name} · {t.type?.replace('_', ' ')} ·{' '}
                    {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="serif" style={{ fontSize: 14 }}>
                    ₹{parseInt(t.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <Badge status={t.status} />
                </div>
              </div>
            ))
          )}

          {txns?.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⇄</div>
              <div className="empty-text">No recent transactions</div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
