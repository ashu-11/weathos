import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';

const SUGGESTED = [
  'Which customers have the highest churn risk this week?',
  'Draft a WhatsApp message to Priya about the RBI rate cut',
  'How much AUM do I need to add to hit my target this month?',
  'Which customers have ELSS expiring in the next 30 days?',
  'Compare Parag Parikh Flexi Cap vs Mirae Asset Large Cap',
  'What is the best SIP for a 45yr old targeting ₹2Cr at retirement?',
  'Summarise my book — AUM, drift, compliance issues',
  'What are the top 3 things I should do today to hit my monthly target?',
  'Generate a portfolio review report for Priya Sharma',
  'Which of my customers should shift from growth to balanced given their age?',
];

function Msg({ role, text }) {
  const isMe = role === 'user';
  return (
    <div className={`msg-wrap${isMe ? ' me' : ''}`}>
      <div
        className="msg-av"
        style={{
          background: isMe ? 'var(--ink-1)' : 'var(--gold-bg)',
          color:      isMe ? 'var(--paper)' : 'var(--gold)',
          border:     isMe ? 'none' : '1px solid var(--gold-l)',
        }}
      >
        {isMe ? 'RM' : 'W'}
      </div>
      <div
        className={`msg-bubble ${isMe ? 'msg-me' : 'msg-ai'}`}
        dangerouslySetInnerHTML={{ __html: formatMsg(text) }}
      />
    </div>
  );
}

function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

export default function Chat() {
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showSug, setShowSug] = useState(true);
  const endRef  = useRef(null);
  const taRef   = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setShowSug(false);
    setMsgs(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    if (taRef.current) taRef.current.style.height = '42px';
    setLoading(true);

    // Typing indicator
    setMsgs(prev => [...prev, { role: 'ai', text: '…', typing: true }]);
    try {
      const r = await aiAPI.chat(q);
      setMsgs(prev => prev.filter(m => !m.typing).concat({ role: 'ai', text: r.data.answer }));
    } catch {
      setMsgs(prev => prev.filter(m => !m.typing).concat({ role: 'ai', text: 'Unable to process. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  return (
    <div className="chat-page">
      {/* Suggestions */}
      {showSug && (
        <div className="chat-suggestions">
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Suggested prompts
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 14, borderBottom: '1px solid var(--p3)' }}>
            {SUGGESTED.map(q => (
              <button key={q} className="ask-chip" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-msgs">
        {msgs.length === 0 && !showSug && (
          <div className="empty-state" style={{ margin: 'auto' }}>
            <div className="empty-icon">◑</div>
            <div className="empty-text">Ask anything about your book, customers, markets or compliance</div>
          </div>
        )}
        {msgs.map((m, i) => (
          <Msg key={i} role={m.role} text={m.typing ? 'Thinking…' : m.text} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <textarea
          ref={taRef}
          className="chat-textarea"
          placeholder="Ask anything — customer queries, market analysis, compliance checks, draft messages…"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="chat-send" onClick={() => send()} disabled={loading}>→</button>
      </div>
    </div>
  );
}
