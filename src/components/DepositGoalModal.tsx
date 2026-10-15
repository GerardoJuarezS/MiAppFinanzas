import React, { useState } from 'react';
import { X, PiggyBank, Sparkles, Plus } from 'lucide-react';
import type { SavingsGoal } from '../types/finance.ts';
import { formatCurrency } from '../utils/finance.ts';

interface DepositGoalModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (goalId: string, amount: number) => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [amount, setAmount] = useState('50');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    onDeposit(goal.id, parsed);
    onClose();
    setAmount('50');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Abonar a Meta</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400">Meta seleccionada:</div>
          <div className="text-sm font-bold text-white">{goal.title}</div>
          <div className="text-xs text-slate-400 font-mono-numbers flex justify-between pt-1">
            <span>Actual: {formatCurrency(goal.currentAmount)}</span>
            <span>Faltan: {formatCurrency(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Monto a Abonar ($)</label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-base bg-slate-950 border border-slate-800 rounded-lg text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {['10', '25', '50', '100'].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(preset)}
                className="py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer font-mono-numbers"
              >
                +${preset}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganas +50 XP por abonar</span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
            >
              Confirmar Depósito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
