// prisma/seed.ts
import { PrismaClient, Role, TransactionType, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.aiInsight.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.healthLog.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany({
    where: { email: { in: ["demo@finhealth.app", "admin@finhealth.app"] } },
  });

  const hashedPassword = await bcrypt.hash("Demo1234!", 10);

  const user = await prisma.user.create({
    data: {
      name: "Ali Hassan",
      email: "demo@finhealth.app",
      password: hashedPassword,
      role: Role.PREMIUM,
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@finhealth.app",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgets = [
    { category: Category.FOOD,          limit: 15000 },
    { category: Category.TRANSPORT,     limit: 5000  },
    { category: Category.ENTERTAINMENT, limit: 4000  },
    { category: Category.SHOPPING,      limit: 8000  },
    { category: Category.HEALTH,        limit: 3000  },
  ];
  for (const b of budgets) {
    await prisma.budget.create({ data: { userId: user.id, month, year, ...b } });
  }

  const transactions = [
    { type: TransactionType.INCOME,  category: Category.OTHER,         amount: 80000, note: "Monthly salary",         daysAgo: 30 },
    { type: TransactionType.INCOME,  category: Category.OTHER,         amount: 5000,  note: "Freelance project",       daysAgo: 15 },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 850,   note: "Grocery run",             daysAgo: 2  },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 1200,  note: "Restaurant dinner",       daysAgo: 4  },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 450,   note: "Lunch delivery",          daysAgo: 6  },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 3200,  note: "Weekly groceries",        daysAgo: 8  },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 600,   note: "Snacks & drinks",         daysAgo: 10 },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 2800,  note: "Family dinner out",       daysAgo: 12 },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 900,   note: "Lunch x3",                daysAgo: 14 },
    { type: TransactionType.EXPENSE, category: Category.FOOD,          amount: 1500,  note: "Grocery run",             daysAgo: 20 },
    { type: TransactionType.EXPENSE, category: Category.TRANSPORT,     amount: 500,   note: "Uber rides",              daysAgo: 3  },
    { type: TransactionType.EXPENSE, category: Category.TRANSPORT,     amount: 1200,  note: "Petrol",                  daysAgo: 10 },
    { type: TransactionType.EXPENSE, category: Category.TRANSPORT,     amount: 300,   note: "Rickshaw",                daysAgo: 18 },
    { type: TransactionType.EXPENSE, category: Category.HOUSING,       amount: 25000, note: "Monthly rent",            daysAgo: 28 },
    { type: TransactionType.EXPENSE, category: Category.HOUSING,       amount: 800,   note: "Electricity bill",        daysAgo: 15 },
    { type: TransactionType.EXPENSE, category: Category.ENTERTAINMENT, amount: 1500,  note: "Netflix + Spotify",       daysAgo: 5  },
    { type: TransactionType.EXPENSE, category: Category.ENTERTAINMENT, amount: 2200,  note: "Cinema + outing",         daysAgo: 9  },
    { type: TransactionType.EXPENSE, category: Category.ENTERTAINMENT, amount: 800,   note: "Books",                   daysAgo: 22 },
    { type: TransactionType.EXPENSE, category: Category.SHOPPING,      amount: 4500,  note: "Clothes",                 daysAgo: 7  },
    { type: TransactionType.EXPENSE, category: Category.SHOPPING,      amount: 2100,  note: "Home items",              daysAgo: 19 },
    { type: TransactionType.EXPENSE, category: Category.HEALTH,        amount: 1200,  note: "Gym membership",          daysAgo: 30 },
    { type: TransactionType.EXPENSE, category: Category.HEALTH,        amount: 600,   note: "Pharmacy",                daysAgo: 11 },
    { type: TransactionType.EXPENSE, category: Category.SAVINGS,       amount: 10000, note: "Monthly savings transfer",daysAgo: 29 },
  ];

  for (const t of transactions) {
    const date = new Date();
    date.setDate(date.getDate() - t.daysAgo);
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        note: t.note,
        date,
      },
    });
  }

  // Fix: destructure daysAgo out so it is NOT passed to prisma
  const healthData = [
    { daysAgo: 0,  steps: 7200,  sleepHrs: 7.5, waterL: 2.0, mood: 4, weight: 72.0 },
    { daysAgo: 1,  steps: 4100,  sleepHrs: 5.5, waterL: 1.2, mood: 2, weight: 72.1 },
    { daysAgo: 2,  steps: 8900,  sleepHrs: 8.0, waterL: 2.5, mood: 5, weight: 71.9 },
    { daysAgo: 3,  steps: 6300,  sleepHrs: 6.0, waterL: 1.8, mood: 3, weight: 72.0 },
    { daysAgo: 4,  steps: 3800,  sleepHrs: 5.0, waterL: 1.0, mood: 2, weight: 72.2 },
    { daysAgo: 5,  steps: 9100,  sleepHrs: 7.5, waterL: 2.2, mood: 4, weight: 71.8 },
    { daysAgo: 6,  steps: 10200, sleepHrs: 8.5, waterL: 3.0, mood: 5, weight: 71.7 },
    { daysAgo: 7,  steps: 5500,  sleepHrs: 6.5, waterL: 1.5, mood: 3, weight: 71.9 },
    { daysAgo: 8,  steps: 7800,  sleepHrs: 7.0, waterL: 2.0, mood: 4, weight: 72.0 },
    { daysAgo: 9,  steps: 4200,  sleepHrs: 5.5, waterL: 1.2, mood: 2, weight: 72.1 },
    { daysAgo: 10, steps: 8600,  sleepHrs: 8.0, waterL: 2.8, mood: 5, weight: 71.8 },
    { daysAgo: 11, steps: 6100,  sleepHrs: 6.5, waterL: 1.7, mood: 3, weight: 72.0 },
    { daysAgo: 12, steps: 9300,  sleepHrs: 7.5, waterL: 2.3, mood: 4, weight: 71.9 },
    { daysAgo: 13, steps: 7000,  sleepHrs: 7.0, waterL: 2.0, mood: 4, weight: 72.0 },
  ];

  for (const { daysAgo, ...fields } of healthData) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    await prisma.healthLog.create({
      data: { userId: user.id, date, ...fields },
    });
  }

  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: "Daily 8k steps",     type: "health",  target: 8000,  current: 7200, unit: "steps",  description: "Walk 8,000 steps every day" },
      { userId: user.id, title: "Save PKR 50k",        type: "finance", target: 50000, current: 10000,unit: "PKR",    description: "Build emergency fund" },
      { userId: user.id, title: "Drink 2L water/day",  type: "health",  target: 2.0,   current: 1.8,  unit: "litres", description: "Stay hydrated" },
      { userId: user.id, title: "Sleep 7+ hrs/night",  type: "health",  target: 7.0,   current: 7.5,  unit: "hours",  description: "Improve sleep quality", achieved: true },
    ],
  });

  await prisma.alert.createMany({
    data: [
      { userId: user.id, type: "budget_warning", message: "You've used 87% of your Food budget this month!" },
      { userId: user.id, type: "goal_achieved",  message: "🎉 You hit your Sleep 7+ hrs goal — 3 day streak!" },
      { userId: user.id, type: "health_streak",  message: "5-day step streak! Keep going." },
    ],
  });

  await prisma.aiInsight.create({
    data: {
      userId: user.id,
      type: "combined",
      prompt: "Analyze my last 30 days of finance and health data",
      response: `## Your FinHealth Summary 🔍\n\n**Finance:** Your total spending this month is ₨58,950 against an income of ₨85,000 — a healthy 31% savings rate.\n\n**Health:** On days when you sleep under 6 hours, your food spending averages ₨1,800 higher. This may indicate stress eating.\n\n**Recommendations:**\n1. Set a hard Food budget alert at 80%\n2. Aim for consistent 7.5hr sleep\n3. Consider automating ₨10k/month to savings`,
    },
  });

  console.log("✅ Seed complete!");
  console.log("   Demo  → demo@finhealth.app  / Demo1234!");
  console.log("   Admin → admin@finhealth.app / Demo1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
