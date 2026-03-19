const { Audit } = require('../models');

exports.log = (req, event, action, extra = {}) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '—';
  const device = req.headers['user-agent']?.split(' ')[0] || '—';
  return Audit.create({
    rm:       req.rm?._id,
    customer: extra.customer,
    event,
    action,
    ip,
    device,
    before: extra.before,
    after:  extra.after,
  }).catch(() => {}); // fire-and-forget, never block the request
};
