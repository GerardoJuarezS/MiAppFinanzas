import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Target,
  Sparkles,
  Sliders,
} from 'lucide-react';
import type {
  Transaction,
  SavingsGoal,
  Challenge,
  CategoryBudget,
  UserProfile,
  MonthlyStats,
} from '../types/finance.ts';
import { formatCurrency } from '../utils/finance.ts';

interface DashboardViewProps {
  stats: MonthlyStats;
  goals: SavingsGoal[];
  challenges: Challenge[];
  budgets: CategoryBudget[];
  transactions: Transaction[];
  userProfile: UserProfile;
  onNavigateTab: (tab: 'transactions' | 'savings' | 'reports' | 'simulator') => void;
  onOpenDepositGoal: (goal: SavingsGoal) => void;
  onCheckInChallenge: (challengeId: string) => void;
  onOpenNewTransaction: () => void;
  onOpenBudgetManager: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  goals,
  challenges,
  budgets,
  transactions,
  userProfile,
  onNavigateTab,
  onOpenDepositGoal,
  onCheckInChallenge,
  onOpenNewTransaction,
  onOpenBudgetManager,
}) => {
  const activeChallenges = challenges.filter((c) => !c.completed);
  const recentTransactions = transactions.slice(0, 5);

  // Motivational quote based on savings rate
  const getMotivationalMessage = () => {
    if (stats.savingsRate >= 25) {
      return {
        title: '¡Ritmo Financiero Excelente!',
        text: `Has ahorrado el ${stats.savingsRate}% de tus ingresos este mes. Estás superando el estándar 50/30/20.`,
        accent: 'text-emerald-400',
        badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
      };
    } else if (stats.savingsRate >= 15) {
      return {
        title: 'Buen camino hacia la libertad financiera',
        text: `Tu ahorro del ${stats.savingsRate}% te protege ante imprevistos. Un pequeño empujón en gastos de ocio te llevará al 20%.`,
        accent: 'text-teal-400',
        badge: 'bg-teal-950/60 border-teal-500/30 text-teal-400',
      };
    }
    return {
      title: 'Momento de cuidar el flujo de caja',
      text: 'Tus gastos de este mes están absorbiendo la mayor parte de tus ingresos. Activa un reto semanal para recortar gastos hormiga.',
      accent: 'text-amber-400',
      badge: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
    };
  };

  const motivation = getMotivationalMessage();

  return (
    <div className="space-y-6">
      {/* Motivational Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${motivation.badge}`}>
                Estado Mensual: Octubre 2026
              </span>
              <span className="text-xs text-slate-400 font-mono-numbers">
                Racha {userProfile.streakDays} días
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hola {userProfile.name}, {motivation.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {motivation.text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Ver Informe Gráfico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Movimiento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance / Ahorro Neto */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ahorro Neto del Mes</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white tracking-tight">
            {formatCurrency(stats.netSavings)}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold font-mono-numbers">
              {stats.savingsRate}%
            </span>
            <span className="text-slate-400">tasa de ahorro neta</span>
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingresos Totales</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white tracking-tight">
            {formatCurrency(stats.income)}
          </div>
          <div className="text-xs text-slate-400">
            Nómina + Proyectos freelance
          </div>
        </div>

        {/* Gastos del mes */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gastos Realizados</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white tracking-tight">
            {formatCurrency(stats.expenses)}
          </div>
          <div className="text-xs text-slate-400">
            {stats.income > 0 ? Math.round((stats.expenses / stats.income) * 100) : 0}% de los ingresos
          </div>
        </div>

        {/* Metas Activas */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total en Alcancías</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white tracking-tight">
            {formatCurrency(goals.reduce((acc, g) => acc + g.currentAmount, 0))}
          </div>
          <div className="text-xs text-slate-400">
            {goals.length} metas de ahorro en progreso
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule Breakdown Widget */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">Equilibrio Financiero: Regla 50 / 30 / 20</h2>
            <p className="text-xs text-slate-400">
              Distribución recomendada para jóvenes de 18 a 40 años: 50% Necesidades, 30% Deseos, 20% Ahorro.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Ver análisis profundo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, stats.needsPercentage)}%` }}
              className="bg-sky-500 h-full transition-all duration-500"
              title={`Necesidades: ${stats.needsPercentage}%`}
            />
            <div
              style={{ width: `${Math.min(100 - stats.needsPercentage, stats.wantsPercentage)}%` }}
              className="bg-rose-400 h-full transition-all duration-500"
              title={`Deseos: ${stats.wantsPercentage}%`}
            />
            <div
              style={{ width: `${Math.min(100 - stats.needsPercentage - stats.wantsPercentage, stats.savingsPercentage)}%` }}
              className="bg-emerald-400 h-full transition-all duration-500"
              title={`Ahorro: ${stats.savingsPercentage}%`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <div className="text-xs">
                  <div className="text-slate-300 font-medium">Necesidades Básicas</div>
                  <div className="text-slate-500 text-[11px]">Renta, comida, servicios</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white font-mono-numbers">{stats.needsPercentage}%</span>
                <span className="text-[10px] text-slate-400 block font-mono-numbers">{formatCurrency(stats.needsTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="text-xs">
                  <div className="text-slate-300 font-medium">Deseos & Ocio</div>
                  <div className="text-slate-500 text-[11px]">Salidas, hobbies, compras</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white font-mono-numbers">{stats.wantsPercentage}%</span>
                <span className="text-[10px] text-slate-400 block font-mono-numbers">{formatCurrency(stats.wantsTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="text-xs">
                  <div className="text-slate-300 font-medium">Ahorro & Metas</div>
                  <div className="text-slate-500 text-[11px]">Fondo, viajes, inversión</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white font-mono-numbers">{stats.savingsPercentage}%</span>
                <span className="text-[10px] text-slate-400 block font-mono-numbers">{formatCurrency(stats.savingsTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Goals + Active Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metas de Ahorro Prioritarias */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Metas de Ahorro</h2>
            </div>
            <button
              onClick={() => onNavigateTab('savings')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Ver todas ({goals.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">{goal.title}</div>
                      <div className="text-xs text-slate-400">
                        {percent}% completado · Falta {formatCurrency(remaining)}
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenDepositGoal(goal)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Abonar</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#10b981',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retos Gamificados Activos */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Retos de Ahorro en Curso</h2>
            </div>
            <button
              onClick={() => onNavigateTab('savings')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Ver retos y medallas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {activeChallenges.slice(0, 3).map((challenge) => {
              const progress = Math.min(100, Math.round((challenge.currentDays / challenge.targetDays) * 100));

              return (
                <div
                  key={challenge.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{challenge.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/20">
                          +{challenge.rewardXp} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">
                        {challenge.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onCheckInChallenge(challenge.id)}
                      title="Registrar progreso de hoy"
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Check-in</span>
                    </button>
                  </div>

                  {/* Progress indicator */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                      <span>Progreso: {challenge.currentDays} / {challenge.targetDays} días</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Budgets & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de Presupuestos (1 col) */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Presupuestos por Categoría</h2>
            <button
              onClick={onOpenBudgetManager}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Definir y editar presupuestos mensuales en MXN"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="space-y-3">
            {stats.budgetAlerts.slice(0, 4).map((b) => (
              <div key={b.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[150px]">{b.category}</span>
                  <div className="flex items-center gap-1.5 font-mono-numbers">
                    <span className={b.isOver ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-slate-500">/ {formatCurrency(b.limit)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.isOver
                        ? 'bg-rose-500'
                        : b.percentage > 85
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={onOpenBudgetManager}
              className="w-full py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gestionar Presupuestos (MXN)</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer text-center block"
            >
              Ver reporte gráfico detallado
            </button>
          </div>
        </div>

        {/* Movimientos Recientes (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Movimientos Recientes</h2>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos los movimientos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tx.type === 'saving'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'saving' ? '★' : '-'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{tx.description}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>{tx.category}</span>
                      <span>·</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold font-mono-numbers ${
                      tx.type === 'income'
                        ? 'text-emerald-400'
                        : tx.type === 'saving'
                        ? 'text-teal-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{tx.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
