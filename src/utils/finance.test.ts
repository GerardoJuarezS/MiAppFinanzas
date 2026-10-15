import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelAndProgress,
  calculateMonthlyStats,
  calculateCompoundInterest,
  formatCurrency,
  checkUnlockedBadges,
  XP_PER_LEVEL,
} from './finance.ts';
import type { Transaction, CategoryBudget, SavingsGoal, Badge } from '../types/finance.ts';

test('calculateLevelAndProgress computes correct level, title and percentage', () => {
  const resultLvl1 = calculateLevelAndProgress(50);
  assert.equal(resultLvl1.level, 1);
  assert.equal(resultLvl1.title, 'Semilla Financiera');
  assert.equal(resultLvl1.currentLevelXp, 50);
  assert.equal(resultLvl1.progressPercent, Math.round((50 / XP_PER_LEVEL) * 100));

  const resultLvl3 = calculateLevelAndProgress(650);
  assert.equal(resultLvl3.level, 3);
  assert.equal(resultLvl3.title, 'Guardián del Ahorro');
  assert.equal(resultLvl3.currentLevelXp, 50);
});

test('calculateMonthlyStats aggregates income, expenses, 50/30/20 and daily spending', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      amount: 2000,
      category: 'Sueldo',
      description: 'Nómina quincenal',
      date: '2026-10-01',
      classification: 'need',
      paymentMethod: 'Transferencia',
    },
    {
      id: '2',
      type: 'expense',
      amount: 600,
      category: 'Vivienda',
      description: 'Renta departamento',
      date: '2026-10-02',
      classification: 'need',
      paymentMethod: 'Transferencia',
    },
    {
      id: '3',
      type: 'expense',
      amount: 200,
      category: 'Ocio & Salidas',
      description: 'Cena con amigos',
      date: '2026-10-05',
      classification: 'want',
      paymentMethod: 'Tarjeta',
    },
    {
      id: '4',
      type: 'saving',
      amount: 300,
      category: 'Ahorro para Metas',
      description: 'Aporte fondo de emergencia',
      date: '2026-10-10',
      classification: 'saving',
      paymentMethod: 'Transferencia',
    },
    // Another month transaction to ensure filtering works
    {
      id: '5',
      type: 'expense',
      amount: 999,
      category: 'Ocio & Salidas',
      description: 'Viaje pasado',
      date: '2026-09-15',
      classification: 'want',
      paymentMethod: 'Tarjeta',
    },
  ];

  const budgets: CategoryBudget[] = [
    { category: 'Vivienda', monthlyLimit: 700, icon: 'Home', color: '#818cf8' },
    { category: 'Ocio & Salidas', monthlyLimit: 150, icon: 'PartyPopper', color: '#f472b6' },
  ];

  const stats = calculateMonthlyStats(transactions, '2026-10', budgets);

  assert.equal(stats.income, 2000);
  assert.equal(stats.expenses, 800);
  assert.equal(stats.savings, 300);
  assert.equal(stats.netSavings, 1200);
  assert.equal(stats.savingsRate, 60); // 1200 / 2000 = 60%
  assert.equal(stats.needsTotal, 600);
  assert.equal(stats.wantsTotal, 200);

  // Check budget alert for Ocio (spent 200 > limit 150)
  const ocioAlert = stats.budgetAlerts.find((b) => b.category === 'Ocio & Salidas');
  assert.ok(ocioAlert);
  assert.equal(ocioAlert?.isOver, true);
  assert.equal(ocioAlert?.spent, 200);

  // Daily spending check on day 2 and day 5
  const day2 = stats.dailySpending.find((d) => d.day === 2);
  const day5 = stats.dailySpending.find((d) => d.day === 5);
  assert.equal(day2?.amount, 600);
  assert.equal(day5?.amount, 200);
});

test('calculateCompoundInterest calculates geometric growth correctly', () => {
  const result = calculateCompoundInterest(1000, 100, 10, 5);
  assert.ok(result.totalBalance > 1000 + 100 * 60);
  assert.equal(result.totalContributions, 1000 + 100 * 60);
  assert.ok(result.totalInterest > 0);
  assert.equal(result.timeline.length, 6); // Year 0 to 5
});

test('checkUnlockedBadges triggers unlocks when criteria met', () => {
  const badges: Badge[] = [
    {
      id: 'badge-first-transaction',
      title: 'Primer Movimiento',
      description: 'Registraste tu primera transacción',
      icon: 'Rocket',
      unlockedAt: null,
      requirement: 'Registra 1 transacción',
      category: 'consistency',
    },
    {
      id: 'badge-streak-7',
      title: 'Racha de 7 Días',
      description: '7 días seguidos revisando tus finanzas',
      icon: 'Flame',
      unlockedAt: null,
      requirement: 'Racha de 7 días',
      category: 'streak',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 15,
      category: 'Alimentación',
      description: 'Snack',
      date: '2026-10-15',
      classification: 'want',
      paymentMethod: 'Efectivo',
    },
  ];

  const goals: SavingsGoal[] = [];

  const { updatedBadges, newlyUnlocked } = checkUnlockedBadges(badges, transactions, goals, 3);
  assert.equal(newlyUnlocked.length, 1);
  assert.equal(newlyUnlocked[0].id, 'badge-first-transaction');
  assert.ok(updatedBadges[0].unlockedAt !== null);
  assert.equal(updatedBadges[1].unlockedAt, null);
});
