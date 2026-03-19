import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch, useAsync } from '../hooks/useFetch';
import { customerAPI } from '../services/api';
import { Avatar, Badge, GoalBar, Toast, Spinner } from '../components/UI';
import AskBox from '../components/AskBox';

const CHIPS_BY_RISK = {
  aggressive: [
    { label: 'Fund XIRR',       q: 'What is the current XIRR on each fund?' },
    { label: 'Goal timeline',   q: 'When does this customer hit their retirement goal at current SIP?' },
    { label: 'SIP needed',      q: 'How much SIP is needed to hit the retirement goal 2 years early?' },
    { label: 'Drift details',   q: 'What is the portfolio drift vs target allocation?' },
    { label: 'Underperformers', q: 'Which funds are underperforming their benchmark?' },
    { label: 'Tax savings',     q: 'What tax savings can still be made this year?' },
    { label: 'Stress test',     q: 'If Nifty drops 10%, what happens to the retirement timeline?' },
    { label: 'Mandate',         q: 'What is the SIP mandate renewal date?' },
  ],
  moderate: [
    { label: 'Portfolio drift',  q: 'What is the portfolio drift vs target allocation?' },
    { label: 'Why off track',    q: 'Why is the retirement goal off track?' },
    { label: 'Last investment',  q: 'When did this customer last invest?' },
    { label: 'KYC status',       q: 'What is the KYC and compliance status?' },
    { label: 'SIP capacity',     q: 'What is the current SIP capacity vs income?' },
    { label: 'Active mandates',  q: 'What are the active NACH mandates?' },
    { label: 'Stress test',      q: 'If Nifty drops 10%, what happens to the retirement timeline?' },
    { label: 'Tax savings',      q: 'What tax savings can still be made this year?' },
  ],
  conservative: [
    { label: 'Fund XIRR',       q: 'What is the current XIRR on each fund?' },
    { label: 'Goal timeline',   q: 'When does this customer hit their retirement goal at current SIP?' },
    { label: 'ELSS expiry',     q: 'When does the ELSS lock-in end?' },
    { label: 'KYC status',      q: 'What is the KYC and compliance status?' },
    { label: 'Drift details',   q: 'What is the portfolio drift vs target allocation?' },
    { label: 'Tax savings',     q: 'What tax savings can still be made this year?' },
    { label: 'Mandate',         q: 'What is the SIP mandate renewal date?' },
    { label: 'Risk profile',    q: 'Is the current portfolio aligned with the stated risk profile?' },
  ],
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('call');

  const { data: customer, loading, refetch } = useFetch(
    useCallback(() => customerAPI.get(id), [id])
  );
  const { run: addLog, loading: logSaving } = useAsync(
    useCallback((d) => customerAPI.addCommLog(id, d), [id])
  );

  if (loading || !customer) return <div className="loading"><Spinner /> Loading customer…</div>;

  const c = customer;
  const chips = CHIPS_BY_RISK[c.riskProfile] || CHIPS_BY_RISK.moderate;

  const kycDaysLeft = c.kyc?.expiry
    ? Math.round((new Date(c.kyc.expiry) - Date.now()) / 86400000)
    : null;

  const saveNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addLog({ type: noteType, note: noteText });
      setNoteText('');
      setToast({ msg: 'Note logged successfully', type: 'success' });
      refetch();
    } catch {
      setToast({ msg: 'Failed to save note', type: 'error' });
    }
  };

  const allocColor = { largeCap: 'var(--sage)', midSmall: 'var(--gold)', debt: 'var(--ink-3)', gold: 'var(--ink-4)', cash: 'var(--ink-5)' };

  return (
    <div className="two-col" style={{ height: 'calc(100vh - 52px)' }}>
      {/* ── LEFT COL: customer data ── */}
      <div className="col">
        {/* Header */}
        <div className="cust-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', color: 'var(--ink-4)', fontSize: 12, cursor: 'pointer' }}
            >
              ‹ Back
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={c.name} size={44} />
              <div>
                <div className="cust-name">{c.name}</div>
                <div className="cust-meta">{c.pan} · {c.riskProfile} · {c.city}</div>
              </div>
            </div>
            <Badge status={c.status} />
          </div>
          <div className="cust-kpis">
            <div className="ck"><div className="ck-val serif">₹{c.aum} Cr</div><div className="ck-lbl">AUM</div></div>
            <div className="ck"><div className="ck-val serif" style={{ color: c.xirr >= 12 ? 'var(--sage)' : 'var(--gold)' }}>{c.xirr}%</div><div className="ck-lbl">XIRR</div></div>
            <div className="ck"><div className="ck-val serif">{c.goals?.filter(g => g.status === 'on_track').length}/{c.goals?.length}</div><div className="ck-lbl">Goals</div></div>
            <div className="ck"><div className="ck-val serif" style={{ color: c.drift > 5 ? 'var(--rose)' : 'var(--ink-1)' }}>{c.drift}%</div><div className="ck-lbl">Drift</div></div>
          </div>
          <div className="cust-actions">
            <button className="ca-btn btn-dark" style={{ flex: 2 }}>📞 Call {c.name.split(' ')[0]}</button>
            <button className="ca-btn btn-ghost" onClick={() => navigate(`/simulator?customerId=${id}`)}>Simulate</button>
            <button className="ca-btn btn-ghost" onClick={() => navigate(`/transactions?customerId=${id}`)}>Transact</button>
          </div>
        </div>

        {/* Goals */}
        <div className="sec-label">Life goals</div>
        {c.goals?.map((g, i) => <GoalBar key={i} goal={g} />)}

        {/* Allocation */}
        <div className="sec-label">Portfolio allocation</div>
        <div style={{ padding: '12px 24px 16px' }}>
          {Object.entries({
            'Large cap':  [c.currentAllocation.largeCap, allocColor.largeCap],
            'Mid/small':  [c.currentAllocation.midSmall, allocColor.midSmall],
            'Debt':       [c.currentAllocation.debt,     allocColor.debt],
            'Gold':       [c.currentAllocation.gold,     allocColor.gold],
            'Cash':       [c.currentAllocation.cash,     allocColor.cash],
          }).map(([label, [pct, color]]) => (
            <div key={label} className="alloc-row">
              <span className="alloc-name" style={{ color }}>{label}</span>
              <div className="alloc-track" style={{ flex: 1 }}>
                <div className="alloc-after" style={{ width: `${pct * 2}%`, background: color }} />
              </div>
              <span className="alloc-pct" style={{ color }}>{pct}%</span>
            </div>
          ))}
        </div>

        {/* Holdings */}
        <div className="sec-label">Holdings</div>
        {c.holdings?.map((h, i) => (
          <div key={i} className="row-item" style={{ cursor: 'default' }}>
            <div style={{ flex: 1 }}>
              <div className="row-title">{h.fund}</div>
              <div className="row-sub">₹{h.amountLakh} L · {h.portfolioPct}% of portfolio</div>
            </div>
            <div className="row-right">
              <div className="serif" style={{ fontSize: 15, color: h.xirr3Y >= h.benchmark3Y ? 'var(--sage)' : 'var(--gold)' }}>
                +{h.xirr3Y}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>3Y CAGR</div>
            </div>
          </div>
        ))}

        {/* Active SIPs */}
        <div className="sec-label">Active SIPs</div>
        {c.sips?.filter(s => s.active).map((s, i) => (
          <div key={i} className="row-item" style={{ cursor: 'default' }}>
            <div style={{ flex: 1 }}>
              <div className="row-title">{s.fund}</div>
              <div className="row-sub">₹{(s.amount / 1000).toFixed(0)}k/mo · {s.date}th · {s.mandate}</div>
            </div>
            <Badge status="active" />
          </div>
        ))}

        {/* Comm log */}
        <div className="sec-label">Communication history</div>
        {c.commLog?.slice(0, 5).map((l, i) => (
          <div key={i} className="log-item">
            <div className="log-r1">
              <span className="log-time">{new Date(l.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <Badge status="info" label={l.type} />
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-2)', marginLeft: 4 }}>{l.rmName}</span>
            </div>
            <div className="log-event">{l.note}</div>
          </div>
        ))}

        {/* Compliance */}
        <div className="sec-label">Compliance</div>
        <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['KYC status', c.kyc?.status, kycDaysLeft != null ? `${kycDaysLeft} days left` : ''],
            ['FATCA', c.kyc?.fatca ? 'Compliant' : 'Pending', ''],
            ['NACH mandate', c.kyc?.mandate, ''],
            ['Suitability', c.kyc?.suitabilityDate ? new Date(c.kyc.suitabilityDate).toLocaleDateString('en-IN') : 'N/A', ''],
            ['Risk profile', c.riskProfile, ''],
          ].map(([label, val, sub]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
              <div style={{ textAlign: 'right' }}>
                <Badge
                  status={val === 'verified' || val === 'Compliant' || val === 'active' ? 'active' : val === 'expired' ? 'at_risk' : 'review'}
                  label={val}
                />
                {sub && <div style={{ fontSize: 10, color: kycDaysLeft < 30 ? 'var(--ember)' : 'var(--ink-4)', marginTop: 2 }}>{sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT COL: AI brief + ask + log note ── */}
      <div className="col">
        {/* AI pre-call brief */}
        <div className="sec-label" style={{ paddingTop: 20 }}>AI pre-call brief</div>
        <div style={{ padding: '0 24px 14px' }}>
          <div className="wi-script">
            <div className="wi-script-lbl">Before you call</div>
            <div className="wi-script-txt">{c.briefAI}</div>
          </div>
          <div className="wi-actions" style={{ marginTop: 10 }}>
            <button className="wi-btn wi-btn-primary">📞 Call {c.name.split(' ')[0]}</button>
            <button className="wi-btn wi-btn-ghost" onClick={() => navigate(`/simulator?customerId=${id}`)}>
              Simulate portfolio
            </button>
          </div>
        </div>

        {/* Ask anything — compact */}
        <div style={{ padding: '0 24px 16px' }}>
          <AskBox customerId={id} chips={chips} />
        </div>

        {/* Log a note */}
        <div className="sec-label">Log conversation note</div>
        <div className="note-box">
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {['call', 'meeting', 'email', 'whatsapp'].map(t => (
              <button
                key={t}
                onClick={() => setNoteType(t)}
                style={{
                  padding: '3px 10px', borderRadius: 100, border: 'none', fontSize: 10,
                  background: noteType === t ? 'var(--ink-1)' : 'var(--p3)',
                  color: noteType === t ? 'var(--paper)' : 'var(--ink-3)',
                  cursor: 'pointer', fontWeight: noteType === t ? 500 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            placeholder="What did you discuss? Key decisions, customer mood, follow-up actions…"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
          <div className="note-foot">
            <button
              className="wi-btn wi-btn-primary"
              style={{ width: 'auto', padding: '7px 18px' }}
              onClick={saveNote}
              disabled={logSaving || !noteText.trim()}
            >
              {logSaving ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
