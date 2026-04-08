# FinHealth AI 🌿

> AI-powered personal finance & health insights platform built with Next.js 14, Prisma, and Google Gemini.

**Live Demo:** [finhealth-ai.vercel.app](https://finhealth-ai.vercel.app)
**Demo login:** `demo@finhealth.app` / `Demo1234!`

---

## What it does

Most people can't afford a financial advisor or health coach. FinHealth AI gives everyone
personalized, AI-driven insights about their spending habits AND health data — and finds
the hidden connections between the two (e.g. "You spend 40% more on food on days when
you sleep under 6 hours").

### Key Features
- **Role-based auth** — User / Premium / Admin roles via NextAuth.js
- **Finance tracking** — Log transactions, set budgets by category, track spending trends
- **Health logging** — Daily steps, sleep, water, mood, weight with 30-day charts
- **Real-time alerts** — SSE-powered budget warnings and goal milestone notifications
- **AI insights** — Google Gemini analyzes your combined finance + health data with streaming responses
- **Admin panel** — Usage stats, user management (admin role only)

---

## Tech Stack (100% free)

| Layer | Technology | Cost |
|---|---|---|
| Frontend + API | Next.js 14 App Router | Free |
| Database | PostgreSQL via Neon | Free (0.5 GB) |
| ORM | Prisma | Free |
| Auth | NextAuth.js | Free |
| AI | Google Gemini 1.5 Flash | Free (1500 req/day) |
| Styling | Tailwind CSS | Free |
| Hosting | Vercel Hobby | Free |

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar nav, auth guard
│   │   ├── page.tsx            # Overview with stats
│   │   ├── finance/page.tsx    # Transactions + budgets
│   │   ├── health/page.tsx     # Health logs + charts
│   │   ├── ai/page.tsx         # AI chat with streaming
│   │   ├── goals/page.tsx      # Goals tracker
│   │   ├── alerts/page.tsx     # Real-time alerts
│   │   └── admin/page.tsx      # Admin panel (role-gated)
│   └── api/
│       ├── auth/               # NextAuth + register
│       ├── transactions/       # CRUD routes
│       ├── health/             # Health log routes
│       ├── ai/route.ts         # Streaming AI endpoint
│       └── alerts/sse/route.ts # Server-Sent Events
├── components/
│   ├── ui/                     # Button, Input, Card, etc.
│   ├── dashboard/              # SideNav, StatCard
│   ├── finance/                # TransactionForm, BudgetBar
│   ├── health/                 # HealthForm, TrendChart
│   └── ai/                     # AIChat, StreamingResponse
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── auth.ts                 # NextAuth config
│   ├── auth-helpers.ts         # requireAuth, requireAdmin
│   └── gemini.ts               # Gemini AI wrapper
└── types/
    └── next-auth.d.ts          # Extended session types
prisma/
├── schema.prisma               # Full data model
└── seed.ts                     # Demo data
```

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/finhealth-ai.git
cd finhealth-ai
npm install
```

### 2. Set up Neon database (free)
1. Go to [neon.tech](https://neon.tech) → sign up free
2. Create a new project
3. Copy the **connection string** (looks like `postgresql://...`)

### 3. Get Gemini API key (free)
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key

### 4. Configure environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
```env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-key"
```

### 5. Set up database
```bash
npm run db:push      # Push schema to Neon
npm run db:seed      # Add demo data
```

### 6. Run the app
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

**Login with:** `demo@finhealth.app` / `Demo1234!`

---

## Deploying to Vercel (free)

```bash
npm i -g vercel
vercel
```

Add environment variables in the Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → your Vercel URL
- `GEMINI_API_KEY`

---

## Data Models

```
User ──< Transaction   (finance entries)
User ──< HealthLog     (daily health metrics)
User ──< Budget        (monthly spending limits by category)
User ──< Goal          (health + finance goals with progress)
User ──< AiInsight     (AI conversation history)
User ──< Alert         (real-time notifications)
```

---

## 10-Day Build Plan

| Day | Focus |
|---|---|
| 1–2 | ✅ Project scaffold, Prisma schema, NextAuth, seed data |
| 3–4 | Finance module — transactions, budgets, real-time alerts |
| 5–6 | Health module — logs, charts, goal tracking |
| 7–8 | AI module — Gemini streaming, combined insights |
| 9–10 | Polish, admin panel, README, deploy |

---

## License
MIT
