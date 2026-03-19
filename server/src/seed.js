const bcrypt = require('bcryptjs');
const { RM, Customer, Alert, Transaction, Audit } = require('./models');

module.exports = async function seed() {
  // Idempotent
  if (await RM.countDocuments() > 0) {
    console.log('✓ DB already seeded');
    return;
  }

  console.log('⏳ Seeding database…');

  // ── RMs ──────────────────────────────────────────────────
  const pw = await bcrypt.hash('password123', 10);
  const rm = await RM.create({
    name: 'Rahul Mehta',
    email: 'rahul.mehta@edelweiss.in',
    password: pw,
    employeeId: 'EW-1042',
    branch: 'Mumbai West',
    role: 'rm',
    target: 865,
    certifications: [
      { product: 'Mutual Funds (AMFI)', expiry: new Date('2027-01-15'), certified: true },
      { product: 'PMS Distribution',    expiry: new Date('2026-08-20'), certified: true },
      { product: 'AIF Category II',     expiry: new Date('2026-04-10'), certified: true },
      { product: 'Derivatives',         expiry: null,                   certified: false },
    ],
  });

  await RM.create({
    name: 'Anita Kulkarni',
    email: 'anita.kulkarni@edelweiss.in',
    password: pw,
    employeeId: 'EW-1018',
    branch: 'Mumbai West',
    role: 'branch_head',
    target: 1200,
  });

  // ── Customers ────────────────────────────────────────────
  const customers = await Customer.create([
    {
      rm: rm._id,
      name: 'Priya Sharma',
      pan: 'ABCDE1234F',
      mobile: '9820011234',
      email: 'priya.sharma@email.com',
      dob: new Date('1978-03-14'),
      city: 'Mumbai',
      riskProfile: 'aggressive',
      aum: 4.2,
      xirr: 18.4,
      drift: 1.2,
      status: 'review',
      churnScore: 12,
      daysSinceContact: 28,
      targetAllocation:  { largeCap:35, midSmall:15, debt:30, gold:10, cash:10 },
      currentAllocation: { largeCap:42, midSmall:18, debt:22, gold:10, cash:8 },
      goals: [
        { type:'retirement', name:'Retirement corpus', targetAmount:32000000, targetYear:2041, savedAmount:19800000, monthlySIP:42000, inflation:6.5, status:'on_track', pctFunded:62 },
        { type:'education',  name:"Child's education",  targetAmount:8000000,  targetYear:2032, savedAmount:3500000,  monthlySIP:22000, inflation:8,   status:'on_track', pctFunded:44 },
        { type:'home',       name:'Vacation home',      targetAmount:5000000,  targetYear:2036, savedAmount:800000,   monthlySIP:8000,  inflation:6,   status:'at_risk',  pctFunded:16 },
      ],
      holdings: [
        { fund:'Parag Parikh Flexi Cap',     category:'Flexi Cap',     amountLakh:88,  portfolioPct:12.4, xirr3Y:28.4, benchmark3Y:22.1, units:2840, nav:309.5 },
        { fund:'HDFC Mid Cap Opportunities', category:'Mid Cap',       amountLakh:76,  portfolioPct:10.8, xirr3Y:32.1, benchmark3Y:28.3, units:1102, nav:689.4 },
        { fund:'HDFC Short Duration Fund',   category:'Short Duration', amountLakh:54, portfolioPct:7.7,  xirr3Y:7.8,  benchmark3Y:8.2,  units:18400, nav:29.3 },
        { fund:'SBI Gilt Fund',              category:'Gilt',           amountLakh:38,  portfolioPct:5.4,  xirr3Y:8.2,  benchmark3Y:7.9,  units:9200,  nav:41.3 },
        { fund:'Mirae Asset Large Cap',      category:'Large Cap',      amountLakh:66,  portfolioPct:9.4,  xirr3Y:21.3, benchmark3Y:19.8, units:3200,  nav:206.2 },
        { fund:'Axis Small Cap Fund',        category:'Small Cap',      amountLakh:40,  portfolioPct:5.7,  xirr3Y:35.2, benchmark3Y:30.1, units:880,   nav:454.5 },
      ],
      sips: [
        { fund:'PPFAS Flexi Cap',     amount:22000, date:1,  mandate:'NACH-HDFC-3821', active:true, startDate:new Date('2021-04-01') },
        { fund:'HDFC Mid Cap',        amount:12000, date:5,  mandate:'NACH-HDFC-3821', active:true, startDate:new Date('2022-01-05') },
        { fund:'HDFC Short Duration', amount:8000,  date:10, mandate:'NACH-HDFC-3821', active:true, startDate:new Date('2022-06-10') },
      ],
      commLog: [
        { date:new Date('2026-02-17'), type:'call',    note:'SIP increase discussion. Agreed to raise by ₹10k/mo from April.', rmName:'Rahul Mehta' },
        { date:new Date('2026-01-02'), type:'meeting', note:'Portfolio review. Q4 performance shared. Happy with returns.',     rmName:'Rahul Mehta' },
        { date:new Date('2025-11-28'), type:'email',   note:'Year-end tax planning document sent.',                             rmName:'Rahul Mehta' },
        { date:new Date('2025-10-14'), type:'system',  note:'Market drawdown advisory auto-sent.',                             rmName:'System' },
      ],
      kyc: { status:'verified', expiry:new Date('2027-03-14'), fatca:true, mandate:'active', suitabilityDate:new Date('2026-01-15') },
      briefAI: "Last call 28 days ago — she mentioned her daughter's school fees increase in April. Ask about it before business. Portfolio up 18.4% XIRR, ahead of Nifty by 3.2% — lead with this win. She opens up when she hears good news first. RBI cut rates today — her debt sleeve benefits immediately.",
    },

    {
      rm: rm._id,
      name: 'Vikram Nair',
      pan: 'QRSTU3456V',
      mobile: '9833056789',
      email: 'vikram.nair@email.com',
      dob: new Date('1972-08-22'),
      city: 'Mumbai',
      riskProfile: 'moderate',
      aum: 1.4,
      xirr: 3.2,
      drift: 11.4,
      status: 'at_risk',
      churnScore: 82,
      daysSinceContact: 42,
      targetAllocation:  { largeCap:30, midSmall:10, debt:40, gold:10, cash:10 },
      currentAllocation: { largeCap:42, midSmall:23, debt:28, gold:7,  cash:0 },
      goals: [
        { type:'retirement', name:'Retirement corpus', targetAmount:20000000, targetYear:2038, savedAmount:3600000, monthlySIP:25000, inflation:6.5, status:'off_track', pctFunded:18 },
        { type:'home',       name:'Second home',       targetAmount:10000000, targetYear:2030, savedAmount:1200000, monthlySIP:8000,  inflation:6,   status:'at_risk',  pctFunded:12 },
        { type:'education',  name:"Son's MBA abroad",  targetAmount:6000000,  targetYear:2029, savedAmount:400000,  monthlySIP:5000,  inflation:8,   status:'off_track', pctFunded:7 },
      ],
      holdings: [
        { fund:'HDFC Flexi Cap Fund',       category:'Flexi Cap', amountLakh:42, portfolioPct:30, xirr3Y:16.2, benchmark3Y:18.4, units:980,  nav:428.6 },
        { fund:'Axis Bluechip Fund',        category:'Large Cap', amountLakh:30, portfolioPct:21.4, xirr3Y:14.8, benchmark3Y:17.2, units:620, nav:483.9 },
        { fund:'ICICI Pru Short Term Bond', category:'Short Duration', amountLakh:28, portfolioPct:20, xirr3Y:7.4, benchmark3Y:8.0, units:8800, nav:31.8 },
        { fund:'HDFC Gold ETF',             category:'Gold', amountLakh:10, portfolioPct:7.1, xirr3Y:16.2, benchmark3Y:15.8, units:120, nav:83.4 },
      ],
      sips: [
        { fund:'HDFC Flexi Cap',      amount:25000, date:1,  mandate:'NACH-ICICI-7744', active:false, startDate:new Date('2020-06-01') },
        { fund:'Axis Bluechip',       amount:8000,  date:15, mandate:'NACH-ICICI-7744', active:true,  startDate:new Date('2021-03-15') },
      ],
      commLog: [
        { date:new Date('2026-02-05'), type:'call',  note:'Missed call. Left voicemail about FD maturity.', rmName:'Rahul Mehta' },
        { date:new Date('2026-01-10'), type:'email', note:'Q3 portfolio statement sent. No response.',      rmName:'Rahul Mehta' },
        { date:new Date('2025-11-12'), type:'call',  note:'FD maturity discussed. He said he\'ll think about it.', rmName:'Rahul Mehta' },
      ],
      kyc: { status:'verified', expiry:new Date('2026-03-26'), fatca:true, mandate:'active', suitabilityDate:new Date('2025-06-20') },
      briefAI: "42 days no contact. KYC expiring in 7 days — urgent. Don't start with performance, he knows it's lagged. Start with his FD of ₹80L maturing this week — that's your entry point. Ask if he wants to reinvest or redirect. Show the simulation: ₹28L to large-cap closes his retirement gap by 3 years. If he pushes back say: 'You're right — here's exactly what I'm changing and why.'",
    },

    {
      rm: rm._id,
      name: 'Arjun Kapoor',
      pan: 'FGHIJ5678K',
      mobile: '9821078901',
      email: 'arjun.kapoor@email.com',
      dob: new Date('1984-11-05'),
      city: 'Mumbai',
      riskProfile: 'moderate',
      aum: 2.8,
      xirr: 21.1,
      drift: 5.8,
      status: 'active',
      churnScore: 18,
      daysSinceContact: 7,
      targetAllocation:  { largeCap:30, midSmall:20, debt:30, gold:10, cash:10 },
      currentAllocation: { largeCap:38, midSmall:22, debt:25, gold:10, cash:5 },
      goals: [
        { type:'home',       name:'Home purchase',    targetAmount:15000000, targetYear:2028, savedAmount:5700000,  monthlySIP:42000, inflation:6,   status:'at_risk',  pctFunded:38 },
        { type:'education',  name:"Daughter's school", targetAmount:3000000, targetYear:2030, savedAmount:800000,   monthlySIP:8000,  inflation:8,   status:'on_track', pctFunded:27 },
        { type:'retirement', name:'Retirement corpus', targetAmount:25000000, targetYear:2044, savedAmount:4200000, monthlySIP:12000, inflation:6.5, status:'on_track', pctFunded:17 },
      ],
      holdings: [
        { fund:'PPFAS Flexi Cap',            category:'Flexi Cap', amountLakh:72, portfolioPct:25.7, xirr3Y:28.4, benchmark3Y:22.1, units:2328, nav:309.5 },
        { fund:'Mirae Asset Large Cap',      category:'Large Cap', amountLakh:48, portfolioPct:17.1, xirr3Y:21.3, benchmark3Y:19.8, units:2326, nav:206.2 },
        { fund:'HDFC Mid Cap Opportunities', category:'Mid Cap',   amountLakh:46, portfolioPct:16.4, xirr3Y:32.1, benchmark3Y:28.3, units:667,  nav:689.4 },
        { fund:'ICICI Pru BAF',              category:'Balanced Advantage', amountLakh:40, portfolioPct:14.3, xirr3Y:14.2, benchmark3Y:13.8, units:2940, nav:136.1 },
        { fund:'HDFC Short Duration Fund',   category:'Short Duration', amountLakh:30, portfolioPct:10.7, xirr3Y:7.8, benchmark3Y:8.2, units:10239, nav:29.3 },
      ],
      sips: [
        { fund:'PPFAS Flexi Cap',  amount:22000, date:1,  mandate:'NACH-HDFC-6612', active:true, startDate:new Date('2022-03-01') },
        { fund:'Mirae Large Cap',  amount:12000, date:7,  mandate:'NACH-HDFC-6612', active:true, startDate:new Date('2022-07-07') },
        { fund:'HDFC Short Dur',   amount:8000,  date:15, mandate:'NACH-HDFC-6612', active:true, startDate:new Date('2023-01-15') },
      ],
      commLog: [
        { date:new Date('2026-03-12'), type:'call',  note:'Discussed Q4 performance. Mentioned salary increment, open to SIP increase.', rmName:'Rahul Mehta' },
        { date:new Date('2026-02-01'), type:'meeting', note:'Annual review. Home goal timeline discussed.', rmName:'Rahul Mehta' },
        { date:new Date('2025-12-18'), type:'whatsapp', note:'Shared year-end tax-saving tips.', rmName:'Rahul Mehta' },
      ],
      kyc: { status:'verified', expiry:new Date('2027-11-05'), fatca:true, mandate:'active', suitabilityDate:new Date('2026-02-01') },
      briefAI: "Salary increment confirmed today. Lead with the home goal payoff: increasing SIP from ₹42k to ₹60k moves his 2028 home purchase to March 2027 — a full year earlier. Split the increase: ₹10k to PPFAS Flexi Cap (growth), ₹8k to HDFC Short Duration (home goal liquidity). Close with: 'I can set this up in 2 minutes right now' — don't leave without a commitment.",
    },

    {
      rm: rm._id,
      name: 'Ritu Desai',
      pan: 'KLMNO9012P',
      mobile: '9867034567',
      email: 'ritu.desai@email.com',
      dob: new Date('1980-06-18'),
      city: 'Mumbai',
      riskProfile: 'moderate',
      aum: 1.9,
      xirr: 14.7,
      drift: 0.4,
      status: 'action_due',
      churnScore: 22,
      daysSinceContact: 3,
      targetAllocation:  { largeCap:30, midSmall:10, debt:40, gold:10, cash:10 },
      currentAllocation: { largeCap:31, midSmall:11, debt:39, gold:10, cash:9 },
      goals: [
        { type:'retirement', name:'Retirement corpus', targetAmount:20000000, targetYear:2040, savedAmount:7200000, monthlySIP:32000, inflation:6.5, status:'on_track', pctFunded:36 },
        { type:'education',  name:"Twin daughters' college", targetAmount:6000000, targetYear:2033, savedAmount:1800000, monthlySIP:12000, inflation:8, status:'on_track', pctFunded:30 },
      ],
      holdings: [
        { fund:'Axis Long Term Equity (ELSS)', category:'ELSS', amountLakh:11, portfolioPct:5.8, xirr3Y:18.4, benchmark3Y:19.1, units:440, nav:250.0 },
        { fund:'Mirae Asset Large Cap',        category:'Large Cap', amountLakh:38, portfolioPct:20, xirr3Y:21.3, benchmark3Y:19.8, units:1842, nav:206.2 },
        { fund:'HDFC Corporate Bond Fund',     category:'Corporate Bond', amountLakh:52, portfolioPct:27.4, xirr3Y:8.4, benchmark3Y:8.1, units:22000, nav:23.6 },
        { fund:'SBI Short Duration Fund',      category:'Short Duration', amountLakh:28, portfolioPct:14.7, xirr3Y:7.6, benchmark3Y:8.0, units:11200, nav:25.0 },
      ],
      sips: [
        { fund:'Mirae Large Cap',    amount:20000, date:1,  mandate:'NACH-AXIS-2233', active:true, startDate:new Date('2021-09-01') },
        { fund:'HDFC Corp Bond',     amount:12000, date:10, mandate:'NACH-AXIS-2233', active:true, startDate:new Date('2022-02-10') },
      ],
      commLog: [
        { date:new Date('2026-03-16'), type:'call',    note:'Called to discuss ELSS expiry. She is considering reinvestment. Will decide by 25th.', rmName:'Rahul Mehta' },
        { date:new Date('2026-02-14'), type:'email',   note:'Valentine\'s Day tax tip mailer sent.', rmName:'Rahul Mehta' },
        { date:new Date('2026-01-05'), type:'meeting', note:'Q3 review done. Happy with debt returns.', rmName:'Rahul Mehta' },
      ],
      kyc: { status:'verified', expiry:new Date('2027-06-18'), fatca:true, mandate:'active', suitabilityDate:new Date('2025-12-10') },
      briefAI: "ELSS of ₹1.1L (Axis Long Term Equity) lock-in ends on March 28 — 9 days. Her tax liability this year is ₹18,400 — reinvesting saves the full amount. She said she'll decide by the 25th; call today to close it. Recommend same fund for continuity. If she wants to exit, redirect to PPFAS Flexi Cap for better long-term compounding post lock-in.",
    },

    {
      rm: rm._id,
      name: 'Sunita Malhotra',
      pan: 'VWXYZ7890A',
      mobile: '9820098765',
      email: 'sunita.malhotra@email.com',
      dob: new Date('1969-12-03'),
      city: 'Mumbai',
      riskProfile: 'conservative',
      aum: 1.1,
      xirr: 10.2,
      drift: 2.1,
      status: 'active',
      churnScore: 8,
      daysSinceContact: 14,
      targetAllocation:  { largeCap:20, midSmall:5, debt:55, gold:10, cash:10 },
      currentAllocation: { largeCap:22, midSmall:5, debt:52, gold:11, cash:10 },
      goals: [
        { type:'retirement', name:'Retirement corpus', targetAmount:15000000, targetYear:2034, savedAmount:8200000, monthlySIP:28000, inflation:6, status:'on_track', pctFunded:55 },
      ],
      holdings: [
        { fund:'SBI Short Duration Fund',     category:'Short Duration', amountLakh:28, portfolioPct:25.5, xirr3Y:7.6, benchmark3Y:8.0, units:11200, nav:25.0 },
        { fund:'HDFC Corporate Bond',         category:'Corporate Bond', amountLakh:24, portfolioPct:21.8, xirr3Y:8.4, benchmark3Y:8.1, units:10169, nav:23.6 },
        { fund:'Mirae Asset Large Cap',       category:'Large Cap', amountLakh:18, portfolioPct:16.4, xirr3Y:21.3, benchmark3Y:19.8, units:872,  nav:206.2 },
        { fund:'Mirae Asset Gold ETF',        category:'Gold', amountLakh:12, portfolioPct:10.9, xirr3Y:16.2, benchmark3Y:15.8, units:144, nav:83.4 },
        { fund:'Mirae ELSS',                  category:'ELSS', amountLakh:8, portfolioPct:7.3, xirr3Y:17.1, benchmark3Y:19.1, units:380, nav:210.5 },
      ],
      sips: [
        { fund:'SBI Short Duration', amount:18000, date:3,  mandate:'NACH-SBI-9901', active:true, startDate:new Date('2020-04-03') },
        { fund:'HDFC Corp Bond',     amount:10000, date:12, mandate:'NACH-SBI-9901', active:true, startDate:new Date('2021-08-12') },
      ],
      commLog: [
        { date:new Date('2026-03-05'), type:'call',    note:'Checked in. She is happy. Discussed RBI rate outlook.', rmName:'Rahul Mehta' },
        { date:new Date('2026-01-20'), type:'meeting', note:'Annual review. Conservative allocation confirmed.', rmName:'Rahul Mehta' },
      ],
      kyc: { status:'verified', expiry:new Date('2027-12-03'), fatca:true, mandate:'active', suitabilityDate:new Date('2026-01-20') },
      briefAI: "Sunita is your most stable customer — 14 days since contact, no urgency. Good time for a warm check-in call. Mirae ELSS lock-in expires April 5 — she should reinvest for FY27 80C savings. Rate cut today makes her short-duration funds attractive — mention the NAV uptick as good news. She responds well to stability-first messaging.",
    },

    {
      rm: rm._id,
      name: 'Kavita Rao',
      pan: 'BCDEX1111Y',
      mobile: '9867099001',
      email: 'kavita.rao@email.com',
      dob: new Date('1982-04-22'),
      city: 'Mumbai',
      riskProfile: 'moderate',
      aum: 2.3,
      xirr: 16.8,
      drift: 3.2,
      status: 'active',
      churnScore: 14,
      daysSinceContact: 10,
      targetAllocation:  { largeCap:30, midSmall:15, debt:35, gold:10, cash:10 },
      currentAllocation: { largeCap:33, midSmall:15, debt:32, gold:11, cash:9 },
      goals: [
        { type:'retirement', name:'Retirement corpus', targetAmount:25000000, targetYear:2042, savedAmount:6200000, monthlySIP:38000, inflation:6.5, status:'on_track', pctFunded:25 },
        { type:'home',       name:'Upgrade flat',      targetAmount:8000000,  targetYear:2029, savedAmount:2100000, monthlySIP:15000, inflation:6,   status:'at_risk',  pctFunded:26 },
      ],
      holdings: [
        { fund:'PPFAS Flexi Cap',       category:'Flexi Cap', amountLakh:58, portfolioPct:25.2, xirr3Y:28.4, benchmark3Y:22.1, units:1876, nav:309.5 },
        { fund:'Axis Bluechip',         category:'Large Cap', amountLakh:42, portfolioPct:18.3, xirr3Y:14.8, benchmark3Y:17.2, units:868,  nav:483.9 },
        { fund:'HDFC Short Duration',   category:'Short Duration', amountLakh:40, portfolioPct:17.4, xirr3Y:7.8, benchmark3Y:8.2, units:13652, nav:29.3 },
        { fund:'Nippon India Gold ETF', category:'Gold', amountLakh:25, portfolioPct:10.9, xirr3Y:16.5, benchmark3Y:15.8, units:300, nav:83.3 },
        { fund:'HDFC ELSS',             category:'ELSS', amountLakh:15, portfolioPct:6.5, xirr3Y:21.2, benchmark3Y:19.1, units:600, nav:250.0 },
      ],
      sips: [
        { fund:'PPFAS Flexi Cap',   amount:23000, date:1,  mandate:'NACH-ICICI-4456', active:true, startDate:new Date('2022-05-01') },
        { fund:'Axis Bluechip',     amount:10000, date:8,  mandate:'NACH-ICICI-4456', active:true, startDate:new Date('2022-10-08') },
        { fund:'HDFC Short Dur',    amount:5000,  date:20, mandate:'NACH-ICICI-4456', active:true, startDate:new Date('2023-04-20') },
      ],
      commLog: [
        { date:new Date('2026-03-09'), type:'call',    note:'Discussed flat upgrade goal. Needs more liquidity buffer.', rmName:'Rahul Mehta' },
        { date:new Date('2026-02-05'), type:'meeting', note:'HDFC ELSS lock-in expiry discussed. Reinvestment planned April 12.', rmName:'Rahul Mehta' },
      ],
      kyc: { status:'verified', expiry:new Date('2027-04-22'), fatca:true, mandate:'active', suitabilityDate:new Date('2026-01-10') },
      briefAI: "Referred by Priya Sharma — use that as social proof if needed. Her flat upgrade goal (₹80L by 2029) is at risk. She needs ₹15k/mo more SIP to get back on track. HDFC ELSS lock-in expires April 12 — reinvestment for FY27 80C savings. Receptive to data-driven recommendations, prefers WhatsApp updates over calls.",
    },
  ]);

  // ── Alerts ───────────────────────────────────────────────
  await Alert.create([
    {
      rm: rm._id,
      type: 'macro',
      urgency: 'urgent',
      title: 'RBI repo rate cut — 25 bps',
      detail: 'RBI reduced the repo rate by 25bps to 6.25% in the March 2026 policy meeting. Rate-sensitive debt funds expected to see NAV uptick.',
      aiScript: 'Today\'s rate cut benefits your bond portfolio — I wanted to share what it means for you specifically and look at extending duration to capture the next few cuts.',
      affectedCount: 38,
      read: false,
    },
    {
      rm: rm._id,
      customer: customers[1]._id, // Vikram
      type: 'compliance',
      urgency: 'urgent',
      title: 'Vikram Nair — KYC expires in 7 days',
      detail: 'KYC expiry: 26 March 2026. All transactions will be blocked after expiry until renewal is completed.',
      aiScript: 'Vikram, quick admin note — your KYC is due by end of month. I\'ll send you the DigiLocker link now — takes 4 minutes. Once done I have a rebalancing idea to share.',
      read: false,
    },
    {
      rm: rm._id,
      type: 'fund_change',
      urgency: 'review',
      title: 'Axis Bluechip — Fund manager change',
      detail: 'Axis Bluechip has appointed a new fund manager effective March 15. Previous manager had a 9-year track record at the fund.',
      aiScript: 'Axis Bluechip changed its fund manager — I wanted to tell you before you see it in the news. The new manager has a solid 8-year track record. I recommend we watch for 2 quarters.',
      affectedCount: 12,
      read: false,
    },
    {
      rm: rm._id,
      type: 'market',
      urgency: 'review',
      title: 'Nifty 50 — 8% drawdown in 30 days',
      detail: 'Nifty 50 has corrected 8.2% over the last 30 days, creating potential rebalancing opportunities for equity-heavy portfolios.',
      aiScript: 'Markets have corrected — I wanted to reach you before you see the news. Your SIP averaging means you\'re actually buying more units this month. I see a lump-sum opportunity here.',
      affectedCount: 6,
      read: false,
    },
    {
      rm: rm._id,
      customer: customers[0]._id, // Priya
      type: 'goal_gap',
      urgency: 'review',
      title: 'Priya Sharma — SIP below goal-required amount',
      detail: 'Priya\'s current SIP of ₹42,000/month is ₹8,000 below the amount needed to stay on track for her retirement goal by 2041.',
      aiScript: 'Your retirement goal needs a ₹8,000 boost to the monthly SIP to stay on track. Given today\'s market dip, this is a great time to increase — you\'ll be buying at lower NAVs.',
      read: false,
    },
    {
      rm: rm._id,
      type: 'product',
      urgency: 'review',
      title: '3 ELSS lock-ins expiring next month',
      detail: 'Customers Ritu Desai (Mar 28), Sunita Malhotra (Apr 5), and Kavita Rao (Apr 12) have ELSS funds expiring. All can save tax by reinvesting.',
      read: false,
    },
    {
      rm: rm._id,
      customer: customers[2]._id, // Arjun
      type: 'opportunity',
      urgency: 'opportunity',
      title: 'Arjun Kapoor — Salary increment confirmed',
      detail: 'Payroll signals indicate Arjun\'s salary increased by approximately ₹28,000/month net from March 2026. SIP capacity can increase from ₹42k to ₹60k/month.',
      aiScript: 'Arjun, congratulations on the increment — I\'ve already modelled what ₹18,000 more per month does to your home goal timeline. It moves it a full year earlier.',
      read: false,
    },
  ]);

  // ── Transactions ─────────────────────────────────────────
  await Transaction.create([
    {
      rm: rm._id, customer: customers[0]._id,
      type: 'sip_new', fund: 'PPFAS Flexi Cap',
      amount: 42000, sipDate: 1, mandate: 'NACH-HDFC-3821',
      status: 'confirmed',
      createdAt: new Date('2026-03-15'),
    },
    {
      rm: rm._id, customer: customers[2]._id,
      type: 'switch', fund: 'Axis Bluechip → HDFC Short Duration',
      amount: 320000, status: 'processing',
      createdAt: new Date('2026-03-18'),
    },
    {
      rm: rm._id, customer: customers[3]._id,
      type: 'lumpsum', fund: 'HDFC Corporate Bond',
      amount: 1000000, status: 'failed',
      note: 'Mandate debit failed — insufficient funds',
      createdAt: new Date('2026-03-17'),
    },
    {
      rm: rm._id, customer: customers[4]._id,
      type: 'sip_new', fund: 'SBI Short Duration',
      amount: 18000, sipDate: 3, mandate: 'NACH-SBI-9901',
      status: 'confirmed',
      createdAt: new Date('2026-03-10'),
    },
  ]);

  // ── Audit logs ────────────────────────────────────────────
  await Audit.create([
    { rm: rm._id, event: 'auth',   action: 'Sign in via SSO (Azure AD) · MacBook Pro',             ip: '10.8.22.41', device: 'MacBook Pro', createdAt: new Date('2026-03-19T09:41:22') },
    { rm: rm._id, customer: customers[0]._id, event: 'view', action: 'Viewed customer profile — Priya Sharma (C0041)', ip: '10.8.22.41', device: 'MacBook Pro', createdAt: new Date('2026-03-19T09:43:05') },
    { rm: rm._id, customer: customers[0]._id, event: 'data', action: 'Updated SIP amount — Priya Sharma · ₹42,000 → ₹52,000', ip: '10.8.22.41', before: { amount: 42000 }, after: { amount: 52000 }, createdAt: new Date('2026-03-19T09:48:31') },
    { rm: rm._id, customer: customers[2]._id, event: 'ai',   action: 'AI brief generated — Arjun Kapoor rebalancing',          ip: '10.8.22.41', createdAt: new Date('2026-03-19T10:02:14') },
    { rm: rm._id, customer: customers[2]._id, event: 'txn',  action: 'Switch placed · Arjun Kapoor · ₹3.2L Axis → HDFC ST Debt', ip: '10.8.22.41', createdAt: new Date('2026-03-19T10:15:47') },
  ]);

  console.log(`✓ Seeded: 2 RMs, ${customers.length} customers, 7 alerts, 4 transactions, 5 audit events`);
};
