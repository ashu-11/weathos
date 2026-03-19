require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✓ MongoDB in-memory running at', uri);

  // Seed data
  await require('./seed')();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✓ WealthOS API on http://localhost:${PORT}`));
}

start().catch(console.error);
