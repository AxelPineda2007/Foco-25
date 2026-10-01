import React from 'react';
import { StudySession } from '../types';
import { Sprout, TreePine, Award, Sparkles, AlertOctagon } from 'lucide-react';

interface FocusTreeProps {
  progressPercent: number; // 0 to 100
  isRunning: boolean;
  isCompleted: boolean;
  isAbandoned: boolean;
  totalCompletedSessions: number;
  totalAbandonedSessions: number;
}

export const FocusTree: React.FC<FocusTreeProps> = ({
  progressPercent,
  isRunning,
  isCompleted,
  isAbandoned,
  totalCompletedSessions,
  totalAbandonedSessions,
}) => {
  // Determine tree stage
  let stageLabel = 'Semilla lista para germinar';
  let stageDescription = 'Inicia los 25 minutos para que tu árbol de concentración comience a crecer.';
  let stageEmoji = '🌱';

  if (isAbandoned) {
    stageLabel = 'Árbol marchitado';
    stageDescription = 'La distracción del celular marchitó este árbol. ¡La próxima sesión lograrás florecer!';
    stageEmoji = '🥀';
  } else if (isCompleted || progressPercent >= 100) {
    stageLabel = '¡Árbol Centenario Florecido!';
    stageDescription = '¡Victoria! 25 minutos de estudio ininterrumpido sin tocar el teléfono.';
    stageEmoji = '🌸';
  } else if (progressPercent >= 75) {
    stageLabel = 'Copa frondosa floreciendo';
    stageDescription = '¡Solo quedan pocos minutos! Resiste el impulso de revisar notificaciones.';
    stageEmoji = '🌳';
  } else if (progressPercent >= 45) {
    stageLabel = 'Tallo robusto con hojas';
    stageDescription = 'Tu concentración está en ritmo alfa. Tu atención se afianza.';
    stageEmoji = '🪴';
  } else if (progressPercent > 5) {
    stageLabel = 'Brote tierno emergiendo';
    stageDescription = 'Las raíces del enfoque están ganando fuerza en la tierra.';
    stageEmoji = '🌿';
  }

  // Calculate student level based on completed sessions
  // Each completed session = 25 focus XP
  const xp = totalCompletedSessions * 25;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;

  const getRankTitle = (lvl: number) => {
    if (lvl >= 8) return 'Titán Zen de la Atención';
    if (lvl >= 5) return 'Maestro Anti-Celular';
    if (lvl >= 3) return 'Guardián del Enfoque';
    if (lvl >= 2) return 'Escudero de Estudio';
    return 'Iniciado en el Foco';
  };

  return (
    <div className="bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm transition-colors duration-300">
      {/* Background radial highlight */}
      <div 
        className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isAbandoned 
            ? 'bg-rose-600/15' 
            : isCompleted || progressPercent >= 75 
            ? 'bg-emerald-600/15 dark:bg-emerald-600/20' 
            : 'bg-indigo-600/10 dark:bg-indigo-600/15'
        }`} 
      />

      {/* Header: Student Level & Forest Stats */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
              Bosque de Concentración
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Nivel {level} • {getRankTitle(level)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
            {xp} XP
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
            {currentLevelXp}/100 para Nivel {level + 1}
          </span>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800 mb-4 relative z-10 transition-colors duration-300">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${currentLevelXp}%` }}
        />
      </div>

      {/* Center Visual: The Interactive Tree Plant */}
      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Animated SVG Ring representing tree growth */}
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none transition-colors duration-300"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className={`fill-none transition-all duration-700 ${
                isAbandoned 
                  ? 'stroke-rose-500' 
                  : 'stroke-emerald-500'
              }`}
              strokeWidth="5"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * (isAbandoned ? 100 : progressPercent)) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Plant Emoji / Icon in center */}
          <div className={`absolute text-4xl select-none transition-transform duration-500 ${
            isRunning ? 'animate-bounce' : ''
          }`} style={{ animationDuration: '3s' }}>
            {stageEmoji}
          </div>
        </div>

        <div className="text-center mt-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>{stageLabel}</span>
            {isCompleted && <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin" />}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 leading-snug">
            {stageDescription}
          </p>
        </div>
      </div>

      {/* Forest Mini Gallery Tally */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] relative z-10 transition-colors duration-300">
        <div className="flex items-center gap-1.5">
          <span className="text-base select-none">🌲</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono-numbers">
            {totalCompletedSessions}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">árboles vivos</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-base select-none">🥀</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono-numbers">
            {totalAbandonedSessions}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">marchitados</span>
        </div>

        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Regla: No tocar el celular
        </span>
      </div>
    </div>
  );
};
