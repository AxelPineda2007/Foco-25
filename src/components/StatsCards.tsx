import React from 'react';
import { StudySession } from '../types';
import { CheckCircle2, XCircle, Flame, Clock, Smartphone, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  sessions: StudySession[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ sessions }) => {
  const completed = sessions.filter(s => s.status === 'completed');
  const abandoned = sessions.filter(s => s.status === 'abandoned');
  const total = sessions.length;

  const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  
  // Total focused minutes
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  // Cellphone abandonments count
  const cellphoneAbandonments = abandoned.filter(s =>
    s.distractionReason && (s.distractionReason.includes('Celular') || s.distractionReason.includes('WhatsApp'))
  ).length;

  // Calculate study streak (unique consecutive active days ending today or yesterday)
  const uniqueDates = Array.from(new Set(
    completed.map(s => s.startTime.split('T')[0])
  )).sort().reverse();

  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (uniqueDates.length > 0) {
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      streak = 1;
      let checkDate = new Date(uniqueDates[0]);
      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Primary distraction
  const distractionCounts: Record<string, number> = {};
  abandoned.forEach(s => {
    const reason = s.distractionReason || 'Sin especificar';
    distractionCounts[reason] = (distractionCounts[reason] || 0) + 1;
  });

  let topDistraction = 'Ninguna';
  let topDistractionCount = 0;
  Object.entries(distractionCounts).forEach(([reason, count]) => {
    if (count > topDistractionCount) {
      topDistractionCount = count;
      topDistraction = reason;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Tasa de Éxito */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Tasa de Éxito</span>
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-numbers text-white">{successRate}%</span>
          <span className="text-[11px] text-slate-400">retención</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* 2. Completadas (P0 / M2) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Completadas</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-numbers text-emerald-400">{completed.length}</span>
          <span className="text-[11px] text-slate-400">de {total} sesiones</span>
        </div>
        <p className="text-[10px] text-emerald-500/80 mt-1">25 min sin interrupción</p>
      </div>

      {/* 3. Abandonadas (P0 / M2) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm hover:border-rose-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Abandonadas</span>
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-numbers text-rose-400">{abandoned.length}</span>
          <span className="text-[11px] text-slate-400">interrumpidas</span>
        </div>
        <p className="text-[10px] text-rose-400/80 mt-1">
          {cellphoneAbandonments > 0 ? `${cellphoneAbandonments} por celular` : 'Corte anticipado'}
        </p>
      </div>

      {/* 4. Tiempo Total Enfoque */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Foco Acumulado</span>
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono-numbers text-white">{hours}h {remainingMins}m</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Tiempo neto estudiado</p>
      </div>

      {/* 5. Foco vs Celular */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Riesgo Celular</span>
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-numbers text-amber-400">{cellphoneAbandonments}</span>
          <span className="text-[11px] text-slate-400">tentaciones</span>
        </div>
        <p className="text-[10px] text-amber-400/80 mt-1 truncate" title={topDistraction}>
          {topDistractionCount > 0 ? topDistraction.split('/')[0].trim() : 'Bajo control'}
        </p>
      </div>

      {/* 6. Racha de Días */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm hover:border-orange-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Racha de Días</span>
          <Flame className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono-numbers text-orange-400">{streak}</span>
          <span className="text-[11px] text-slate-400">días seguidos</span>
        </div>
        <p className="text-[10px] text-orange-400/80 mt-1">Constancia de estudio</p>
      </div>
    </div>
  );
};
