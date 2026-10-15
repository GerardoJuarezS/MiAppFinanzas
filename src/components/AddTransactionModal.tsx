import React, { useState } from 'react';
import {
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import type {
  Transaction,
  TransactionType,
  BudgetClassification,
  SavingsGoal,
} from '../types/finance.ts';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  goals: SavingsGoal[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  goals,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [classification, setClassification] = useState<BudgetClassification>('need');
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo' | 'Transferencia' | 'Débito'>('Tarjeta');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!description.trim()) return;

    onAddTransaction({
      type,
      amount: parsedAmount,
      category: type === 'saving' ? 'Ahorro para Metas' : category,
      description: description.trim(),
      date,
      classification: type === 'saving' ? 'saving' : classification,
      paymentMethod,
      goalId: type === 'saving' && selectedGoalId ? selectedGoalId : undefined,
    });

    onClose();
    // Reset form
    setAmount('');
    setDescription('');
  };

  const categoriesByType: Record<TransactionType, string[]> = {
    expense: [
      'Alimentación',
      'Vivienda',
      'Transporte',
      'Ocio & Salidas',
      'Salud & Bienestar',
      'Educación & Crecimiento',
      'Servicios & Suscripciones',
      'Compras & Ropa',
      'Otros',
    ],
    income: ['Sueldo', 'Ingresos Extra', 'Inversiones', 'Otros'],
    saving: ['Ahorro para Metas', 'Fondo de Emergencia', 'Inversiones'],
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              +
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Registrar Movimiento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Alimentación');
              setClassification('need');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Gasto</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Sueldo');
              setClassification('need');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Ingreso</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('saving');
              setCategory('Ahorro para Metas');
              setClassification('saving');
              if (goals.length > 0) setSelectedGoalId(goals[0].id);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'saving'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Ahorro (+25 XP)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Monto ($ MXN)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="450.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Descripción / Concepto</label>
            <input
              type="text"
              required
              placeholder="Ej. Supermercado semanal, Spotify, Café de especialidad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {categoriesByType[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Tarjeta">Tarjeta de Crédito</option>
                <option value="Débito">Tarjeta de Débito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          {/* If saving, choose goal */}
          {type === 'saving' && goals.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Asignar a Meta de Ahorro</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} (${g.currentAmount} / ${g.targetAmount})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 50/30/20 Classification (Only for expense) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Clasificación del Método 50 / 30 / 20
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClassification('need')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    classification === 'need'
                      ? 'bg-sky-950/60 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Necesidad Básica (50%)</div>
                  <div className="text-[10px] text-slate-400">Esencial para vivir (casa, comida, luz)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setClassification('want')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    classification === 'want'
                      ? 'bg-rose-950/60 border-rose-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Deseo / Estilo de Vida (30%)</div>
                  <div className="text-[10px] text-slate-400">Gustos, salidas, ropa, entretenimiento</div>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganas +25 XP al registrar</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
              >
                Guardar Movimiento
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
