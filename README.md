# FinHealth AI 


> AI-powered personal finance & health insights platform built with Next.js 14, Prisma, and GROQ.

<!-- **Live Demo:** [finhealth-ai.vercel.app](https://finhealth-ai.vercel.app)
**Demo login:** `demo@finhealth.app` / `Demo1234!` -->

---

## What it does

The idea behind this project was to combine finance and health data in one place and generate useful insights from both. For example, users can track spending, sleep, mood, water intake, and budgets, then get AI-generated observations based on their habits.


### Key Features
- **Role-based auth** — User / Premium / Admin roles via NextAuth.js
- **Finance tracking** — Log transactions, set budgets by category, track spending trends
- **Health logging** — Daily steps, sleep, water, mood, weight with 30-day charts
- **Real-time alerts** — SSE-powered budget warnings and goal milestone notifications
- **AI insights** — GROQ analyzes your combined finance + health data with streaming responses
- **Admin panel** — Usage stats, user management (admin role only)

---

## Tech Stack 


| Layer          | Technology                       |
|----------------|---------------------------------|
| Frontend + API | Next.js 14 App Router            |
| Database       | PostgreSQL via Neon             |
| ORM            | Prisma                          |
| Auth           | NextAuth.js                     |
| AI             | GROQ Model llama-3.1-8b-instant|
| Styling        | Tailwind CSS                    |
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

### 3. Get GROQ_API_KEY API key (free)
1. Go to [aistudio.google.com/app/apikey](https://console.groq.com/keys)
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
GROQ_API_KEY="your-groq-key"
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

## Database Models

```txt
User
 ├── Transactions
 ├── HealthLogs
 ├── Budgets
 ├── Goals
 ├── AiInsights
 └── Alerts
```

---

