import type { Transaction, MonthlyStats, CategoryBudget, UserProfile, SavingsGoal, Badge } from '../types/finance.ts';

export const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Semilla Financiera',
  2: 'Explorador del Presupuesto',
  3: 'Guardián del Ahorro',
  4: 'Estratega del Capital',
  5: 'Cazador de Metas',
  6: 'Maestro de la Liquidez',
  7: 'Titán Financiero',
};

export const XP_PER_LEVEL = 300;

export function calculateLevelAndProgress(xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const currentLevelXp = xp % XP_PER_LEVEL;
  const nextLevelXp = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
  const title = LEVEL_TITLES[Math.min(7, level)] || 'Titán Financiero';

  return { level, title, currentLevelXp, nextLevelXp, progressPercent };
}

export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const name = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const CATEGORY_COLORS: Record<string, { color: string; icon: string }> = {
  'Alimentación': { color: '#38bdf8', icon: 'Utensils' },
  'Vivienda': { color: '#818cf8', icon: 'Home' },
  'Transporte': { color: '#fb923c', icon: 'Car' },
  'Ocio & Salidas': { color: '#f472b6', icon: 'PartyPopper' },
  'Salud & Bienestar': { color: '#34d399', icon: 'HeartPulse' },
  'Educación & Crecimiento': { color: '#a78bfa', icon: 'GraduationCap' },
  'Servicios & Suscripciones': { color: '#facc15', icon: 'Zap' },
  'Compras & Ropa': { color: '#fb7185', icon: 'ShoppingBag' },
  'Ahorro para Metas': { color: '#10b981', icon: 'PiggyBank' },
  'Inversiones': { color: '#06b6d4', icon: 'TrendingUp' },
  'Sueldo': { color: '#22c55e', icon: 'Briefcase' },
  'Ingresos Extra': { color: '#14b8a6', icon: 'Sparkles' },
  'Otros': { color: '#94a3b8', icon: 'HelpCircle' },
};

export function calculateMonthlyStats(
  transactions: Transaction[],
  yearMonth: string,
  budgets: CategoryBudget[]
): MonthlyStats {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(yearMonth));

  let income = 0;
  let expenses = 0;
  let savings = 0;

  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsTotal = 0;

  // Days in month
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailySpendingMap: Record<number, number> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dailySpendingMap[i] = 0;
  }

  const categorySpendingMap: Record<string, number> = {};

  for (const t of monthTransactions) {
    if (t.type === 'income') {
      income += t.amount;
    } else if (t.type === 'expense') {
      expenses += t.amount;
      const day = parseInt(t.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailySpendingMap[day] = (dailySpendingMap[day] || 0) + t.amount;
      }
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;

      if (t.classification === 'need') {
        needsTotal += t.amount;
      } else if (t.classification === 'want') {
        wantsTotal += t.amount;
      } else if (t.classification === 'saving') {
        savingsTotal += t.amount;
      }
    } else if (t.type === 'saving') {
      savings += t.amount;
      savingsTotal += t.amount;
    }
  }

  const netSavings = income - expenses;
  const savingsRate = income > 0 ? Math.round((Math.max(0, netSavings) / income) * 100) : 0;

  // 50/30/20 percentages relative to total spent + saved (or income if higher)
  const totalAllocated = Math.max(income, needsTotal + wantsTotal + savingsTotal, 1);
  const needsPercentage = Math.round((needsTotal / totalAllocated) * 100);
  const wantsPercentage = Math.round((wantsTotal / totalAllocated) * 100);
  const savingsPercentage = Math.round((savingsTotal / totalAllocated) * 100);

  const dailySpending = Object.entries(dailySpendingMap).map(([day, amount]) => ({
    day: parseInt(day, 10),
    amount,
  }));

  const categoryBreakdown = Object.entries(categorySpendingMap)
    .map(([category, amount]) => {
      const percentage = expenses > 0 ? Math.round((amount / expenses) * 100) : 0;
      const style = CATEGORY_COLORS[category] || { color: '#94a3b8', icon: 'Tag' };
      return {
        category,
        amount,
        percentage,
        color: style.color,
        icon: style.icon,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const budgetAlerts = budgets.map((b) => {
    const spent = categorySpendingMap[b.category] || 0;
    const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    return {
      category: b.category,
      spent,
      limit: b.monthlyLimit,
      percentage,
      isOver: spent > b.monthlyLimit,
    };
  });

  return {
    yearMonth,
    income,
    expenses,
    savings,
    netSavings,
    savingsRate,
    needsTotal,
    wantsTotal,
    savingsTotal,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    dailySpending,
    categoryBreakdown,
    budgetAlerts,
  };
}

export function calculateCompoundInterest(
  initialAmount: number,
  monthlyContribution: number,
  annualRatePercentage: number,
  years: number
): {
  totalBalance: number;
  totalContributions: number;
  totalInterest: number;
  timeline: { year: number; balanceWithInterest: number; principalInvested: number }[];
} {
  const monthlyRate = annualRatePercentage / 100 / 12;
  const totalMonths = years * 12;
  let balance = initialAmount;
  let invested = initialAmount;

  const timeline = [{ year: 0, balanceWithInterest: initialAmount, principalInvested: initialAmount }];

  for (let m = 1; m <= totalMonths; m++) {
    balance = (balance + monthlyContribution) * (1 + monthlyRate);
    invested += monthlyContribution;

    if (m % 12 === 0) {
      timeline.push({
        year: m / 12,
        balanceWithInterest: Math.round(balance),
        principalInvested: Math.round(invested),
      });
    }
  }

  return {
    totalBalance: Math.round(balance),
    totalContributions: Math.round(invested),
    totalInterest: Math.round(Math.max(0, balance - invested)),
    timeline,
  };
}

export function checkUnlockedBadges(
  badges: Badge[],
  transactions: Transaction[],
  goals: SavingsGoal[],
  streakDays: number
): { updatedBadges: Badge[]; newlyUnlocked: Badge[] } {
  const newlyUnlocked: Badge[] = [];
  const updatedBadges = badges.map((badge) => {
    if (badge.unlockedAt) {
      return badge;
    }

    let shouldUnlock = false;

    if (badge.id === 'badge-first-transaction' && transactions.length >= 1) {
      shouldUnlock = true;
    } else if (badge.id === 'badge-first-saving' && (transactions.some((t) => t.type === 'saving') || goals.some((g) => g.currentAmount > 0))) {
      shouldUnlock = true;
    } else if (badge.id === 'badge-streak-7' && streakDays >= 7) {
      shouldUnlock = true;
    } else if (badge.id === 'badge-streak-30' && streakDays >= 30) {
      shouldUnlock = true;
    } else if (badge.id === 'badge-goal-achieved' && goals.some((g) => g.currentAmount >= g.targetAmount)) {
      shouldUnlock = true;
    } else if (badge.id === 'badge-super-saver' && transactions.filter((t) => t.type === 'saving').reduce((acc, curr) => acc + curr.amount, 0) >= 500) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      const unlocked = { ...badge, unlockedAt: new Date().toISOString() };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }

    return badge;
  });

  return { updatedBadges, newlyUnlocked };
}
