import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  PieChart,
} from 'lucide-react';
import type { Transaction, CategoryBudget, MonthlyStats } from '../types/finance.ts';
import { calculateMonthlyStats, formatCurrency, getMonthName } from '../utils/finance.ts';

interface MonthlyReportsViewProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  currentYearMonth: string;
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  transactions,
  budgets,
  currentYearMonth,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  // Available months extracted from transactions
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  if (!availableMonths.includes(currentYearMonth)) {
    availableMonths.unshift(currentYearMonth);
  }

  const currentStats = calculateMonthlyStats(transactions, selectedMonth, budgets);

  // Calculate previous month stats for MoM comparison
  const [currY, currM] = selectedMonth.split('-').map(Number);
  const prevDate = new Date(currY, currM - 2, 1);
  const prevYearMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevStats = calculateMonthlyStats(transactions, prevYearMonth, budgets);

  // Month-over-month differences
  const expenseDiff = currentStats.expenses - prevStats.expenses;
  const savingsDiff = currentStats.netSavings - prevStats.netSavings;
  const expensePercentDiff = prevStats.expenses > 0 ? Math.round((expenseDiff / prevStats.expenses) * 100) : 0;
  const savingsPercentDiff = prevStats.netSavings > 0 ? Math.round((savingsDiff / prevStats.netSavings) * 100) : 0;

  // Max daily spending for chart normalization
  const maxDaily = Math.max(...currentStats.dailySpending.map((d) => d.amount), 50);
  const avgDaily = currentStats.dailySpending.length > 0
    ? Math.round(currentStats.expenses / currentStats.dailySpending.length)
    : 0;

  // Export CSV summary
  const handleExportCSV = () => {
    const rows = [
      ['Reporte Mensual', getMonthName(selectedMonth)],
      ['Ingresos Totales', currentStats.income.toString()],
      ['Gastos Totales', currentStats.expenses.toString()],
      ['Ahorro Neto', currentStats.netSavings.toString()],
      ['Tasa de Ahorro (%)', `${currentStats.savingsRate}%`],
      ['Necesidades (50%)', currentStats.needsTotal.toString(), `${currentStats.needsPercentage}%`],
      ['Deseos (30%)', currentStats.wantsTotal.toString(), `${currentStats.wantsPercentage}%`],
      ['Ahorro (20%)', currentStats.savingsTotal.toString(), `${currentStats.savingsPercentage}%`],
      [],
      ['Categoría', 'Gasto ($)', '% del Total'],
      ...currentStats.categoryBreakdown.map((c) => [c.category, c.amount.toString(), `${c.percentage}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_financiero_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Month Selector & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">Reporte Mensual Detallado</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono-numbers">{getMonthName(selectedMonth)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Radiografía Financiera de {getMonthName(selectedMonth)}
          </h1>
          <p className="text-xs text-slate-400">
            Analiza tu flujo de caja, distribución de categorías y cumplimiento de metas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector dropdown */}
          <div className="relative">
            <label htmlFor="month-select" className="sr-only">Seleccionar Mes</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Ingresos Totales</span>
          <div className="text-2xl font-bold font-mono-numbers text-white">
            {formatCurrency(currentStats.income)}
          </div>
          <div className="text-[11px] text-slate-500">Flujo positivo registrado</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Gastos Totales</span>
          <div className="text-2xl font-bold font-mono-numbers text-rose-300">
            {formatCurrency(currentStats.expenses)}
          </div>
          <div className="text-[11px] text-slate-500">
            {currentStats.income > 0 ? Math.round((currentStats.expenses / currentStats.income) * 100) : 0}% de los ingresos
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Ahorro Neto Real</span>
          <div className="text-2xl font-bold font-mono-numbers text-emerald-400">
            {formatCurrency(currentStats.netSavings)}
          </div>
          <div className="text-[11px] text-slate-500">Superávit del periodo</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tasa de Ahorro</span>
          <div className="text-2xl font-bold font-mono-numbers text-teal-300">
            {currentStats.savingsRate}%
          </div>
          <div className="text-[11px] text-emerald-400">
            {currentStats.savingsRate >= 20 ? '✓ Cumple regla 20% ahorro' : 'Recomendado: mínimo 20%'}
          </div>
        </div>
      </div>

      {/* Visual Section: Daily Spending Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Spending Trend (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Tendencia de Gasto Diario</h2>
              <p className="text-xs text-slate-400">
                Picos de consumo por día del mes · Promedio diario: {formatCurrency(avgDaily)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Gasto diario</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-44 w-full flex items-end gap-1 sm:gap-1.5 border-b border-slate-800 pb-2">
              {currentStats.dailySpending.map((item) => {
                const heightPercent = maxDaily > 0 ? Math.max(4, Math.round((item.amount / maxDaily) * 100)) : 4;
                const isOverAvg = item.amount > avgDaily * 1.5 && item.amount > 0;

                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono-numbers">
                      Día {item.day}: {formatCurrency(item.amount)}
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        item.amount === 0
                          ? 'bg-slate-800/40'
                          : isOverAvg
                          ? 'bg-rose-500 hover:bg-rose-400'
                          : 'bg-emerald-500 hover:bg-emerald-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis days markers */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 font-mono-numbers">
              <span>Día 1</span>
              <span>Día 7</span>
              <span>Día 15</span>
              <span>Día 22</span>
              <span>Día {currentStats.dailySpending.length}</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Desglose por Categoría</h2>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {currentStats.categoryBreakdown.length} categorías
            </span>
          </div>

          {/* Category List with Bars */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {currentStats.categoryBreakdown.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No hay gastos registrados en este mes.
              </div>
            ) : (
              currentStats.categoryBreakdown.map((cat, idx) => (
                <div
                  key={cat.category}
                  onMouseEnter={() => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    activeCategoryIndex === idx ? 'bg-slate-800/60' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-200 font-medium truncate max-w-[130px]">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono-numbers">
                      <span className="text-slate-200 font-semibold">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-400 text-[11px] w-8 text-right">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 50/30/20 Deep Diagnosis & Actionable Financial Feedback */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Diagnóstico del Método 50 / 30 / 20</h2>
            <p className="text-xs text-slate-400">
              Evaluación inteligente de tus prioridades de gasto y ahorro mensual
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span>Ideal: 50% Necesidades · 30% Deseos · 20% Ahorro</span>
          </div>
        </div>

        {/* 3 Metric Cards with feedback */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Necesidades (50%) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400">Necesidades Básicas</span>
              <span className="text-xs font-mono-numbers text-slate-400">Objetivo: 50%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-numbers text-white">{currentStats.needsPercentage}%</span>
              <span className="text-xs font-mono-numbers text-slate-400">{formatCurrency(currentStats.needsTotal)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${currentStats.needsPercentage > 60 ? 'bg-amber-400' : 'bg-sky-400'}`}
                style={{ width: `${Math.min(100, currentStats.needsPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentStats.needsPercentage <= 50
                ? '✓ Tus costos fijos están perfectamente optimizados, dejándote margen de maniobra.'
                : '⚠ Tus necesidades superan el 50%. Evalúa renegociar suscripciones, servicios o optimizar despensa.'}
            </p>
          </div>

          {/* Deseos y Ocio (30%) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400">Deseos & Estilo de Vida</span>
              <span className="text-xs font-mono-numbers text-slate-400">Objetivo: 30%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-numbers text-white">{currentStats.wantsPercentage}%</span>
              <span className="text-xs font-mono-numbers text-slate-400">{formatCurrency(currentStats.wantsTotal)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${currentStats.wantsPercentage > 35 ? 'bg-rose-500' : 'bg-rose-400'}`}
                style={{ width: `${Math.min(100, currentStats.wantsPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentStats.wantsPercentage <= 30
                ? '✓ Disfrutas tu dinero sin comprometer tu futuro financiero.'
                : '⚠ Gastos recreativos elevados. Usa el reto de la Regla de las 24 horas para frenar impulsos.'}
            </p>
          </div>

          {/* Ahorro e Inversión (20%) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">Ahorro & Metas</span>
              <span className="text-xs font-mono-numbers text-slate-400">Objetivo: 20%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-numbers text-white">{currentStats.savingsPercentage}%</span>
              <span className="text-xs font-mono-numbers text-slate-400">{formatCurrency(currentStats.savingsTotal)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.min(100, currentStats.savingsPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentStats.savingsPercentage >= 20
                ? '✓ ¡Excelente! Estás construyendo un patrimonio sólido y avanzando hacia tus metas.'
                : 'Prioriza pagarte a ti mismo primero al inicio del mes antes de comenzar a gastar.'}
            </p>
          </div>
        </div>
      </div>

      {/* Month-over-Month Comparison Card */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Comparativa Mes contra Mes (MoM)</h2>
            <p className="text-xs text-slate-400">
              {getMonthName(selectedMonth)} comparado con {getMonthName(prevYearMonth)}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">
            Base: {getMonthName(prevYearMonth)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Variación de Gastos */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Variación en Gastos</span>
              <div className="text-xl font-bold text-white font-mono-numbers">
                {expenseDiff >= 0 ? '+' : ''}{formatCurrency(expenseDiff)}
              </div>
              <div className="text-[11px] text-slate-400">
                {expensePercentDiff > 0 ? `Aumentó un ${expensePercentDiff}%` : `Disminuyó un ${Math.abs(expensePercentDiff)}%`} respecto al mes anterior
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              expenseDiff > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {expenseDiff > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>

          {/* Variación de Ahorro */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Variación en Ahorro Neto</span>
              <div className="text-xl font-bold text-white font-mono-numbers">
                {savingsDiff >= 0 ? '+' : ''}{formatCurrency(savingsDiff)}
              </div>
              <div className="text-[11px] text-slate-400">
                {savingsPercentDiff > 0 ? `Ahorraste ${savingsPercentDiff}% más` : `Ahorraste ${Math.abs(savingsPercentDiff)}% menos`} que el mes anterior
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              savingsDiff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {savingsDiff >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
