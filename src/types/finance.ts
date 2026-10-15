export type TransactionType = 'income' | 'expense' | 'saving';

export type BudgetClassification = 'need' | 'want' | 'saving';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  classification: BudgetClassification;
  paymentMethod: 'Tarjeta' | 'Efectivo' | 'Transferencia' | 'Débito';
  goalId?: string; // Optional if linked to a savings goal
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
  isCompleted?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  targetDays: number;
  currentDays: number;
  completed: boolean;
  category: string;
  difficulty: 'Fácil' | 'Medio' | 'Retador';
  savingsTarget?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: string;
  category: 'savings' | 'streak' | 'budget' | 'consistency';
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
  icon: string;
  color: string;
}

export interface UserProfile {
  name: string;
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastActiveDate: string;
  avatarSeed: string;
}

export interface MonthlyStats {
  yearMonth: string; // "2026-10"
  income: number;
  expenses: number;
  savings: number;
  netSavings: number;
  savingsRate: number; // percentage
  needsTotal: number;
  wantsTotal: number;
  savingsTotal: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  dailySpending: { day: number; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; color: string; icon: string }[];
  budgetAlerts: { category: string; spent: number; limit: number; percentage: number; isOver: boolean }[];
}
