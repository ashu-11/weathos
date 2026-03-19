const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Customer } = require('../models');

// Simulation engine — computes portfolio impact for each event type
function simulate(customer, eventType) {
  const { aum, currentAllocation: alloc, goals, xirr } = customer;
  const aumLakh = aum * 100;

  const events = {
    rate_cut: () => {
      const debtLakh = (alloc.debt / 100) * aumLakh;
      const impactLakh = +(debtLakh * 0.004).toFixed(2);        // ~0.4% NAV uptick
      const newDebt = Math.min(alloc.debt + 10, 40);
      const newEq   = alloc.largeCap + alloc.midSmall - 10;
      const retirementGoal = goals.find(g => g.type === 'retirement');
      const goalImpactYrs = retirementGoal ? +((impactLakh / (retirementGoal.targetAmount / 100000)) * 12).toFixed(1) : 0;
      return {
        label: 'Rate cut −25bps',
        impactDisplay: `+₹${impactLakh.toFixed(1)} L`,
        impactSign: 'positive',
        sub: `A 25bps rate cut benefits ${customer.name.split(' ')[0]}'s ₹${debtLakh.toFixed(0)} L debt sleeve. Short-duration NAV rises today, but the real play is extending duration before the market reprices.`,
        metrics: { goalTimeline: `+${goalImpactYrs} yrs`, window: '3 days', action: 'Extend duration' },
        allocation: { equity: newEq, debt: newDebt, gold: alloc.gold, cash: alloc.cash },
        opener: `"Your short-duration fund gained ₹${(debtLakh * 0.004 * 10000).toFixed(0)} today from the rate cut — your debt allocation is working."`,
        steps: [
          `Move ₹${(aumLakh * 0.10).toFixed(0)} L from large-cap to SBI Gilt Fund — rate cycle favours longer duration.`,
          `This closes the retirement timeline — ${customer.name.split(' ')[0]} hits the corpus by ${(retirementGoal?.targetYear || 2041) - 2} instead of ${retirementGoal?.targetYear || 2041}.`,
        ],
      };
    },

    market_correction: () => {
      const eqLakh = ((alloc.largeCap + alloc.midSmall) / 100) * aumLakh;
      const impactLakh = +(eqLakh * 0.08).toFixed(2);
      return {
        label: 'Market −8%',
        impactDisplay: `−₹${impactLakh.toFixed(1)} L (paper)`,
        impactSign: 'negative',
        sub: `Markets corrected 8%. ${customer.name.split(' ')[0]}'s equity sleeve is down ₹${impactLakh.toFixed(1)} L on paper — but the horizon makes this a buy signal, not a sell.`,
        metrics: { goalTimeline: 'Unchanged', window: 'Buy now', action: 'Lump sum top-up' },
        allocation: { equity: alloc.largeCap + alloc.midSmall + 5, debt: alloc.debt - 5, gold: alloc.gold, cash: alloc.cash },
        opener: `"Your portfolio is down ₹${impactLakh.toFixed(1)} L — I wanted to reach you before you see the news."`,
        steps: [
          `"Markets corrected, but your SIP averaging means you're buying more units this month."`,
          `Suggest a ₹${(aumLakh * 0.03).toFixed(0)} L lump sum top-up — corrections are compounding opportunities.`,
        ],
      };
    },

    sip_increase: () => {
      const sipIncrease = 8000;
      const retirementGoal = goals.find(g => g.type === 'retirement');
      const monthsEarlier = retirementGoal ? Math.round((sipIncrease * 12 * 10) / (retirementGoal.targetAmount / 100000)) : 22;
      const corpusGain = +(sipIncrease * 12 * 18 * 1.12).toFixed(0); // rough FV
      return {
        label: 'SIP +₹8k/mo',
        impactDisplay: `+₹${(corpusGain / 100000).toFixed(1)} L corpus`,
        impactSign: 'positive',
        sub: `Increasing ${customer.name.split(' ')[0]}'s SIP by ₹8,000/month closes the retirement gap by ~${monthsEarlier} months. One conversation today changes the goal year.`,
        metrics: { goalTimeline: `−${monthsEarlier} months`, window: 'Start Apr', action: 'Mandate update' },
        allocation: { ...alloc },
        opener: `"Your retirement goal gets ${monthsEarlier} months closer with just ₹8,000 more per month."`,
        steps: [
          `Split: ₹5k to PPFAS Flexi Cap for long-term growth, ₹3k to short duration for liquidity.`,
          `"I can set the mandate update right now — takes 2 minutes."`,
        ],
      };
    },

    rebalance: () => {
      const target = customer.targetAllocation;
      return {
        label: 'Rebalance to model',
        impactDisplay: `Locks ₹${(aumLakh * 0.04).toFixed(0)} L gain`,
        impactSign: 'neutral',
        sub: `${customer.name.split(' ')[0]}'s portfolio has drifted ${customer.drift.toFixed(1)}% above target equity. Rebalancing locks in gains and reduces drawdown risk.`,
        metrics: { goalTimeline: 'Risk −12%', window: 'This week', action: 'Rebalance now' },
        allocation: { equity: target.largeCap + target.midSmall, debt: target.debt, gold: target.gold, cash: target.cash },
        opener: `"Your equity has run ahead of plan — let's lock in some of those gains."`,
        steps: [
          `Move ₹${(aumLakh * (customer.drift / 100)).toFixed(0)} L from equity to debt and gold — standard portfolio hygiene.`,
          `"Rebalancing now means you sell high." If markets correct, gains are protected.`,
        ],
      };
    },

    fund_manager_change: () => ({
      label: 'Fund mgr change',
      impactDisplay: 'Watch only',
      impactSign: 'neutral',
      sub: `The fund manager change at Axis Bluechip is a yellow flag, not a red one. ${customer.name.split(' ')[0]} holds ${customer.holdings.find(h => h.fund.includes('Axis Bluechip'))?.amountLakh || 30} L here. Watch-and-hold for 2 quarters.`,
      metrics: { goalTimeline: 'No change', window: '2 quarters', action: 'Monitor' },
      allocation: { ...alloc },
      opener: `"Axis Bluechip changed its fund manager — I wanted to tell you before you see it in the news."`,
      steps: [
        `"The new manager has a solid 8-year track record. Watch for 2 quarters."`,
        `"I've set an alert — if returns dip below benchmark, we switch immediately."`,
      ],
    }),
  };

  const fn = events[eventType];
  if (!fn) return { error: 'Unknown event type' };
  return fn();
}

// POST /api/simulator/run
router.post('/run', verify, async (req, res) => {
  try {
    const { customerId, eventType } = req.body;
    const customer = await Customer.findOne({ _id: customerId, rm: req.rm._id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const result = simulate(customer, eventType);
    res.json({ customer: { name: customer.name, aum: customer.aum }, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
