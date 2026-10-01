import React, { useState } from 'react';
import { StudySession, WeekDayStats } from '../types';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone,
  Info
} from 'lucide-react';

interface WeeklyChartProps {
  sessions: StudySession[];
  onSelectDaySession?: (session: StudySession) => void;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ sessions }) => {
  // Week offset (0 = current week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Calculate Monday of current week + offset
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const days: WeekDayStats[] = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      // Filter sessions on this day
      const daySessions = sessions.filter(s => s.startTime.split('T')[0] === dateStr);
      const completed = daySessions.filter(s => s.status === 'completed').length;
      const abandoned = daySessions.filter(s => s.status === 'abandoned').length;
      const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      const rate = daySessions.length > 0 ? Math.round((completed / daySessions.length) * 100) : 0;

      days.push({
        date: dateStr,
        dayLabel: dayNames[i],
        dayNumber: d.getDate(),
        completedCount: completed,
        abandonedCount: abandoned,
        totalMinutes: totalMins,
        successRate: rate,
        isToday: dateStr === todayStr,
        sessions: daySessions,
      });
    }

    return { monday, days };
  };

  const { monday, days } = getWeekDates(weekOffset);

  // Find max sessions for bar scaling
  const maxSessionsInADay = Math.max(
    ...days.map(d => d.completedCount + d.abandonedCount),
    4 // minimum scale height
  );

  const totalWeekCompleted = days.reduce((acc, d) => acc + d.completedCount, 0);
  const totalWeekAbandoned = days.reduce((acc, d) => acc + d.abandonedCount, 0);
  const totalWeekMinutes = days.reduce((acc, d) => acc + d.totalMinutes, 0);
  const totalWeekHours = Math.floor(totalWeekMinutes / 60);
  const remainingMins = totalWeekMinutes % 60;
  const weekTotal = totalWeekCompleted + totalWeekAbandoned;
  const weekSuccessRate = weekTotal > 0 ? Math.round((totalWeekCompleted / weekTotal) * 100) : 0;

  // Selected day details
  const activeDay = selectedDayIndex !== null ? days[selectedDayIndex] : days.find(d => d.isToday) || days[0];

  const formatWeekRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
      {/* Header with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Gráfico Semanal de Rendimiento</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Completadas (25m) vs Abandonadas por celular u otras distracciones
          </p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-300 min-w-[140px] text-center">
            {formatWeekRange(monday)}
          </span>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={weekOffset >= 0}
            className={`p-1 rounded transition-colors ${
              weekOffset >= 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Quick KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400">Total Sesiones:</span>
          <span className="ml-1.5 font-bold font-mono-numbers text-white">{weekTotal}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Completadas:</span>
          <span className="font-bold font-mono-numbers text-emerald-400">{totalWeekCompleted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-slate-400">Abandonadas:</span>
          <span className="font-bold font-mono-numbers text-rose-400">{totalWeekAbandoned}</span>
        </div>
        <div>
          <span className="text-slate-400">Tiempo Total:</span>
          <span className="ml-1.5 font-bold font-mono-numbers text-cyan-400">
            {totalWeekHours}h {remainingMins}m
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="relative pt-6 pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 border-b border-slate-800 pb-2">
          {days.map((day, idx) => {
            const isSelected = activeDay?.date === day.date;
            const dayTotal = day.completedCount + day.abandonedCount;
            const completedHeightPercent = dayTotal > 0 ? (day.completedCount / maxSessionsInADay) * 100 : 0;
            const abandonedHeightPercent = dayTotal > 0 ? (day.abandonedCount / maxSessionsInADay) * 100 : 0;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`group flex flex-col items-center justify-end h-full cursor-pointer p-1 rounded-xl transition-all ${
                  isSelected ? 'bg-indigo-950/40 ring-1 ring-indigo-500' : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Count tooltip on hover */}
                <div className="text-[11px] font-mono-numbers text-slate-400 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {dayTotal > 0 ? `${dayTotal}` : '-'}
                </div>

                {/* Stacked Bars Container */}
                <div className="w-full max-w-[36px] bg-slate-950 rounded-t-lg overflow-hidden flex flex-col justify-end h-40 border border-slate-800">
                  {/* Abandoned (top portion, red) */}
                  {day.abandonedCount > 0 && (
                    <div
                      className="w-full bg-rose-500/80 hover:bg-rose-400 transition-all rounded-t-sm"
                      style={{ height: `${abandonedHeightPercent}%` }}
                      title={`${day.abandonedCount} abandonadas`}
                    />
                  )}
                  {/* Completed (bottom portion, emerald) */}
                  {day.completedCount > 0 && (
                    <div
                      className="w-full bg-emerald-500 hover:bg-emerald-400 transition-all"
                      style={{ height: `${completedHeightPercent}%` }}
                      title={`${day.completedCount} completadas (25m)`}
                    />
                  )}
                  {dayTotal === 0 && (
                    <div className="w-full h-1 bg-slate-800 self-end" />
                  )}
                </div>

                {/* Day Labels */}
                <div className="mt-2 text-center">
                  <span className={`text-xs block font-bold ${day.isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {day.dayLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {day.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-4 px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Completadas (25m cumplidos)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Abandonadas (Tentación celular / otros)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            💡 Toca cualquier día para inspeccionar el detalle
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Panel */}
      {activeDay && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Detalle del {activeDay.dayLabel} {activeDay.dayNumber} ({activeDay.date})
              </h4>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400 font-medium">
                {activeDay.completedCount} completadas
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-medium">
                {activeDay.abandonedCount} abandonadas
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-medium font-mono-numbers">
                {activeDay.totalMinutes} min totales
              </span>
            </div>
          </div>

          {activeDay.sessions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No hubo sesiones registradas en este día.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {activeDay.sessions.map(s => {
                const startTime = new Date(s.startTime).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.subjectColor }}
                        />
                        <span className="font-semibold text-white truncate">{s.subjectName}</span>
                      </div>
                      <span className="text-[10px] font-mono-numbers text-slate-400">
                        {startTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="font-mono-numbers text-slate-300">
                        {s.durationMinutes} min / {s.targetMinutes}m
                      </span>
                      {s.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Lograda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-medium truncate max-w-[120px]" title={s.distractionReason}>
                          <XCircle className="w-3 h-3 flex-shrink-0" />
                          {s.distractionReason?.includes('Celular') ? 'Celular' : 'Abandonada'}
                        </span>
                      )}
                    </div>

                    {s.notes && (
                      <p className="text-[10px] text-slate-400 mt-1.5 italic line-clamp-1">
                        "{s.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
