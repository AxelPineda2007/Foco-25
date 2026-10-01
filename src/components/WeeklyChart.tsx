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
  Grid,
  PieChart,
  Flame,
  Layers
} from 'lucide-react';

interface WeeklyChartProps {
  sessions: StudySession[];
}

type ChartViewTab = 'bars' | 'heatmap' | 'subjects';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ sessions }) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ChartViewTab>('bars');

  // Calculate Monday of current week + offset
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
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

  const maxSessionsInADay = Math.max(
    ...days.map(d => d.completedCount + d.abandonedCount),
    4
  );

  const totalWeekCompleted = days.reduce((acc, d) => acc + d.completedCount, 0);
  const totalWeekAbandoned = days.reduce((acc, d) => acc + d.abandonedCount, 0);
  const totalWeekMinutes = days.reduce((acc, d) => acc + d.totalMinutes, 0);
  const totalWeekHours = Math.floor(totalWeekMinutes / 60);
  const remainingMins = totalWeekMinutes % 60;
  const weekTotal = totalWeekCompleted + totalWeekAbandoned;
  const weekSuccessRate = weekTotal > 0 ? Math.round((totalWeekCompleted / weekTotal) * 100) : 0;

  const activeDay = selectedDayIndex !== null ? days[selectedDayIndex] : days.find(d => d.isToday) || days[0];

  const formatWeekRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  // Subject breakdown for this week
  const weekSessions = days.flatMap(d => d.sessions);
  const subjectTotals: Record<string, { name: string; color: string; minutes: number; completed: number; abandoned: number }> = {};
  
  weekSessions.forEach(s => {
    if (!subjectTotals[s.subjectId]) {
      subjectTotals[s.subjectId] = {
        name: s.subjectName,
        color: s.subjectColor,
        minutes: 0,
        completed: 0,
        abandoned: 0,
      };
    }
    subjectTotals[s.subjectId].minutes += s.durationMinutes;
    if (s.status === 'completed') subjectTotals[s.subjectId].completed++;
    else subjectTotals[s.subjectId].abandoned++;
  });

  const subjectStatsList = Object.values(subjectTotals).sort((a, b) => b.minutes - a.minutes);

  // Time buckets for the Heatmap Matrix
  const timeSlots = [
    { id: 'morning', label: 'Mañana (08:00 - 12:00)', startHour: 8, endHour: 12 },
    { id: 'afternoon', label: 'Mediodía (12:00 - 16:00)', startHour: 12, endHour: 16 },
    { id: 'evening', label: 'Tarde (16:00 - 20:00)', startHour: 16, endHour: 20 },
    { id: 'night', label: 'Noche (20:00 - 24:00)', startHour: 20, endHour: 24 },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative backdrop-blur-md">
      {/* Header with Navigation and View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Gráfico Semanal de Rendimiento</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              P0 + M1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Completadas (25m de concentración) vs Abandonadas por celular y distracciones
          </p>
        </div>

        {/* View Switcher Tabs & Week Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                activeTab === 'bars' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                activeTab === 'heatmap' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mapa Horario</span>
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                activeTab === 'subjects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Por Materia</span>
            </button>
          </div>

          {/* Week offset controls */}
          <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-300 min-w-[130px] text-center text-[11px]">
              {formatWeekRange(monday)}
            </span>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className={`p-1 rounded transition-colors ${
                weekOffset >= 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Quick KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400">Total Sesiones:</span>
          <span className="ml-1.5 font-bold font-mono-numbers text-white">{weekTotal}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Completadas:</span>
          <span className="font-bold font-mono-numbers text-emerald-400">{totalWeekCompleted}</span>
          <span className="text-[10px] text-emerald-500/80 font-mono-numbers">({weekSuccessRate}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-400">Abandonadas:</span>
          <span className="font-bold font-mono-numbers text-rose-400">{totalWeekAbandoned}</span>
        </div>
        <div>
          <span className="text-slate-400">Tiempo de Foco:</span>
          <span className="ml-1.5 font-bold font-mono-numbers text-cyan-400">
            {totalWeekHours}h {remainingMins}m
          </span>
        </div>
      </div>

      {/* TAB 1: Classic Stacked Bar Chart */}
      {activeTab === 'bars' && (
        <div className="relative pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-60 border-b border-slate-800 pb-2">
            {days.map((day, idx) => {
              const isSelected = activeDay?.date === day.date;
              const dayTotal = day.completedCount + day.abandonedCount;
              const completedHeightPercent = dayTotal > 0 ? (day.completedCount / maxSessionsInADay) * 100 : 0;
              const abandonedHeightPercent = dayTotal > 0 ? (day.abandonedCount / maxSessionsInADay) * 100 : 0;

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`group flex flex-col items-center justify-end h-full cursor-pointer p-1.5 rounded-2xl transition-all ${
                    isSelected ? 'bg-indigo-950/50 ring-2 ring-indigo-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Count indicator on top */}
                  <div className="text-[11px] font-mono-numbers text-slate-400 mb-1 opacity-80 group-hover:opacity-100 transition-opacity font-bold">
                    {dayTotal > 0 ? `${dayTotal}` : '-'}
                  </div>

                  {/* Stacked Bars Container */}
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-t-xl overflow-hidden flex flex-col justify-end h-44 border border-slate-800">
                    {/* Abandoned (top portion, red) */}
                    {day.abandonedCount > 0 && (
                      <div
                        className="w-full bg-rose-500/80 hover:bg-rose-400 transition-all rounded-t-md"
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
                    <span className="text-[10px] text-slate-500 block font-mono-numbers">
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
              💡 Haz clic en cualquier día para ver sus sesiones
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Dynamic Hour-of-Day Heatmap Matrix */}
      {activeTab === 'heatmap' && (
        <div className="py-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Franja Horaria</th>
                  {days.map(d => (
                    <th key={d.date} className="py-2 px-2 text-center font-bold">
                      <span className={d.isToday ? 'text-indigo-400' : 'text-slate-300'}>{d.dayLabel}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {timeSlots.map(slot => (
                  <tr key={slot.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 text-slate-300 font-sans font-medium text-xs">
                      {slot.label}
                    </td>
                    {days.map(day => {
                      // Filter sessions in this hour slot
                      const slotSessions = day.sessions.filter(s => {
                        const hour = new Date(s.startTime).getHours();
                        return hour >= slot.startHour && hour < slot.endHour;
                      });

                      const completed = slotSessions.filter(s => s.status === 'completed').length;
                      const abandoned = slotSessions.filter(s => s.status === 'abandoned').length;

                      let cellBg = 'bg-slate-950 text-slate-600 border border-slate-800/60';
                      if (completed > 0 && abandoned === 0) {
                        cellBg = 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold';
                      } else if (abandoned > 0 && completed === 0) {
                        cellBg = 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold';
                      } else if (completed > 0 && abandoned > 0) {
                        cellBg = 'bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold';
                      }

                      return (
                        <td key={day.date} className="py-2 px-2 text-center">
                          <div className={`py-2 px-1 rounded-xl text-center text-[11px] ${cellBg}`} title={`${completed} completadas, ${abandoned} abandonadas`}>
                            {slotSessions.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {completed > 0 && <span className="text-emerald-400">+{completed}</span>}
                                {abandoned > 0 && <span className="text-rose-400">-{abandoned}</span>}
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Verde: Horas de Enfoque Puro
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Rojo: Horas de Abandono por Celular
              </span>
            </div>
            <span>Patrón de cronotipo de estudio</span>
          </div>
        </div>
      )}

      {/* TAB 3: Subject Time Breakdown */}
      {activeTab === 'subjects' && (
        <div className="py-3 space-y-4">
          {/* Multi-segmented progress bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
            {subjectStatsList.map(sub => {
              const pct = totalWeekMinutes > 0 ? (sub.minutes / totalWeekMinutes) * 100 : 0;
              return (
                <div
                  key={sub.name}
                  style={{ width: `${pct}%`, backgroundColor: sub.color }}
                  className="h-full transition-all"
                  title={`${sub.name}: ${sub.minutes} min (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Cards for each subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subjectStatsList.map(sub => {
              const totalSubSessions = sub.completed + sub.abandoned;
              const subSuccessRate = totalSubSessions > 0 ? Math.round((sub.completed / totalSubSessions) * 100) : 0;
              return (
                <div
                  key={sub.name}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                      <span className="text-xs font-bold text-white truncate">{sub.name}</span>
                    </div>
                    <span className="text-xs font-mono-numbers font-bold text-cyan-400">
                      {sub.minutes} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {sub.completed} completadas / {sub.abandoned} abandonadas
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono-numbers">
                      {subSuccessRate}% éxito
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Inspector Panel */}
      {activeDay && (
        <div className="mt-6 pt-4 border-t border-slate-800">
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
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
