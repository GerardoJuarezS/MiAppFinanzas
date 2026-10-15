import React, { useState } from 'react';
import {
  Trophy,
  Target,
  Sparkles,
  Flame,
  Plus,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
  Zap,
  Calendar,
  Award,
  Crown,
  HeartHandshake,
} from 'lucide-react';
import type { SavingsGoal, Challenge, Badge, UserProfile } from '../types/finance.ts';
import { calculateLevelAndProgress, formatCurrency, LEVEL_TITLES } from '../utils/finance.ts';

interface SavingsGamificationViewProps {
  goals: SavingsGoal[];
  challenges: Challenge[];
  badges: Badge[];
  userProfile: UserProfile;
  onOpenDepositGoal: (goal: SavingsGoal) => void;
  onCheckInChallenge: (challengeId: string) => void;
  onCreateGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

export const SavingsGamificationView: React.FC<SavingsGamificationViewProps> = ({
  goals,
  challenges,
  badges,
  userProfile,
  onOpenDepositGoal,
  onCheckInChallenge,
  onCreateGoal,
}) => {
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('2027-01-01');
  const [newCategory, setNewCategory] = useState('Viajes');
  const [newColor, setNewColor] = useState('#10b981');

  const levelData = calculateLevelAndProgress(userProfile.currentXp);
  const unlockedBadges = badges.filter((b) => b.unlockedAt !== null);
  const lockedBadges = badges.filter((b) => b.unlockedAt === null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || parseFloat(newTarget) <= 0) return;

    onCreateGoal({
      title: newTitle.trim(),
      targetAmount: parseFloat(newTarget),
      deadline: newDeadline,
      category: newCategory,
      icon: 'Target',
      color: newColor,
    });

    setNewTitle('');
    setNewTarget('');
    setShowNewGoalModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Gamification Level & Rank Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                <Crown className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300 font-mono-numbers">NVL {levelData.level}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {levelData.title}
                </h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-950/50 border border-orange-500/30 text-orange-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  <span>{userProfile.streakDays} días en racha</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Ganas experiencia (XP) registrando movimientos, abonando a tus metas y completando retos semanales.
              </p>
            </div>
          </div>

          {/* XP Progress Box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progreso de Nivel</span>
              <span className="font-mono-numbers text-emerald-400 font-bold">{levelData.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelData.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>{levelData.currentLevelXp} XP</span>
              <span>Siguiente: {levelData.nextLevelXp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Metas de Ahorro (Savings Goals) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Alcancías & Metas de Ahorro</h2>
            </div>
            <p className="text-xs text-slate-400">
              Define propósitos concretos con fecha límite para evitar gastar tu dinero en impulsos.
            </p>
          </div>

          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Meta</span>
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = percent >= 100;

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{goal.category}</span>
                      <h3 className="text-sm font-bold text-white leading-snug">{goal.title}</h3>
                    </div>
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ¡Lograda!
                      </span>
                    ) : (
                      <span className="text-xs font-bold font-mono-numbers text-slate-300">
                        {percent}%
                      </span>
                    )}
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
                    <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                      <span className="text-emerald-400 font-bold">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-slate-500">de {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Límite: {goal.deadline}</span>
                    <span>{isCompleted ? '¡Meta cumplida!' : `Resta ${formatCurrency(remaining)}`}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenDepositGoal(goal)}
                  disabled={isCompleted}
                  className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCompleted
                      ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Meta Completada (+100 XP)' : 'Abonar Dinero (+25 XP)'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Retos de Ahorro Gamificados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Retos de Ahorro Dinámicos</h2>
            </div>
            <p className="text-xs text-slate-400">
              Desafíos semanales para recortar gastos innecesarios de forma divertida y ganar experiencia.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-semibold font-mono-numbers">
            {challenges.filter((c) => c.completed).length} de {challenges.length} completados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const progress = Math.min(100, Math.round((c.currentDays / c.targetDays) * 100));

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  c.completed
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{c.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {c.difficulty}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        +{c.rewardXp} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                    {c.savingsTarget && (
                      <div className="text-[11px] text-emerald-400 font-medium">
                        Ahorro estimado en el reto: ~{formatCurrency(c.savingsTarget)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onCheckInChallenge(c.id)}
                    disabled={c.completed}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      c.completed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{c.completed ? '¡Completado!' : 'Hacer Check-in'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        c.completed ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                    <span>{c.currentDays} de {c.targetDays} días alcanzados</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Vitrina de Logros y Medallas */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Vitrina de Logros & Medallas</h2>
            </div>
            <p className="text-xs text-slate-400">
              Insignias ganadas demostrando disciplina, constancia y progreso financiero.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono-numbers">
            {unlockedBadges.length} / {badges.length} desbloqueadas
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isUnlocked = badge.unlockedAt !== null;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/60 border-amber-500/30 text-white'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-60 text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  {isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200">{badge.title}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{badge.description}</div>
                  <div className="text-[10px] text-slate-500 pt-0.5">
                    {isUnlocked ? '✓ Desbloqueada' : `Requisito: ${badge.requirement}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Crear Nueva Meta de Ahorro</h3>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Título de la Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Viaje a la playa, Fondo de Emergencia, Laptop..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Monto Objetivo ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Viajes">Viajes & Experiencias</option>
                    <option value="Seguridad">Fondo de Emergencia</option>
                    <option value="Tecnología">Tecnología & Herramientas</option>
                    <option value="Inversión">Inversión & Retiro</option>
                    <option value="Vehículo">Auto o Transporte</option>
                    <option value="Vivienda">Hogar o Renta</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Color Distintivo</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          newColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
