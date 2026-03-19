const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Alert } = require('../models');

// GET /api/alerts
router.get('/', verify, async (req, res) => {
  try {
    const { urgency, type } = req.query;
    const q = { rm: req.rm._id, dismissed: false };
    if (urgency) q.urgency = urgency;
    if (type) q.type = type;
    const alerts = await Alert.find(q)
      .sort({ createdAt: -1 })
      .populate('customer', 'name aum');
    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/alerts/:id/read
router.patch('/:id/read', verify, async (req, res) => {
  try {
    const a = await Alert.findOneAndUpdate(
      { _id: req.params.id, rm: req.rm._id },
      { read: true },
      { new: true }
    );
    res.json(a);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/alerts/read-all
router.patch('/read-all', verify, async (req, res) => {
  try {
    await Alert.updateMany({ rm: req.rm._id }, { read: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
