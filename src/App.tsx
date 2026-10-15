import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { SavingsGamificationView } from './components/SavingsGamificationView.tsx';
import { MonthlyReportsView } from './components/MonthlyReportsView.tsx';
import { SimulatorView } from './components/SimulatorView.tsx';
import { AddTransactionModal } from './components/AddTransactionModal.tsx';
import { DepositGoalModal } from './components/DepositGoalModal.tsx';
import { BudgetManagerModal } from './components/BudgetManagerModal.tsx';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_CHALLENGES,
  INITIAL_BADGES,
  INITIAL_BUDGETS,
  INITIAL_USER_PROFILE,
} from './data/initialData.ts';
import type {
  Transaction,
  SavingsGoal,
  Challenge,
  Badge,
  CategoryBudget,
  UserProfile,
} from './types/finance.ts';
import {
  calculateMonthlyStats,
  checkUnlockedBadges,
  calculateLevelAndProgress,
} from './utils/finance.ts';
import { Sparkles, Trophy, X, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'savings' | 'reports' | 'simulator'>('dashboard');

  // Load from localStorage or defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kakebo_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('kakebo_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('kakebo_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('kakebo_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('kakebo_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('kakebo_user_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // Modal states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [depositGoalTarget, setDepositGoalTarget] = useState<SavingsGoal | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; sub?: string; icon?: 'xp' | 'badge' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kakebo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kakebo_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('kakebo_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('kakebo_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('kakebo_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('kakebo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const showNotification = (message: string, sub?: string, icon: 'xp' | 'badge' = 'xp') => {
    setToast({ message, sub, icon });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveBudgets = (updatedBudgets: CategoryBudget[]) => {
    setBudgets(updatedBudgets);
    showNotification('Presupuestos Guardados', 'Se actualizaron tus límites mensuales en pesos mexicanos (MXN)');
  };

  // Add XP and level update
  const addXp = (amount: number, reason: string) => {
    setUserProfile((prev) => {
      const newXp = prev.currentXp + amount;
      const { level, title } = calculateLevelAndProgress(newXp);
      return {
        ...prev,
        currentXp: newXp,
        level,
        title,
      };
    });
    showNotification(`+${amount} XP Ganados`, reason, 'xp');
  };

  // Add new transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    const nextTransactions = [newTx, ...transactions];
    setTransactions(nextTransactions);

    // If linked to a goal
    if (newTx.goalId) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === newTx.goalId) {
            const nextAmount = g.currentAmount + newTx.amount;
            return {
              ...g,
              currentAmount: nextAmount,
              isCompleted: nextAmount >= g.targetAmount,
            };
          }
          return g;
        })
      );
    }

    addXp(25, 'Por registrar un movimiento');

    // Check badges
    const { updatedBadges, newlyUnlocked } = checkUnlockedBadges(
      badges,
      nextTransactions,
      goals,
      userProfile.streakDays
    );

    if (newlyUnlocked.length > 0) {
      setBadges(updatedBadges);
      showNotification(`¡Insignia Desbloqueada!`, newlyUnlocked[0].title, 'badge');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Deposit to savings goal
  const handleDepositToGoal = (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    // Create automatic saving transaction
    const savingTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'saving',
      amount,
      category: 'Ahorro para Metas',
      description: `Aporte a meta: ${goal.title}`,
      date: new Date().toISOString().slice(0, 10),
      classification: 'saving',
      paymentMethod: 'Transferencia',
      goalId,
    };

    const nextTransactions = [savingTx, ...transactions];
    setTransactions(nextTransactions);

    const nextGoals = goals.map((g) => {
      if (g.id === goalId) {
        const updatedAmount = g.currentAmount + amount;
        const reached = updatedAmount >= g.targetAmount;
        return {
          ...g,
          currentAmount: updatedAmount,
          isCompleted: reached,
        };
      }
      return g;
    });
    setGoals(nextGoals);

    addXp(50, `Aporte a meta "${goal.title}"`);

    // Check badges
    const { updatedBadges, newlyUnlocked } = checkUnlockedBadges(
      badges,
      nextTransactions,
      nextGoals,
      userProfile.streakDays
    );

    if (newlyUnlocked.length > 0) {
      setBadges(updatedBadges);
      showNotification(`¡Insignia Desbloqueada!`, newlyUnlocked[0].title, 'badge');
    }
  };

  // Challenge check-in
  const handleCheckInChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId && !c.completed) {
          const nextDays = c.currentDays + 1;
          const isDone = nextDays >= c.targetDays;
          if (isDone) {
            addXp(c.rewardXp, `¡Reto completado: ${c.title}!`);
          } else {
            addXp(20, `Check-in diario en reto "${c.title}"`);
          }
          return {
            ...c,
            currentDays: nextDays,
            completed: isDone,
          };
        }
        return c;
      })
    );
  };

  // Create new goal
  const handleCreateGoal = (goalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
    addXp(30, `Nueva meta creada: "${newGoal.title}"`);
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de ejemplo predeterminados?')) {
      localStorage.clear();
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      setChallenges(INITIAL_CHALLENGES);
      setBadges(INITIAL_BADGES);
      setBudgets(INITIAL_BUDGETS);
      setUserProfile(INITIAL_USER_PROFILE);
      showNotification('Datos restablecidos con éxito', 'Se han restaurado los datos de demostración en MXN');
    }
  };

  const currentStats = calculateMonthlyStats(transactions, '2026-10', budgets);

  return (
    <div className="min-h-screen bg-[#0c121e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            {toast.icon === 'badge' ? <Trophy className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400">{toast.message}</div>
            {toast.sub && <div className="text-[11px] text-slate-300">{toast.sub}</div>}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-white ml-2 text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenNewTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={currentStats}
            goals={goals}
            challenges={challenges}
            budgets={budgets}
            transactions={transactions}
            userProfile={userProfile}
            onNavigateTab={setActiveTab}
            onOpenDepositGoal={(goal) => setDepositGoalTarget(goal)}
            onCheckInChallenge={handleCheckInChallenge}
            onOpenNewTransaction={() => setIsAddTxOpen(true)}
            onOpenBudgetManager={() => setIsBudgetManagerOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={() => setIsAddTxOpen(true)}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGamificationView
            goals={goals}
            challenges={challenges}
            badges={badges}
            userProfile={userProfile}
            onOpenDepositGoal={(goal) => setDepositGoalTarget(goal)}
            onCheckInChallenge={handleCheckInChallenge}
            onCreateGoal={handleCreateGoal}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportsView
            transactions={transactions}
            budgets={budgets}
            currentYearMonth="2026-10"
            goals={goals}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'simulator' && <SimulatorView />}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Kakebo Finanzas</span>
            <span>·</span>
            <span>Método 50/30/20 y Gamificación Financiera para 18 a 40 años</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer datos demo</span>
            </button>
            <span>© 2026 Kakebo</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
        goals={goals}
      />

      <DepositGoalModal
        isOpen={depositGoalTarget !== null}
        goal={depositGoalTarget}
        onClose={() => setDepositGoalTarget(null)}
        onDeposit={handleDepositToGoal}
      />

      <BudgetManagerModal
        isOpen={isBudgetManagerOpen}
        onClose={() => setIsBudgetManagerOpen(false)}
        budgets={budgets}
        onSaveBudgets={handleSaveBudgets}
        monthlyStats={currentStats}
      />
    </div>
  );
}
