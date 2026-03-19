const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── RM (Relationship Manager) ──────────────────────────────
const RMSchema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  branch:     { type: String, default: 'Mumbai West' },
  role:       { type: String, enum: ['rm', 'branch_head', 'compliance', 'admin'], default: 'rm' },
  target:     { type: Number, default: 1000 }, // Cr
  certifications: [{ product: String, expiry: Date, certified: Boolean }],
  createdAt:  { type: Date, default: Date.now },
});
RMSchema.methods.toSafeObject = function () {
  const o = this.toObject();
  delete o.password;
  return o;
};

// ── Customer ───────────────────────────────────────────────
const GoalSchema = new Schema({
  type:         { type: String, enum: ['retirement', 'education', 'home', 'wedding', 'custom'], required: true },
  name:         String,
  targetAmount: { type: Number, required: true },
  targetYear:   { type: Number, required: true },
  savedAmount:  { type: Number, default: 0 },
  monthlySIP:   { type: Number, default: 0 },
  inflation:    { type: Number, default: 6.5 },
  status:       { type: String, enum: ['on_track', 'at_risk', 'off_track'], default: 'on_track' },
  pctFunded:    { type: Number, default: 0 },
});

const AllocationSchema = new Schema({
  largeCap:  { type: Number, default: 0 },
  midSmall:  { type: Number, default: 0 },
  debt:      { type: Number, default: 0 },
  gold:      { type: Number, default: 0 },
  cash:      { type: Number, default: 0 },
  intl:      { type: Number, default: 0 },
});

const HoldingSchema = new Schema({
  fund:          String,
  category:      String,
  amountLakh:    Number,
  portfolioPct:  Number,
  xirr3Y:        Number,
  benchmark3Y:   Number,
  units:         Number,
  nav:           Number,
});

const SIPSchema = new Schema({
  fund:      String,
  amount:    Number,
  date:      Number, // day of month
  mandate:   String,
  active:    { type: Boolean, default: true },
  startDate: Date,
});

const CommLogSchema = new Schema({
  date:    { type: Date, default: Date.now },
  type:    { type: String, enum: ['call', 'meeting', 'email', 'whatsapp', 'system'] },
  note:    String,
  rmName:  String,
});

const CustomerSchema = new Schema({
  rm:           { type: Schema.Types.ObjectId, ref: 'RM', required: true },
  name:         { type: String, required: true },
  pan:          { type: String, required: true, uppercase: true },
  mobile:       String,
  email:        String,
  dob:          Date,
  city:         { type: String, default: 'Mumbai' },
  riskProfile:  { type: String, enum: ['conservative', 'moderate', 'aggressive'], default: 'moderate' },
  aum:          { type: Number, default: 0 },  // Crore
  xirr:         { type: Number, default: 0 },  // %
  drift:        { type: Number, default: 0 },  // %
  status:       { type: String, enum: ['active', 'review', 'at_risk', 'action_due', 'churned'], default: 'active' },
  churnScore:   { type: Number, default: 0, min: 0, max: 100 },
  daysSinceContact: { type: Number, default: 0 },
  targetAllocation: AllocationSchema,
  currentAllocation: AllocationSchema,
  goals:        [GoalSchema],
  holdings:     [HoldingSchema],
  sips:         [SIPSchema],
  commLog:      [CommLogSchema],
  kyc: {
    status:   { type: String, enum: ['verified', 'pending', 'expired'], default: 'verified' },
    expiry:   Date,
    fatca:    { type: Boolean, default: true },
    mandate:  { type: String, default: 'active' },
    suitabilityDate: Date,
  },
  briefAI: String,   // AI-generated pre-call brief
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
CustomerSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });

// ── Alert ──────────────────────────────────────────────────
const AlertSchema = new Schema({
  rm:         { type: Schema.Types.ObjectId, ref: 'RM' },
  customer:   { type: Schema.Types.ObjectId, ref: 'Customer' },
  type:       { type: String, enum: ['macro','compliance','fund_change','market','goal_gap','opportunity','product','churn'] },
  urgency:    { type: String, enum: ['urgent', 'review', 'opportunity', 'info'], default: 'info' },
  title:      String,
  detail:     String,
  aiScript:   String,   // AI suggested response/message
  affectedCount: Number,
  read:       { type: Boolean, default: false },
  dismissed:  { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
});

// ── Transaction ────────────────────────────────────────────
const TransactionSchema = new Schema({
  rm:         { type: Schema.Types.ObjectId, ref: 'RM' },
  customer:   { type: Schema.Types.ObjectId, ref: 'Customer' },
  type:       { type: String, enum: ['sip_new','sip_modify','sip_cancel','lumpsum','switch','stp','swp'] },
  fund:       String,
  amount:     Number,
  sipDate:    Number,
  mandate:    String,
  status:     { type: String, enum: ['pending','confirmed','processing','failed'], default: 'pending' },
  suitabilityPassed: { type: Boolean, default: true },
  note:       String,
  createdAt:  { type: Date, default: Date.now },
  confirmedAt: Date,
});

// ── Audit Log ──────────────────────────────────────────────
const AuditSchema = new Schema({
  rm:       { type: Schema.Types.ObjectId, ref: 'RM' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  event:    { type: String, enum: ['auth','view','data','txn','ai','report'] },
  action:   String,
  ip:       String,
  device:   String,
  before:   Schema.Types.Mixed,
  after:    Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  RM:          mongoose.model('RM', RMSchema),
  Customer:    mongoose.model('Customer', CustomerSchema),
  Alert:       mongoose.model('Alert', AlertSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema),
  Audit:       mongoose.model('Audit', AuditSchema),
};
