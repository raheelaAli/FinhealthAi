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

| Layer | Technology 
|---|---|npm
| Frontend + API | Next.js 14 App Router | 
| Database | PostgreSQL via Neon | 
| ORM | Prisma |
| Auth | NextAuth.js |
| AI | Google Gemini 1.5 Flash |
| Styling | Tailwind CSS | 
| Hosting | Vercel Hobby | 

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

