import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useFetch';
import { customerAPI } from '../services/api';
import { Toast } from '../components/UI';

const STEPS = ['KYC', 'Goals', 'Risk profile', 'Investments', 'Review'];

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', desc: 'Capital preservation, low volatility, FDs and debt funds' },
  { value: 'moderate',     label: 'Moderate',     desc: 'Balanced growth, moderate risk, hybrid and large cap' },
  { value: 'aggressive',   label: 'Aggressive',   desc: 'Maximum growth, high risk, mid/small cap and international' },
];

export default function AddCustomer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState(null);

  const [kyc, setKyc] = useState({ name: '', pan: '', mobile: '', email: '', dob: '', city: 'Mumbai' });
  const [goals, setGoals] = useState([
    { type: 'retirement', name: 'Retirement corpus', targetAmount: '', targetYear: 2041, monthlySIP: '', inflation: 6.5 },
  ]);
  const [risk, setRisk] = useState('moderate');
  const [alloc, setAlloc] = useState({ largeCap: 30, midSmall: 20, debt: 30, gold: 10, cash: 10 });

  const { run: create, loading } = useAsync((data) => customerAPI.create(data));

  const setK = (k, v) => setKyc(p => ({ ...p, [k]: v }));
  const setGoal = (i, k, v) => setGoals(gs => gs.map((g, j) => j === i ? { ...g, [k]: v } : g));
  const addGoal = () => setGoals(gs => [...gs, { type: 'home', name: 'Home purchase', targetAmount: '', targetYear: 2030, monthlySIP: '', inflation: 6 }]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...kyc,
        riskProfile: risk,
        targetAllocation: alloc,
        currentAllocation: alloc,
        goals: goals.map(g => ({
          ...g,
          savedAmount: 0,
          pctFunded: 0,
          status: 'on_track',
          targetAmount: parseInt(g.targetAmount) || 0,
          monthlySIP: parseInt(g.monthlySIP) || 0,
        })),
        aum: 0, xirr: 0, drift: 0,
        status: 'active', churnScore: 0, daysSinceContact: 0,
      };
      await create(payload);
      setToast({ msg: 'Customer onboarded successfully', type: 'success' });
      setTimeout(() => navigate('/customers'), 1200);
    } catch (e) {
      setToast({ msg: e || 'Failed to create customer', type: 'error' });
    }
  };

  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 24px', borderBottom: '1px solid var(--ink-6)', flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500,
            background: i < step ? 'var(--sage)' : i === step ? 'var(--ink-1)' : 'transparent',
            color: i <= step ? '#fff' : 'var(--ink-5)',
            border: i > step ? '1.5px solid var(--ink-6)' : 'none',
          }}>
            {i < step ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 10, color: i === step ? 'var(--ink-1)' : 'var(--ink-5)', fontWeight: i === step ? 500 : 400 }}>
            {s}
          </span>
          {i < STEPS.length - 1 && (
            <div style={{ width: 16, height: 1, background: 'var(--ink-6)' }} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <StepBar />

      <div style={{ padding: '24px 24px 0' }}>
        {/* Step 0: KYC */}
        {step === 0 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>KYC details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div className="field"><label>Full name *</label><input value={kyc.name} onChange={e => setK('name', e.target.value)} placeholder="As per PAN" /></div>
              <div className="field"><label>PAN *</label><input value={kyc.pan} onChange={e => setK('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></div>
              <div className="field"><label>Mobile *</label><input value={kyc.mobile} onChange={e => setK('mobile', e.target.value)} placeholder="9800012345" /></div>
              <div className="field"><label>Email</label><input type="email" value={kyc.email} onChange={e => setK('email', e.target.value)} placeholder="customer@email.com" /></div>
              <div className="field"><label>Date of birth</label><input type="date" value={kyc.dob} onChange={e => setK('dob', e.target.value)} /></div>
              <div className="field"><label>City</label><input value={kyc.city} onChange={e => setK('city', e.target.value)} placeholder="Mumbai" /></div>
            </div>
          </>
        )}

        {/* Step 1: Goals */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Life goals</div>
            {goals.map((g, i) => (
              <div key={i} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: i < goals.length - 1 ? '1px solid var(--p3)' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: 'var(--ink-2)' }}>Goal {i + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="field">
                    <label>Goal type</label>
                    <select value={g.type} onChange={e => setGoal(i, 'type', e.target.value)}>
                      <option value="retirement">Retirement corpus</option>
                      <option value="education">Child's education</option>
                      <option value="home">Home purchase</option>
                      <option value="wedding">Wedding</option>
                      <option value="custom">Other</option>
                    </select>
                  </div>
                  <div className="field"><label>Goal name</label><input value={g.name} onChange={e => setGoal(i, 'name', e.target.value)} /></div>
                  <div className="field"><label>Target amount (₹)</label><input type="number" value={g.targetAmount} onChange={e => setGoal(i, 'targetAmount', e.target.value)} placeholder="32000000" /></div>
                  <div className="field"><label>Target year</label><input type="number" value={g.targetYear} onChange={e => setGoal(i, 'targetYear', e.target.value)} /></div>
                  <div className="field"><label>Monthly SIP (₹)</label><input type="number" value={g.monthlySIP} onChange={e => setGoal(i, 'monthlySIP', e.target.value)} placeholder="42000" /></div>
                  <div className="field"><label>Inflation (%)</label><input type="number" step="0.5" value={g.inflation} onChange={e => setGoal(i, 'inflation', e.target.value)} /></div>
                </div>
              </div>
            ))}
            <button
              onClick={addGoal}
              style={{ width: '100%', padding: '10px', borderRadius: 100, border: '1px dashed var(--ink-6)', background: 'transparent', fontSize: 13, color: 'var(--ink-4)', cursor: 'pointer', marginBottom: 8 }}
            >
              + Add another goal
            </button>
          </>
        )}

        {/* Step 2: Risk profile */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Risk profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {RISK_OPTIONS.map(r => (
                <div
                  key={r.value}
                  onClick={() => setRisk(r.value)}
                  style={{
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${risk === r.value ? 'var(--ink-1)' : 'var(--ink-6)'}`,
                    background: risk === r.value ? 'var(--gold-bg)' : 'transparent',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `1.5px solid ${risk === r.value ? 'var(--ink-1)' : 'var(--ink-5)'}`,
                      background: risk === r.value ? 'var(--ink-1)' : 'transparent',
                    }} />
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{r.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 5, paddingLeft: 26 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Target allocation */}
        {step === 3 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Target allocation</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20 }}>
              Total must add up to 100%. Current: {Object.values(alloc).reduce((s, v) => s + parseInt(v || 0), 0)}%
            </div>
            {[
              { key: 'largeCap', label: 'Large cap equity' },
              { key: 'midSmall', label: 'Mid & small cap' },
              { key: 'debt',     label: 'Debt / bonds' },
              { key: 'gold',     label: 'Gold / alternates' },
              { key: 'cash',     label: 'Cash / liquid' },
            ].map(({ key, label }) => (
              <div key={key} className="field">
                <label>{label} (%)</label>
                <input
                  type="number" min="0" max="100"
                  value={alloc[key]}
                  onChange={e => setAlloc(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Review & confirm</div>
            <div style={{ background: 'var(--p2)', borderRadius: 10, padding: '16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 500, marginBottom: 10 }}>{kyc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span>PAN: {kyc.pan}</span>
                <span>Mobile: {kyc.mobile}</span>
                <span>Risk profile: {risk}</span>
                <span>Goals: {goals.length} configured</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16 }}>
              By confirming, you certify that the KYC details are accurate and the risk profile assessment has been completed in accordance with SEBI regulations.
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingBottom: 24 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-dark" onClick={() => setStep(s => s + 1)} style={{ flex: 2, borderRadius: 100 }}>
              Next: {STEPS[step + 1]} →
            </button>
          ) : (
            <button className="btn btn-dark" onClick={handleSubmit} disabled={loading} style={{ flex: 2, borderRadius: 100 }}>
              {loading ? 'Creating customer…' : 'Confirm & create customer'}
            </button>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
