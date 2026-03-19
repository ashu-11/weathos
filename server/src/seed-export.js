require('dotenv').config();
const mongoose = require('mongoose');
const { RM, Customer, Alert, Transaction, Audit } = require('./models');

const DEFAULT_DATASET = process.env.SEED_DATASET || 'wealthos-demo';

function stripDocMeta(doc) {
  const { _id, __v, ...rest } = doc;
  return rest;
}

async function exportSeedData(datasetName = DEFAULT_DATASET) {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to export seed data');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const rms = await RM.find().lean();
  const customers = await Customer.find().lean();
  const alerts = await Alert.find().lean();
  const transactions = await Transaction.find().lean();
  const audits = await Audit.find().lean();

  const rmEmailById = new Map(rms.map((rm) => [String(rm._id), rm.email]));
  const customerEmailById = new Map(customers.map((c) => [String(c._id), c.email]));

  const payload = {
    rms: rms.map((rm) => stripDocMeta(rm)),
    customers: customers.map((c) => {
      const clean = stripDocMeta(c);
      clean.rmEmail = rmEmailById.get(String(c.rm));
      delete clean.rm;
      return clean;
    }),
    alerts: alerts.map((a) => {
      const clean = stripDocMeta(a);
      clean.rmEmail = a.rm ? rmEmailById.get(String(a.rm)) : undefined;
      clean.customerEmail = a.customer ? customerEmailById.get(String(a.customer)) : undefined;
      delete clean.rm;
      delete clean.customer;
      return clean;
    }),
    transactions: transactions.map((t) => {
      const clean = stripDocMeta(t);
      clean.rmEmail = t.rm ? rmEmailById.get(String(t.rm)) : undefined;
      clean.customerEmail = t.customer ? customerEmailById.get(String(t.customer)) : undefined;
      delete clean.rm;
      delete clean.customer;
      return clean;
    }),
    audits: audits.map((a) => {
      const clean = stripDocMeta(a);
      clean.rmEmail = a.rm ? rmEmailById.get(String(a.rm)) : undefined;
      clean.customerEmail = a.customer ? customerEmailById.get(String(a.customer)) : undefined;
      delete clean.rm;
      delete clean.customer;
      return clean;
    }),
  };

  await mongoose.connection.collection('seed_data').updateOne(
    { name: datasetName },
    {
      $set: {
        name: datasetName,
        payload,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log(
    `✓ Exported seed_data '${datasetName}': ${payload.rms.length} RMs, ${payload.customers.length} customers, ${payload.alerts.length} alerts, ${payload.transactions.length} transactions, ${payload.audits.length} audits`
  );

  await mongoose.disconnect();
}

if (require.main === module) {
  exportSeedData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { exportSeedData };
