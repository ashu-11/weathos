const jwt = require('jsonwebtoken');
const { RM } = require('../models');

const SECRET = process.env.JWT_SECRET || 'wealthos-dev-secret-2026';

exports.sign = (rmId) =>
  jwt.sign({ id: rmId }, SECRET, { expiresIn: '12h' });

exports.verify = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { id } = jwt.verify(token, SECRET);
    const rm = await RM.findById(id);
    if (!rm) return res.status(401).json({ error: 'RM not found' });
    req.rm = rm;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
