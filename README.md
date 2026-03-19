# WealthOS — Edelweiss Intelligence Platform

AI-native wealth management platform for Relationship Managers.

## Stack
- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (in-memory via `mongodb-memory-server` — zero setup)
- **Auth:** JWT (12h expiry)

## Quick start

### 1. Install dependencies
```bash
# From project root
cd server && npm install
cd ../client && npm install
```

### 2. Start the API server
```bash
cd server
npm start
# ✓ MongoDB in-memory running
# ✓ Seeded: 2 RMs, 6 customers, 7 alerts, 4 transactions
# ✓ WealthOS API on http://localhost:4000
```

### 3. Start the React app (new terminal)
```bash
cd client
npm start
# Opens http://localhost:3000
```

## Production environment variables

### Server (`server`)
- `NODE_ENV=production`
- `PORT=4000` (optional on Render; platform usually sets this)
- `JWT_SECRET=<strong-random-secret>`
- `MONGODB_URI=<your-mongodb-atlas-uri>`
- `CORS_ORIGIN=<your-vercel-url>` (for multiple: comma-separated)

### Client (`client`)
- `REACT_APP_API_URL=<your-render-backend-url>`

## Login credentials
| Email | Password | Role |
|-------|----------|------|
| rahul.mehta@edelweiss.in | password123 | Senior RM |
| anita.kulkarni@edelweiss.in | password123 | Branch Head |

## Seed data
6 customers with full portfolio data:
- **Priya Sharma** — ₹4.2 Cr, Aggressive, 3 goals, rate cut opportunity
- **Vikram Nair** — ₹1.4 Cr, Moderate, churn risk, KYC expiring
- **Arjun Kapoor** — ₹2.8 Cr, Moderate, salary increment, SIP opportunity
- **Ritu Desai** — ₹1.9 Cr, Moderate, ELSS expiry in 14 days
- **Sunita Malhotra** — ₹1.1 Cr, Conservative, stable
- **Kavita Rao** — ₹2.3 Cr, Moderate, Priya referral

## API endpoints
```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/rm/dashboard
GET    /api/rm/book-summary
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
POST   /api/customers/:id/comm-log
GET    /api/alerts
PATCH  /api/alerts/:id/read
PATCH  /api/alerts/read-all
POST   /api/simulator/run
GET    /api/transactions
POST   /api/transactions
POST   /api/ai/ask           (customer-specific questions)
POST   /api/ai/chat          (book-level chat)
GET    /api/audit
GET    /api/health
```

## Project structure
```
wealthos/
├── server/
│   └── src/
│       ├── index.js          — Express app + MongoDB startup
│       ├── seed.js           — Full seed data
│       ├── models/index.js   — Mongoose schemas
│       ├── middleware/
│       │   ├── auth.js       — JWT middleware
│       │   └── audit.js      — Audit log helper
│       └── routes/
│           ├── auth.js
│           ├── rm.js
│           ├── customers.js
│           ├── alerts.js
│           ├── simulator.js
│           ├── transactions.js
│           ├── ai.js
│           └── audit.js
└── client/
    └── src/
        ├── App.jsx           — Router
        ├── index.css         — Design system
        ├── context/AuthContext.jsx
        ├── hooks/useFetch.js
        ├── services/api.js
        ├── components/
        │   ├── AppShell.jsx  — Sidebar + topbar
        │   ├── AskBox.jsx    — AI question component
        │   └── UI.jsx        — Shared components
        └── pages/
            ├── Login.jsx
            ├── Today.jsx
            ├── Customers.jsx
            ├── CustomerDetail.jsx
            ├── Alerts.jsx
            ├── Simulator.jsx
            ├── Chat.jsx
            ├── Transactions.jsx
            ├── AddCustomer.jsx
            ├── Audit.jsx
            └── Other.jsx
```
