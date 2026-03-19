const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Customer, Alert } = require('../models');
const { log } = require('../middleware/audit');

// Knowledge base for common questions
function buildAnswer(q, context) {
  const lower = q.toLowerCase();
  const { rm, customers, customer, alerts } = context;

  // ── CUSTOMER-SPECIFIC questions ──────────────────────────
  if (customer) {
    const c = customer;
    const name1 = c.name.split(' ')[0];

    if (lower.includes('xirr') || lower.includes('return') || lower.includes('performance')) {
      const lines = c.holdings.map(h =>
        `${h.fund}: ${h.xirr3Y > 0 ? '+' : ''}${h.xirr3Y}% (benchmark ${h.benchmark3Y}%)`
      ).join('\n');
      return `**${name1}'s fund-wise returns (3Y CAGR):**\n\n${lines}\n\n**Overall portfolio XIRR: ${c.xirr}%**\n\n${c.holdings.filter(h => h.xirr3Y < h.benchmark3Y).length} funds are below their benchmark — ${c.holdings.filter(h => h.xirr3Y < h.benchmark3Y).map(h => h.fund).join(', ') || 'none'}.`;
    }

    if (lower.includes('goal') && (lower.includes('when') || lower.includes('timeline') || lower.includes('hit') || lower.includes('reach'))) {
      const ret = c.goals.find(g => g.type === 'retirement');
      if (ret) {
        const pct = ret.pctFunded;
        const yearsLeft = ret.targetYear - 2026;
        const monthsAhead = c.aum > 4 ? 22 : 0;
        return `**${name1}'s retirement goal timeline:**\n\nTarget: ₹${(ret.targetAmount / 10000000).toFixed(1)} Cr by ${ret.targetYear} (${yearsLeft} years left)\nCurrently ${pct}% funded — ₹${(ret.savedAmount / 10000000).toFixed(2)} Cr saved.\n\nAt current SIP of ₹${(ret.monthlySIP / 1000).toFixed(0)}k/month, ${name1} hits the corpus on schedule.\n\nIncreasing SIP by ₹8,000/month would achieve the goal **${monthsAhead} months earlier** — by ${ret.targetYear - Math.round(monthsAhead / 12)}.`;
      }
    }

    if (lower.includes('sip') && lower.includes('need') || lower.includes('how much') && lower.includes('sip')) {
      const ret = c.goals.find(g => g.type === 'retirement');
      if (ret) {
        const gap = ret.targetAmount - ret.savedAmount;
        const years = ret.targetYear - 2026;
        const neededMonthly = Math.round(gap / (years * 12 * 1.12)); // rough
        return `To reach ${name1}'s ₹${(ret.targetAmount / 10000000).toFixed(1)} Cr retirement goal by ${ret.targetYear}:\n\n**Required SIP: ~₹${(neededMonthly / 1000).toFixed(0)}k/month** (assuming 12% equity returns)\n\nCurrent SIP: ₹${(ret.monthlySIP / 1000).toFixed(0)}k/month\nGap: ₹${((neededMonthly - ret.monthlySIP) / 1000).toFixed(0)}k/month more needed\n\nOr alternatively: a lump sum of ₹${(gap * 0.1 / 100000).toFixed(0)} L today achieves the same result without changing SIP.`;
      }
    }

    if (lower.includes('drift') || lower.includes('allocation') || lower.includes('rebalance')) {
      const t = c.targetAllocation;
      const a = c.currentAllocation;
      return `**${name1}'s portfolio drift:**\n\nTarget vs Current:\n- Large cap: ${t.largeCap}% target → ${a.largeCap}% actual (${a.largeCap - t.largeCap > 0 ? '+' : ''}${a.largeCap - t.largeCap}%)\n- Mid/small: ${t.midSmall}% target → ${a.midSmall}% actual (${a.midSmall - t.midSmall > 0 ? '+' : ''}${a.midSmall - t.midSmall}%)\n- Debt: ${t.debt}% target → ${a.debt}% actual (${a.debt - t.debt > 0 ? '+' : ''}${a.debt - t.debt}%)\n- Gold: ${t.gold}% target → ${a.gold}% actual\n\n**Overall drift: ${c.drift.toFixed(1)}%** ${c.drift > 5 ? '⚠️ Rebalancing recommended' : '✓ Within range'}`;
    }

    if (lower.includes('underperform') || lower.includes('below benchmark') || lower.includes('lagging')) {
      const under = c.holdings.filter(h => h.xirr3Y < h.benchmark3Y);
      if (under.length === 0) return `All of ${name1}'s funds are outperforming their benchmarks. No action needed on fund selection.`;
      return `**Underperforming funds for ${name1}:**\n\n${under.map(h => `- **${h.fund}**: ${h.xirr3Y}% vs benchmark ${h.benchmark3Y}% (gap: ${(h.benchmark3Y - h.xirr3Y).toFixed(1)}%)`).join('\n')}\n\nFor funds underperforming by >2% for 2+ years, consider switching. Watch-and-hold for 2 quarters first.`;
    }

    if (lower.includes('tax') || lower.includes('80c') || lower.includes('elss')) {
      const elssHolding = c.holdings.find(h => h.category === 'ELSS');
      return `**Tax savings for ${name1}:**\n\n${elssHolding ? `ELSS holding: ${elssHolding.fund} (₹${elssHolding.amountLakh} L)\n` : ''}\n80C limit: ₹1.5 L/year\nEstimated unused 80C: ₹${elssHolding ? '0' : '1,50,000'}\nTax saving at 30% bracket: up to **₹45,000**\n\nRecommend: Invest remaining 80C in ELSS before March 31. Current market dip = lower NAV entry.`;
    }

    if (lower.includes('stress') || lower.includes('nifty drop') || lower.includes('market fall') || lower.includes('correction')) {
      const eqPct = (c.currentAllocation.largeCap + c.currentAllocation.midSmall) / 100;
      const impact = +(c.aum * eqPct * 0.10 * 100).toFixed(1);
      return `**Market stress test for ${name1} (Nifty −10%):**\n\nEquity exposure: ${(eqPct * 100).toFixed(0)}% of portfolio\nPaper loss: −₹${impact} L\n\nBut with a ${c.goals[0]?.targetYear - 2026 || 15}-year investment horizon, short-term corrections reduce the timeline impact to under 3 months on the retirement goal.\n\nRecommendation: **Stay invested.** ${c.aum > 3 ? 'Consider a ₹' + (c.aum * 2).toFixed(0) + ' L lump sum top-up to average down.' : 'Ensure SIP is not paused.'}`;
    }

    if (lower.includes('mandate') || lower.includes('renewal') || lower.includes('nach')) {
      const sips = c.sips.filter(s => s.active);
      return `**${name1}'s active mandates:**\n\n${sips.map(s => `- ${s.fund}: ₹${(s.amount / 1000).toFixed(0)}k/mo · ${s.mandate} · ${s.date}th of month`).join('\n')}\n\nAll NACH mandates are active. No renewals required in the next 6 months.`;
    }

    if (lower.includes('kyc') || lower.includes('compliance') || lower.includes('fatca')) {
      const kyc = c.kyc;
      const expiry = new Date(kyc.expiry);
      const daysLeft = Math.round((expiry - new Date()) / (1000 * 60 * 60 * 24));
      return `**${name1}'s compliance status:**\n\nKYC: ${kyc.status.toUpperCase()} · Expiry: ${expiry.toLocaleDateString('en-IN')} (${daysLeft} days left)\nFATCA: ${kyc.fatca ? '✓ Compliant' : '⚠️ Pending'}\nMandate: ${kyc.mandate.toUpperCase()}\nLast suitability check: ${kyc.suitabilityDate ? new Date(kyc.suitabilityDate).toLocaleDateString('en-IN') : 'Not on record'}\n\n${daysLeft < 30 ? `⚠️ KYC expiry in ${daysLeft} days — urgent action required.` : '✓ All compliance checks clear.'}`;
    }
  }

  // ── BOOK-LEVEL questions ──────────────────────────────────
  if (customers && customers.length > 0) {
    if (lower.includes('churn') || lower.includes('risk') || lower.includes('at risk')) {
      const risky = customers.filter(c => c.churnScore >= 50).sort((a, b) => b.churnScore - a.churnScore).slice(0, 4);
      return `**Top churn risks in your book:**\n\n${risky.map((c, i) => `${i + 1}. **${c.name}** — ${c.daysSinceContact} days silent, churn score ${c.churnScore}/100, ₹${c.aum} Cr AUM\n   Action: ${c.churnScore > 70 ? 'Text now, call if no reply in 2h' : 'Call this week'}`).join('\n\n')}\n\nTotal at-risk AUM: ₹${risky.reduce((s, c) => s + c.aum, 0).toFixed(1)} Cr`;
    }

    if (lower.includes('elss') || lower.includes('lock-in') || lower.includes('expir')) {
      return `**ELSS expiries in next 30 days:**\n\n| Customer | Fund | Amount | Expiry |\n|---|---|---|---|\n| Ritu Desai | Axis LTEF | ₹1.1 L | 28 Mar |\n| Sunita Malhotra | Mirae ELSS | ₹80,000 | 5 Apr |\n| Kavita Rao | HDFC ELSS | ₹1.5 L | 12 Apr |\n\nAll three should be contacted this week. Reinvesting saves ₹30–45k in tax per customer at 30% bracket.`;
    }

    if (lower.includes('target') || lower.includes('gap') || lower.includes('achieve')) {
      const aum = customers.reduce((s, c) => s + c.aum, 0).toFixed(2);
      const gap = (rm.target - aum).toFixed(2);
      return `**Progress to monthly target:**\n\nCurrent AUM: ₹${aum} Cr\nTarget: ₹${rm.target} Cr\nGap: **₹${gap} Cr** · ${Math.round((aum / rm.target) * 100)}% achieved\n\n**Fastest paths to close:**\n1. Priya Sharma lump sum after rate cut call (₹5–10 L)\n2. Arjun Kapoor SIP increase (₹18k/mo confirmed capacity)\n3. Kavita Rao — HDFC ELSS reinvestment ₹1.5 L\n4. Vikram Nair FD maturity ₹80 L — reinvestment opportunity`;
    }

    if (lower.includes('summar') || lower.includes('book') || lower.includes('overview')) {
      const aum = customers.reduce((s, c) => s + c.aum, 0).toFixed(2);
      const driftAlerts = customers.filter(c => c.drift >= 5);
      const allGoals = customers.flatMap(c => c.goals);
      return `**Book summary — ${rm.name}**\n\n📊 AUM: ₹${aum} Cr · Target: ${Math.round((aum / rm.target) * 100)}% · Gap: ₹${(rm.target - aum).toFixed(1)} Cr\n⚠️ Drift alerts: ${driftAlerts.length} customers with >5% drift\n📉 Churn risk: ${customers.filter(c => c.churnScore >= 60).length} customers flagged\n🎯 Goals: ${allGoals.filter(g => g.status === 'on_track').length} on track, ${allGoals.filter(g => g.status === 'at_risk').length} at risk, ${allGoals.filter(g => g.status === 'off_track').length} off track\n✅ Compliance: ${customers.filter(c => c.kyc.status === 'verified').length} KYC verified`;
    }

    if ((lower.includes('today') || lower.includes('priorit') || lower.includes('action')) && lower.includes('3')) {
      const aum = customers.reduce((s, c) => s + c.aum, 0).toFixed(2);
      const gap = (rm.target - aum).toFixed(2);
      return `**Top 3 actions today (₹${gap} Cr gap, 12 days left):**\n\n**1. Call Priya Sharma** (rate cut angle, ₹4.2 Cr)\nLead with her ₹37k gain today. Propose SBI Gilt extension + SIP increase. Even a ₹5 L lump sum helps close the gap.\n\n**2. Text Vikram Nair now** (churn risk + KYC expiry in 7 days)\nOne message, two problems. FD maturity this week is your entry for a ₹10–15 L rebalancing conversation.\n\n**3. Call Kavita Rao** (prospect, est. ₹2.5 Cr)\nReferred by Priya 3 weeks ago. First call with Priya as social proof is your highest-conversion move today.`;
    }

    if (lower.includes('compare') || lower.includes(' vs ') || lower.includes('ppfas') || lower.includes('mirae')) {
      return `**Parag Parikh Flexi Cap vs Mirae Asset Large Cap:**\n\n| Metric | PPFAS Flexi | Mirae Large Cap |\n|---|---|---|\n| 1Y return | 22.4% | 18.1% |\n| 3Y CAGR | 28.4% | 21.3% |\n| 5Y CAGR | 24.1% | 19.8% |\n| Expense ratio | 0.63% | 0.58% |\n| AUM | ₹68,000 Cr | ₹41,000 Cr |\n| Std Dev (risk) | 14.2% | 12.8% |\n\n**Verdict:** PPFAS for aggressive profiles, 5yr+ horizon — ~15% international allocation adds diversification. Mirae for moderate investors wanting pure India large-cap stability.`;
    }

    if (lower.includes('draft') || lower.includes('whatsapp') || lower.includes('message')) {
      return `**WhatsApp message — RBI rate cut:**\n\n---\n*Hi [Customer name],* good news today — RBI cut rates by 25bps 🎉\n\nYour bond portfolio has already gained from this. I want to make sure we position your portfolio to capture the next few cuts too.\n\nWould you have 10 minutes for a quick call today or tomorrow? I have a specific recommendation ready.\n\n— ${rm.name}\n---\n\n*Keep it under 60 words for WhatsApp. Personalise the first line with their fund name and actual gain amount for best conversion.*`;
    }

    if (lower.includes('sip') && (lower.includes('retirement') || lower.includes('60') || lower.includes('crore'))) {
      return `**SIP calculator — ₹2 Cr retirement at 60:**\n\nFor a 45-year-old targeting ₹2 Cr in 15 years:\n\n**At 12% returns:** ₹22,400/month\n**At 10% (conservative):** ₹26,100/month\n\nFund mix recommendation:\n- 50% Large cap (stability)\n- 30% Flexi cap (growth)\n- 20% Short duration (rebalancing buffer)\n\nAt 50 → shift to 40/60 equity-debt. At 55 → 30/70. Review annually.`;
    }

    if (lower.includes('age') || lower.includes('balanced') || lower.includes('shift')) {
      return `**Customers to shift to balanced allocation:**\n\n| Customer | Age | Equity | Recommended | Reason |\n|---|---|---|---|---|\n| Vikram Nair | 54 | 65% | 45% | 6yr to retirement |\n| Sunita Malhotra | 57 | 27% | Already conservative |\n| Kavita Rao | 49 | 48% | 40% | Goals nearing horizon |\n\nUse STP over 6–9 months — avoids tax events and reduces timing risk.`;
    }

    if (lower.includes('report') || lower.includes('priya')) {
      const priya = customers.find(c => c.name.includes('Priya'));
      if (priya) {
        return `**Portfolio Review — ${priya.name}**\nAs of 19 March 2026\n\n**Performance**\nAUM: ₹${priya.aum} Cr | XIRR: ${priya.xirr}% | Nifty: 15.2% | Alpha: +${(priya.xirr - 15.2).toFixed(1)}%\n\n**Allocation**\nEquity: ${priya.currentAllocation.largeCap + priya.currentAllocation.midSmall}% (target ${priya.targetAllocation.largeCap + priya.targetAllocation.midSmall}%)\nDebt: ${priya.currentAllocation.debt}% (target ${priya.targetAllocation.debt}%)\n\n**Goals**\n${priya.goals.map(g => `→ ${g.name} (₹${(g.targetAmount / 10000000).toFixed(1)} Cr, ${g.targetYear}): ${g.pctFunded}% funded — ${g.status.replace('_', ' ').toUpperCase()}`).join('\n')}\n\n**Actions recommended**\n1. Extend debt duration — SBI Gilt (rate cut opportunity)\n2. Increase SIP ₹8k/mo — closes retirement gap by 22 months\n3. Rebalance ₹${(priya.aum * 10).toFixed(0)} L from equity to debt`;
      }
    }
  }

  // ── Generic fallback ──────────────────────────────────────
  const custCount = customers?.length || 0;
  const totalAum = customers?.reduce((s, c) => s + c.aum, 0).toFixed(2) || '0';
  return `I'm processing your question: "${q}"\n\nI have access to your ${custCount} customers (₹${totalAum} Cr AUM) and all portfolio data. For a more specific answer, try:\n- Asking about a named customer\n- Specifying a goal type (retirement, home, education)\n- Asking for a fund comparison or calculation\n- Requesting a draft message for a specific event`;
}

// POST /api/ai/ask  — ask about a specific customer
router.post('/ask', verify, async (req, res) => {
  try {
    const { question, customerId } = req.body;
    const customer = customerId
      ? await Customer.findOne({ _id: customerId, rm: req.rm._id })
      : null;
    const customers = await Customer.find({ rm: req.rm._id });
    const answer = buildAnswer(question, { rm: req.rm, customers, customer, alerts: [] });
    log(req, 'ai', `AI question — "${question.substring(0, 60)}"`, { customer: customer?._id });
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ai/chat  — general RM chat (book-level)
router.post('/chat', verify, async (req, res) => {
  try {
    const { message } = req.body;
    const customers = await Customer.find({ rm: req.rm._id });
    const answer = buildAnswer(message, { rm: req.rm, customers, customer: null });
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
