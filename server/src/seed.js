const mongoose = require('mongoose');
const { RM, Customer, Alert, Transaction, Audit } = require('./models');

const DEFAULT_DATASET = process.env.SEED_DATASET || 'wealthos-demo';

function stripDocMeta(doc) {
  const { _id, __v, ...rest } = doc;
  return rest;
}

async function seedFromCollection(datasetName = DEFAULT_DATASET) {
  if (await RM.countDocuments() > 0) {
    console.log('✓ DB already has RM data; skipping seed');
    return;
  }

  const doc = await mongoose.connection.collection('seed_data').findOne({ name: datasetName });
  if (!doc || !doc.payload) {
    throw new Error(`seed_data dataset '${datasetName}' not found. Run 'npm run seed:export' first.`);
  }

  const payload = doc.payload;
  const rms = payload.rms || [];
  const customers = payload.customers || [];
  const alerts = payload.alerts || [];
  const transactions = payload.transactions || [];
  const audits = payload.audits || [];

  const insertedRms = await RM.insertMany(
    rms.map((rm) => {
      const clean = stripDocMeta(rm);
      return clean;
    })
  );
  const rmIdByEmail = new Map(insertedRms.map((rm) => [rm.email, rm._id]));

  const insertedCustomers = await Customer.insertMany(
    customers.map((c) => {
      const clean = stripDocMeta(c);
      const rmId = rmIdByEmail.get(clean.rmEmail);
      if (!rmId) throw new Error(`RM not found for customer '${clean.email}'`);
      delete clean.rmEmail;
      clean.rm = rmId;
      return clean;
    })
  );
  const customerIdByEmail = new Map(insertedCustomers.map((c) => [c.email, c._id]));

  await Alert.insertMany(
    alerts.map((a) => {
      const clean = stripDocMeta(a);
      if (clean.rmEmail) {
        clean.rm = rmIdByEmail.get(clean.rmEmail);
        delete clean.rmEmail;
      }
      if (clean.customerEmail) {
        clean.customer = customerIdByEmail.get(clean.customerEmail);
        delete clean.customerEmail;
      }
      return clean;
    })
  );

  await Transaction.insertMany(
    transactions.map((t) => {
      const clean = stripDocMeta(t);
      if (clean.rmEmail) {
        clean.rm = rmIdByEmail.get(clean.rmEmail);
        delete clean.rmEmail;
      }
      if (clean.customerEmail) {
        clean.customer = customerIdByEmail.get(clean.customerEmail);
        delete clean.customerEmail;
      }
      return clean;
    })
  );

  await Audit.insertMany(
    audits.map((a) => {
      const clean = stripDocMeta(a);
      if (clean.rmEmail) {
        clean.rm = rmIdByEmail.get(clean.rmEmail);
        delete clean.rmEmail;
      }
      if (clean.customerEmail) {
        clean.customer = customerIdByEmail.get(clean.customerEmail);
        delete clean.customerEmail;
      }
      return clean;
    })
  );

  console.log(
    `✓ Seeded from seed_data '${datasetName}': ${insertedRms.length} RMs, ${insertedCustomers.length} customers, ${alerts.length} alerts, ${transactions.length} transactions, ${audits.length} audit events`
  );
}

async function runAsScript() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to run seed script');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await seedFromCollection(DEFAULT_DATASET);
  await mongoose.disconnect();
}

if (require.main === module) {
  runAsScript().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedFromCollection };
