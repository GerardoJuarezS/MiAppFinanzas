import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Calendar,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
} from 'lucide-react';
import type { Transaction, BudgetClassification, TransactionType } from '../types/finance.ts';
import { formatCurrency } from '../utils/finance.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesClassification =
        selectedClassification === 'all' || tx.classification === selectedClassification;
      return matchesSearch && matchesType && matchesClassification;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Regla 50/30/20', 'Método'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toString(),
      t.classification,
      t.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transacciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Historial de Movimientos
          </h1>
          <p className="text-xs text-slate-400">
            Registro detallado de ingresos, gastos diarios y aportes a metas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'expense', label: 'Gastos' },
            { id: 'income', label: 'Ingresos' },
            { id: 'saving', label: 'Ahorros' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedType === type.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 50/30/20 Filter */}
        <div className="shrink-0">
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Todas las reglas</option>
            <option value="need">Necesidad (50%)</option>
            <option value="want">Deseo (30%)</option>
            <option value="saving">Ahorro (20%)</option>
          </select>
        </div>

        {/* Date Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-2 text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors cursor-pointer shrink-0"
        >
          Fecha: {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}
        </button>
      </div>

      {/* Transactions List */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>Mostrando {filteredTransactions.length} movimientos</span>
          <span>Valores en USD</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-300">No se encontraron movimientos</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar tus filtros de búsqueda o registra una nueva transacción.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isSaving = tx.type === 'saving';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isSaving
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpCircle className="w-5 h-5" />
                      ) : isSaving ? (
                        <PiggyBank className="w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white leading-tight">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="text-slate-300 font-medium">{tx.category}</span>
                        <span>·</span>
                        <span className="font-mono-numbers">{tx.date}</span>
                        <span>·</span>
                        <span className="text-slate-500">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                    {/* Classification Tag */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        tx.classification === 'need'
                          ? 'bg-sky-950/60 text-sky-400 border border-sky-500/20'
                          : tx.classification === 'want'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {tx.classification === 'need'
                        ? 'Necesidad (50%)'
                        : tx.classification === 'want'
                        ? 'Deseo (30%)'
                        : 'Ahorro (20%)'}
                    </span>

                    {/* Amount */}
                    <div
                      className={`text-sm sm:text-base font-bold font-mono-numbers ${
                        isIncome
                          ? 'text-emerald-400'
                          : isSaving
                          ? 'text-teal-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Eliminar movimiento"
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
