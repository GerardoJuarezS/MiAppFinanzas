import React from 'react';
import { Flame, Plus, ShieldCheck, PiggyBank, BarChart3, ListFilter, Calculator, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types/finance.ts';
import { calculateLevelAndProgress } from '../utils/finance.ts';

interface HeaderProps {
  activeTab: 'dashboard' | 'transactions' | 'savings' | 'reports' | 'simulator';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'savings' | 'reports' | 'simulator') => void;
  userProfile: UserProfile;
  onOpenNewTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenNewTransaction,
}) => {
  const levelData = calculateLevelAndProgress(userProfile.currentXp);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Left navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">Kakebo</span>
                <span className="text-xs text-emerald-400 font-medium">Finanzas Jóvenes</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Ahorro inteligente & gamificación</p>
            </div>
          </div>

          {/* Mobile action button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenNewTransaction}
              aria-label="Registrar movimiento"
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar</span>
            </button>
          </div>
        </div>

        {/* Central Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0" aria-label="Navegación principal">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Movimientos</span>
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'savings'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
            <span>Metas & Retos</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Reportes</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador</span>
          </button>
        </nav>

        {/* Right zone: Streak, Level XP, and CTA */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {/* Streak indicator */}
          <div
            title={`Racha de ${userProfile.streakDays} días consecutivos de registro activo`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-500/20 text-orange-400 text-xs font-semibold cursor-default whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
            <span className="font-mono-numbers">{userProfile.streakDays}d</span>
          </div>

          {/* Gamification Level & XP */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
              {levelData.level}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-1.5 text-[10px] leading-tight">
                <span className="text-slate-200 font-medium truncate max-w-[100px]">{levelData.title}</span>
                <span className="text-slate-400 font-mono-numbers">{levelData.currentLevelXp}/{levelData.nextLevelXp} XP</span>
              </div>
              <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${levelData.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* New Transaction CTA */}
          <button
            onClick={onOpenNewTransaction}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm hover:shadow-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
