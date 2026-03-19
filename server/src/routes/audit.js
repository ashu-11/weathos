const router = require('express').Router();
const { verify } = require('../middleware/auth');
const { Audit } = require('../models');

router.get('/', verify, async (req, res) => {
  try {
    const { event, limit = 50, page = 1 } = req.query;
    const q = { rm: req.rm._id };
    if (event && event !== 'all') q.event = event;
    const logs = await Audit.find(q)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('customer', 'name');
    const total = await Audit.countDocuments(q);
    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
