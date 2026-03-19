const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Customer } = require('../models');
const { log } = require('../middleware/audit');

// GET /api/customers  — list all for this RM
router.get('/', verify, async (req, res) => {
  try {
    const { search, status, sort = '-aum' } = req.query;
    const q = { rm: req.rm._id };
    if (status) q.status = status;
    if (search) q.name = { $regex: search, $options: 'i' };
    const customers = await Customer.find(q)
      .sort(sort)
      .select('-commLog -holdings -sips');
    res.json(customers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customers/:id  — full detail
router.get('/:id', verify, async (req, res) => {
  try {
    const c = await Customer.findOne({ _id: req.params.id, rm: req.rm._id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    log(req, 'view', `Viewed customer profile — ${c.name}`, { customer: c._id });
    res.json(c);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/customers  — create new customer
router.post('/', verify, async (req, res) => {
  try {
    const c = await Customer.create({ ...req.body, rm: req.rm._id });
    log(req, 'data', `Created customer — ${c.name}`, { customer: c._id, after: { name: c.name } });
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/customers/:id  — update customer fields
router.patch('/:id', verify, async (req, res) => {
  try {
    const before = await Customer.findOne({ _id: req.params.id, rm: req.rm._id }).lean();
    if (!before) return res.status(404).json({ error: 'Not found' });
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    log(req, 'data', `Updated customer — ${updated.name}`, { customer: updated._id, before, after: req.body });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/customers/:id/comm-log  — add communication note
router.post('/:id/comm-log', verify, async (req, res) => {
  try {
    const { type, note } = req.body;
    const c = await Customer.findOneAndUpdate(
      { _id: req.params.id, rm: req.rm._id },
      {
        $push: { commLog: { $each: [{ type, note, rmName: req.rm.name, date: new Date() }], $position: 0 } },
        $set: { daysSinceContact: 0, updatedAt: new Date() },
      },
      { new: true }
    );
    if (!c) return res.status(404).json({ error: 'Not found' });
    log(req, 'data', `Logged ${type} note — ${c.name}`, { customer: c._id });
    res.json(c);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
