const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Transaction, Customer } = require('../models');
const { log } = require('../middleware/audit');

// GET /api/transactions
router.get('/', verify, async (req, res) => {
  try {
    const txns = await Transaction.find({ rm: req.rm._id })
      .sort('-createdAt')
      .populate('customer', 'name riskProfile');
    res.json(txns);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/transactions
router.post('/', verify, async (req, res) => {
  try {
    const { customerId, type, fund, amount, sipDate, mandate, note } = req.body;
    const customer = await Customer.findOne({ _id: customerId, rm: req.rm._id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Suitability check
    const highRiskFunds = ['Axis Small Cap', 'Nippon Small Cap', 'SBI Small Cap'];
    const suitabilityPassed = !(highRiskFunds.some(f => fund?.includes(f)) && customer.riskProfile === 'conservative');

    const txn = await Transaction.create({
      rm: req.rm._id,
      customer: customerId,
      type, fund, amount, sipDate, mandate, note,
      suitabilityPassed,
      status: 'pending',
    });

    // Simulate processing delay
    setTimeout(async () => {
      await Transaction.findByIdAndUpdate(txn._id, { status: 'confirmed', confirmedAt: new Date() });
    }, 2000);

    log(req, 'txn', `${type} placed · ${customer.name} · ₹${amount?.toLocaleString('en-IN')} · ${fund}`, { customer: customer._id });
    res.status(201).json({ ...txn.toObject(), suitabilityPassed });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
