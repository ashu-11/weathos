const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { RM } = require('../models');
const { sign, verify } = require('../middleware/auth');
const { log } = require('../middleware/audit');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const rm = await RM.findOne({ email: email?.toLowerCase() });
    if (!rm) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, rm.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = sign(rm._id);
    log({ headers: req.headers, socket: req.socket, rm }, 'auth', `Sign in · ${req.headers['user-agent']?.substring(0,40)}`);
    res.json({ token, rm: rm.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me
router.get('/me', verify, (req, res) => {
  res.json(req.rm.toSafeObject());
});

module.exports = router;
