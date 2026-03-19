require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedFromCollection } = require('./seed');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):3000$/.test(origin || '');

    if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalDevOrigin)) {
      return callback(null, true);
    }

    // Avoid returning a 500 for blocked origins. Browser will block CORS response.
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/rm',          require('./routes/rm'));
app.use('/api/customers',   require('./routes/customers'));
app.use('/api/alerts',      require('./routes/alerts'));
app.use('/api/simulator',   require('./routes/simulator'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai',          require('./routes/ai'));
app.use('/api/audit',       require('./routes/audit'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', db: mongoose.connection.readyState }));

async function start() {
  let uri = process.env.MONGODB_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log('✓ MongoDB connected from MONGODB_URI');
  } else {
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ MongoDB in-memory running at', uri);
  }

  if (process.env.AUTO_SEED === 'true') {
    await seedFromCollection();
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✓ WealthOS API on http://localhost:${PORT}`));
}

start().catch(console.error);
