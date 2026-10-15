import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Zap,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { calculateCompoundInterest, formatCurrency } from '../utils/finance.ts';

export const SimulatorView: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(15000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(3500);
  const [annualRate, setAnnualRate] = useState<number>(8.5);
  const [years, setYears] = useState<number>(15);

  const projection = calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, years);

  // Quick preset scenarios (MXN)
  const applyPreset = (init: number, monthly: number, rate: number, horizon: number) => {
    setInitialAmount(init);
    setMonthlyContribution(monthly);
    setAnnualRate(rate);
    setYears(horizon);
  };

  const maxVal = Math.max(...projection.timeline.map((t) => t.balanceWithInterest), 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400">Herramienta de Proyección Joven</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">Interés Compuesto & Movimiento FIRE (MXN)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Simulador de Riqueza e Interés Compuesto
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Descubre cómo pequeñas sumas ahorradas e invertidas de forma consistente en pesos mexicanos (MXN) entre los 18 y 40 años se multiplican gracias al tiempo.
        </p>

        {/* Quick presets */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Escenarios populares:</span>
          <button
            onClick={() => applyPreset(10000, 2000, 8, 10)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Ahorro de $2,000 MXN/mes a 10 años
          </button>
          <button
            onClick={() => applyPreset(25000, 5000, 9, 20)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Libertad Financiera a 20 años
          </button>
          <button
            onClick={() => applyPreset(50000, 8000, 10, 25)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Portafolio S&P 500 a 25 años
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Controls (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white">Configura tus Parámetros (MXN)</h2>

          {/* Initial Capital */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="initial-capital" className="text-slate-300 font-medium">Capital Inicial</label>
              <span className="font-bold font-mono-numbers text-emerald-400">{formatCurrency(initialAmount)}</span>
            </div>
            <input
              id="initial-capital"
              type="range"
              min="0"
              max="200000"
              step="2000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>$0</span>
              <span>$100,000</span>
              <span>$200,000 MXN</span>
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="monthly-contribution" className="text-slate-300 font-medium">Aporte Mensual Continuo</label>
              <span className="font-bold font-mono-numbers text-emerald-400">{formatCurrency(monthlyContribution)} / mes</span>
            </div>
            <input
              id="monthly-contribution"
              type="range"
              min="200"
              max="25000"
              step="200"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>$200/mes</span>
              <span>$12,500/mes</span>
              <span>$25,000/mes MXN</span>
            </div>
          </div>

          {/* Annual Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="annual-rate" className="text-slate-300 font-medium">Rendimiento Anual Estimado</label>
              <span className="font-bold font-mono-numbers text-amber-400">{annualRate}% anual</span>
            </div>
            <input
              id="annual-rate"
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>4% (Renta Fija)</span>
              <span>8-10% (S&P 500)</span>
              <span>15% (Agresivo)</span>
            </div>
          </div>

          {/* Time Horizon (Years) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="time-horizon" className="text-slate-300 font-medium">Horizonte Temporal</label>
              <span className="font-bold font-mono-numbers text-indigo-400">{years} años</span>
            </div>
            <input
              id="time-horizon"
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>1 año</span>
              <span>15 años</span>
              <span>35 años</span>
            </div>
          </div>
        </div>

        {/* Results & Visual Projection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Result Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Capital Proyectado en {years} Años</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Efecto Bola de Nieve
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-white tracking-tight">
              {formatCurrency(projection.totalBalance)}
            </div>

            {/* Split breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Total puesto por ti:</span>
                <div className="text-base font-bold font-mono-numbers text-slate-200">
                  {formatCurrency(projection.totalContributions)}
                </div>
                <div className="text-[10px] text-slate-500">Ahorro base acumulado</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-amber-400">Intereses ganados gratis:</span>
                <div className="text-base font-bold font-mono-numbers text-emerald-400">
                  +{formatCurrency(projection.totalInterest)}
                </div>
                <div className="text-[10px] text-emerald-400/80">
                  {projection.totalContributions > 0
                    ? `+${Math.round((projection.totalInterest / projection.totalContributions) * 100)}% de ganancia extra`
                    : 'Rendimiento puro'}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Timeline Bar Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-white">Curva de Crecimiento vs Guardar Bajo el Colchón</span>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span>Con Rendimiento</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                  <span>Sin Invertir</span>
                </div>
              </div>
            </div>

            <div className="h-40 w-full flex items-end gap-1.5 pt-4 border-b border-slate-800 pb-2">
              {projection.timeline.map((t) => {
                const heightComp = maxVal > 0 ? Math.max(5, Math.round((t.balanceWithInterest / maxVal) * 100)) : 5;
                const heightBase = maxVal > 0 ? Math.max(3, Math.round((t.principalInvested / maxVal) * 100)) : 3;

                return (
                  <div key={t.year} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono-numbers">
                      Año {t.year}: {formatCurrency(t.balanceWithInterest)}
                    </div>

                    <div className="w-full flex items-end gap-0.5 h-full justify-center">
                      <div
                        style={{ height: `${heightBase}%` }}
                        className="w-1/2 bg-slate-600 rounded-t transition-all duration-300"
                        title={`Sin invertir: ${formatCurrency(t.principalInvested)}`}
                      />
                      <div
                        style={{ height: `${heightComp}%` }}
                        className="w-1/2 bg-emerald-400 rounded-t transition-all duration-300"
                        title={`Con interés compuesto: ${formatCurrency(t.balanceWithInterest)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>Año 0</span>
              <span>Año {Math.round(years / 2)}</span>
              <span>Año {years}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
