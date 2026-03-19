const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Customer, Alert, Transaction } = require('../models');

// GET /api/rm/dashboard
router.get('/dashboard', verify, async (req, res) => {
  try {
    const rmId = req.rm._id;
    const customers = await Customer.find({ rm: rmId });

    const aum = customers.reduce((s, c) => s + c.aum, 0);
    const targetPct = Math.round((aum / req.rm.target) * 100);
    const gapCr = +(req.rm.target - aum).toFixed(2);
    const alertCount = await Alert.countDocuments({ rm: rmId, read: false, dismissed: false });
    const urgentCount = await Alert.countDocuments({ rm: rmId, urgency: 'urgent', dismissed: false });
    const churnRisk = customers.filter(c => c.churnScore >= 60).length;

    // Priority action list — sort by AUM impact × urgency
    const actionQueue = customers
      .filter(c => c.status !== 'churned')
      .sort((a, b) => (b.churnScore * b.aum) - (a.churnScore * a.aum))
      .slice(0, 8)
      .map(c => ({
        _id: c._id,
        name: c.name,
        aum: c.aum,
        status: c.status,
        churnScore: c.churnScore,
        daysSinceContact: c.daysSinceContact,
        briefAI: c.briefAI,
        goalsOnTrack: c.goals.filter(g => g.status === 'on_track').length,
        totalGoals: c.goals.length,
        drift: c.drift,
      }));

    res.json({
      rm: req.rm.toSafeObject(),
      stats: { aum: +aum.toFixed(2), targetPct, gapCr, alertCount, urgentCount, churnRisk, totalCustomers: customers.length },
      actionQueue,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/rm/book-summary  — AI book summary stats
router.get('/book-summary', verify, async (req, res) => {
  try {
    const customers = await Customer.find({ rm: req.rm._id });
    const aum = +customers.reduce((s, c) => s + c.aum, 0).toFixed(2);
    const driftAlerts = customers.filter(c => c.drift >= 5);
    const churnRisks  = customers.filter(c => c.churnScore >= 60);
    const allGoals    = customers.flatMap(c => c.goals);
    res.json({
      aum,
      totalCustomers: customers.length,
      driftAlerts: driftAlerts.map(c => ({ name: c.name, drift: c.drift })),
      churnRisks:  churnRisks.map(c => ({ name: c.name, daysSinceContact: c.daysSinceContact, churnScore: c.churnScore })),
      goals: {
        total:    allGoals.length,
        onTrack:  allGoals.filter(g => g.status === 'on_track').length,
        atRisk:   allGoals.filter(g => g.status === 'at_risk').length,
        offTrack: allGoals.filter(g => g.status === 'off_track').length,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
