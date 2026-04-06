# EcoLink AI — Full Stack

React + Node.js + MongoDB · AI-powered industrial waste exchange platform.

## Stack
- **Frontend**: React 18, Vite, React Router, Chart.js, react-hot-toast, lucide-react
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs
- **Database**: MongoDB

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 2. Server setup
```bash
cd server
cp .env.example .env        # edit MONGO_URI and JWT_SECRET
npm install
npm run seed                # seed demo data
npm run dev                 # starts on :5000
```

### 3. Client setup
```bash
cd client
npm install
npm run dev                 # starts on :5173
```

Open http://localhost:5173

## Demo Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| 🏭 Producer | producer@ecolink.ai | producer123 |
| 🛒 Consumer | consumer@ecolink.ai | consumer123 |
| 🛡️ Admin | admin@ecolink.ai | admin123 |

## User Flows

### Waste Producer
1. Sign up → select "Waste Producer"
2. Dashboard → click "+ New Listing"
3. Fill form → AI auto-suggests uses & market rate
4. Listing goes to admin moderation queue
5. Once approved → AI matches consumers automatically
6. Chat → negotiate → accept deal → track analytics

### Waste Consumer
1. Sign up → select "Waste Consumer"
2. Dashboard → click "Run AI Matching"
3. AI scans all listings for your industry
4. View recommendations → send deal request
5. Chat with producer → negotiate → accept

### Admin
1. Sign in as admin
2. Verify Companies → approve/reject registrations
3. Moderation → approve/reject listings
4. Disputes → resolve conflicts
5. Transactions → monitor all deals

## API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/listings          (public browse)
GET    /api/listings/my       (producer's own)
POST   /api/listings          (create)
PATCH  /api/listings/:id
DELETE /api/listings/:id

GET    /api/matches/producer
GET    /api/matches/consumer
POST   /api/matches/run       (trigger AI matching)

GET    /api/deals
GET    /api/deals/:id
POST   /api/deals
POST   /api/deals/:id/message
PATCH  /api/deals/:id/accept
PATCH  /api/deals/:id/reject
POST   /api/deals/:id/rate

GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id/verify
GET    /api/admin/listings
PATCH  /api/admin/listings/:id/moderate
GET    /api/admin/disputes
PATCH  /api/admin/disputes/:id
GET    /api/admin/transactions

POST   /api/ai/classify
POST   /api/ai/impact
```
