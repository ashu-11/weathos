import { useState, useRef } from 'react';
import { aiAPI } from '../services/api';

const DEFAULT_CHIPS = [
  { label: 'Fund XIRR',     q: 'What is the current XIRR on each fund?' },
  { label: 'Goal timeline', q: 'When does this customer hit their retirement goal at current SIP?' },
  { label: 'SIP needed',    q: 'How much SIP is needed to hit the retirement goal 2 years early?' },
  { label: 'Drift details', q: 'What is the portfolio drift vs target allocation?' },
  { label: 'Underperformers', q: 'Which funds are underperforming their benchmark?' },
  { label: 'Tax savings',   q: 'What tax savings can still be made this year?' },
  { label: 'Stress test',   q: 'If Nifty drops 10%, what happens to the retirement timeline?' },
  { label: 'Mandate',       q: 'What is the SIP mandate renewal date?' },
];

export default function AskBox({ customerId, chips = DEFAULT_CHIPS }) {
  const [input,   setInput]   = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const r = await aiAPI.ask(question, customerId);
      setAnswers(prev => [{ q: question, a: r.data.answer }, ...prev]);
    } catch {
      setAnswers(prev => [{ q: question, a: 'Unable to get answer. Please try again.' }, ...prev]);
    } finally {
      setLoading(false);
    }
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') ask(input);
  };

  return (
    <div className="ask-box">
      <div className="ask-header">
        <span className="ask-label">Ask anything</span>
        {loading && (
          <span style={{ fontSize: 10, color: 'var(--gold)' }}>Thinking…</span>
        )}
      </div>

      <div className="ask-row">
        <input
          ref={inputRef}
          className="ask-input"
          placeholder="Fund XIRR, goal timeline, tax savings…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="ask-send" onClick={() => ask(input)} disabled={loading}>→</button>
      </div>

      <div className="ask-chips">
        {chips.map(c => (
          <button
            key={c.label}
            className="ask-chip"
            onClick={() => ask(c.q)}
            disabled={loading}
          >
            {c.label}
          </button>
        ))}
      </div>

      {answers.length > 0 && (
        <div className="ask-answers">
          {answers.map((item, i) => (
            <div key={i} className="ask-qa">
              <div className="ask-q">{item.q}</div>
              <div className="ask-a" dangerouslySetInnerHTML={{ __html: formatAnswer(item.a) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatAnswer(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
