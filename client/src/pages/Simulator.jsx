import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFetch, useAsync } from '../hooks/useFetch';
import { customerAPI, simAPI } from '../services/api';
import { Avatar, Spinner, AllocRow } from '../components/UI';

const EVENTS = [
  { key: 'rate_cut',           label: 'Rate cut −25bps' },
  { key: 'market_correction',  label: 'Market −8%' },
  { key: 'sip_increase',       label: 'SIP +₹8k/mo' },
  { key: 'rebalance',          label: 'Rebalance to model' },
  { key: 'fund_manager_change',label: 'Fund mgr change' },
];

export default function Simulator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initCustomerId = searchParams.get('customerId');

  const [selectedCustomer, setSelectedCustomer] = useState(initCustomerId || '');
  const [selectedEvent,    setSelectedEvent]    = useState('rate_cut');
  const [result,           setResult]           = useState(null);

  const { data: customers, loading: custsLoading } = useFetch(
    useCallback(() => customerAPI.list(), [])
  );
  const { run: runSim, loading: simRunning } = useAsync(
    useCallback((cId, ev) => simAPI.run(cId, ev), [])
  );

  // Auto-run when customer or event changes
  useEffect(() => {
    if (!selectedCustomer) return;
    runSim(selectedCustomer, selectedEvent)
      .then(data => setResult(data))
      .catch(() => {});
  }, [selectedCustomer, selectedEvent, runSim]);

  // Auto-select first customer
  useEffect(() => {
    if (!selectedCustomer && customers?.length) {
      setSelectedCustomer(customers[0]._id);
    }
  }, [customers, selectedCustomer]);

  const customer = customers?.find(c => c._id === selectedCustomer);

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Customer + event selectors */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid var(--ink-6)', flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Customer
        </div>
        <select
          style={{
            background: 'var(--p2)', border: '1px solid var(--ink-6)', borderRadius: 100,
            padding: '7px 14px', fontSize: 12, color: 'var(--ink-1)', outline: 'none',
          }}
          value={selectedCustomer}
          onChange={e => setSelectedCustomer(e.target.value)}
        >
          {customers?.map(c => (
            <option key={c._id} value={c._id}>{c.name} — ₹{c.aum} Cr</option>
          ))}
        </select>

        <div style={{ width: 1, height: 20, background: 'var(--ink-6)', margin: '0 4px' }} />

        {/* Event chips */}
        <div className="chip-row" style={{ padding: 0, border: 'none', gap: 8 }}>
          {EVENTS.map(ev => (
            <button
              key={ev.key}
              className={`chip${selectedEvent === ev.key ? ' active' : ''}`}
              onClick={() => setSelectedEvent(ev.key)}
            >
              {ev.label}
            </button>
          ))}
        </div>
      </div>

      {custsLoading ? (
        <div className="loading"><Spinner /> Loading…</div>
      ) : (
        <div className="two-col" style={{ height: 'calc(100vh - 52px - 58px)' }}>
          {/* Left: impact */}
          <div className="col">
            {customer && (
              <div style={{ padding: '4px 24px 0', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--p3)', paddingBottom: 12, paddingTop: 14 }}>
                <Avatar name={customer.name} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>₹{customer.aum} Cr · {customer.riskProfile}</div>
                </div>
                <button
                  onClick={() => navigate(`/customers/${customer._id}`)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer' }}
                >
                  Open profile →
                </button>
              </div>
            )}

            {simRunning ? (
              <div className="loading"><Spinner /> Running simulation…</div>
            ) : result ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '16px 24px 4px' }}>
                  Portfolio impact
                </div>
                <div className="sim-num" style={{ color: result.impactSign === 'positive' ? 'var(--sage)' : result.impactSign === 'negative' ? 'var(--rose)' : 'var(--ink-1)' }}>
                  {result.impactDisplay}
                </div>
                <div className="sim-sub">{result.sub}</div>

                <div className="sim-metrics">
                  <div className="sim-m"><div className="sim-m-v">{result.metrics?.goalTimeline}</div><div className="sim-m-l">Goal timeline</div></div>
                  <div className="sim-m"><div className="sim-m-v">{result.metrics?.window}</div><div className="sim-m-l">Action window</div></div>
                  <div className="sim-m"><div className="sim-m-v" style={{ fontSize: 13 }}>{result.metrics?.action}</div><div className="sim-m-l">Recommended</div></div>
                </div>

                {/* Allocation before/after */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--p3)' }}>
                  <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Before → After allocation
                  </div>
                  {customer && [
                    { label: 'Equity', now: customer.currentAllocation.largeCap + customer.currentAllocation.midSmall, after: result.allocation?.equity, color: 'var(--sage)' },
                    { label: 'Debt',   now: customer.currentAllocation.debt,   after: result.allocation?.debt,   color: 'var(--gold)' },
                    { label: 'Gold',   now: customer.currentAllocation.gold,   after: result.allocation?.gold,   color: 'var(--ink-4)' },
                  ].map(row => (
                    <AllocRow key={row.label} {...row} />
                  ))}
                </div>

                <div style={{ padding: '0 24px 16px', display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-dark" style={{ flex: 2 }}>Generate proposal</button>
                  <button className="btn btn-ghost" onClick={() => navigate(`/transactions?customerId=${selectedCustomer}`)}>Place order</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">◈</div>
                <div className="empty-text">Select a customer and event to run a simulation</div>
              </div>
            )}
          </div>

          {/* Right: call script + customer selector */}
          <div className="col">
            {result && (
              <div className="script-wrap" style={{ paddingTop: 20 }}>
                <div className="script-lbl">What to say on the call</div>
                <div className="script-opener">{result.opener}</div>
                {result.steps?.map((step, i) => (
                  <div key={i} className="script-step">
                    <span className="ss-n">{i + 1}.</span>
                    <span className="ss-t" dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '14px 24px 0', borderTop: result ? '1px solid var(--ink-6)' : 'none', marginTop: result ? 8 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Simulate for
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--ink-6)', borderRadius: 10, overflow: 'hidden' }}>
                {customers?.map((c, i) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedCustomer(c._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                      background: selectedCustomer === c._id ? 'var(--gold-bg)' : 'var(--paper)',
                      borderBottom: i < customers.length - 1 ? '1px solid var(--p3)' : 'none',
                      cursor: 'pointer', transition: 'background .1s',
                    }}
                    onMouseOver={e => { if (selectedCustomer !== c._id) e.currentTarget.style.background = 'var(--p2)'; }}
                    onMouseOut={e => { if (selectedCustomer !== c._id) e.currentTarget.style.background = 'var(--paper)'; }}
                  >
                    <Avatar name={c.name} size={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-1)' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>₹{c.aum} Cr · {c.riskProfile}</div>
                    </div>
                    {selectedCustomer === c._id && (
                      <span style={{ fontSize: 10, color: 'var(--gold)' }}>Selected</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
