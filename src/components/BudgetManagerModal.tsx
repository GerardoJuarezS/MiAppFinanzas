import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PiggyBank,
} from 'lucide-react';
import type { CategoryBudget, MonthlyStats } from '../types/finance.ts';
import { formatCurrency, CATEGORY_COLORS } from '../utils/finance.ts';
import { INITIAL_BUDGETS } from '../data/initialData.ts';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  onSaveBudgets: (updatedBudgets: CategoryBudget[]) => void;
  monthlyStats: MonthlyStats;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  monthlyStats,
}) => {
  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>(() => [...budgets]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#38bdf8');

  // Keep in sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalBudgets([...budgets]);
    }
  }, [isOpen, budgets]);

  if (!isOpen) return null;

  const totalBudgeted = localBudgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  const projectedSavings = monthlyStats.income - totalBudgeted;
  const isOverIncome = totalBudgeted > monthlyStats.income && monthlyStats.income > 0;

  const handleLimitChange = (category: string, newLimit: number) => {
    setLocalBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, monthlyLimit: Math.max(0, newLimit) } : b))
    );
  };

  const handleQuickAdjust = (category: string, delta: number) => {
    setLocalBudgets((prev) =>
      prev.map((b) =>
        b.category === category ? { ...b, monthlyLimit: Math.max(0, b.monthlyLimit + delta) } : b
      )
    );
  };

  const handleRemoveCategory = (category: string) => {
    setLocalBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryLimit || parseFloat(newCategoryLimit) <= 0) return;

    const newCat: CategoryBudget = {
      category: newCategoryName.trim(),
      monthlyLimit: parseFloat(newCategoryLimit),
      icon: 'Tag',
      color: newCategoryColor,
    };

    setLocalBudgets((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setNewCategoryLimit('');
    setShowAddCategory(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Restablecer los presupuestos predeterminados (INITIAL_BUDGETS)?')) {
      setLocalBudgets([...INITIAL_BUDGETS]);
    }
  };

  const handleSave = () => {
    onSaveBudgets(localBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Definir y Editar Presupuestos Mensuales
              </h2>
              <p className="text-xs text-slate-400">
                Moneda oficial: Pesos Mexicanos (MXN). Asigna límites de gasto por categoría.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Budget vs Income Summary Box */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">Presupuesto Asignado</span>
              <div className="text-lg font-bold font-mono-numbers text-white">
                {formatCurrency(totalBudgeted)}
              </div>
              <span className="text-[10px] text-slate-500">{localBudgets.length} categorías activas</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">Ingresos del Mes</span>
              <div className="text-lg font-bold font-mono-numbers text-emerald-400">
                {formatCurrency(monthlyStats.income)}
              </div>
              <span className="text-[10px] text-slate-500">Flujo mensual de referencia</span>
            </div>

            <div
              className={`p-3 rounded-xl border space-y-0.5 ${
                isOverIncome
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Margen para Ahorro</span>
                {isOverIncome ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-lg font-bold font-mono-numbers">
                {formatCurrency(projectedSavings)}
              </div>
              <span className="text-[10px] block opacity-80">
                {isOverIncome
                  ? '¡Atención! Tus presupuestos superan tus ingresos'
                  : `${Math.round((projectedSavings / Math.max(1, monthlyStats.income)) * 100)}% proyectado para metas`}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Category List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 scrollbar-thin">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>Ajusta el límite mensual en MXN ($) para cada categoría</span>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddCategory ? 'Cerrar nueva categoría' : 'Añadir categoría'}</span>
            </button>
          </div>

          {/* New Category Inline Form */}
          {showAddCategory && (
            <form
              onSubmit={handleAddCategorySubmit}
              className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200"
            >
              <div className="text-xs font-bold text-emerald-400">Nueva Categoría de Presupuesto</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mascotas, Gimnasio..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Límite Mensual ($ MXN)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    placeholder="2500"
                    value={newCategoryLimit}
                    onChange={(e) => setNewCategoryLimit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Color</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {['#38bdf8', '#818cf8', '#fb923c', '#f472b6', '#34d399', '#facc15'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewCategoryColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                          newCategoryColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          )}

          {/* Budget items */}
          <div className="space-y-3">
            {localBudgets.map((b) => {
              // Current spend for this category from monthly stats
              const alert = monthlyStats.budgetAlerts.find((a) => a.category === b.category);
              const spent = alert ? alert.spent : 0;
              const percent = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
              const isOver = spent > b.monthlyLimit;

              return (
                <div
                  key={b.category}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: b.color || '#38bdf8' }}
                      />
                      <span className="text-sm font-semibold text-white">{b.category}</span>
                      <span className="text-[11px] text-slate-400 font-mono-numbers">
                        (Gastado este mes: {formatCurrency(spent)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Quick Adjust Buttons */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(b.category, -500)}
                        title="Restar $500 MXN"
                        className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-mono-numbers cursor-pointer"
                      >
                        -$500
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(b.category, 500)}
                        title="Sumar $500 MXN"
                        className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-mono-numbers cursor-pointer"
                      >
                        +$500
                      </button>

                      {/* Direct Limit Input */}
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono-numbers">$</span>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={b.monthlyLimit}
                          onChange={(e) => handleLimitChange(b.category, parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-numbers font-bold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(b.category)}
                        title="Eliminar categoría de presupuesto"
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Spent Bar vs Limit */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers">
                      <span>{percent}% del límite consumido</span>
                      <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isOver ? `¡Excedido por ${formatCurrency(spent - b.monthlyLimit)}!` : `Disponible: ${formatCurrency(b.monthlyLimit - spent)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer a valores iniciales (INITIAL_BUDGETS)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Presupuestos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
