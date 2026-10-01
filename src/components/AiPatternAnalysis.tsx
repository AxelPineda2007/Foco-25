import React, { useState } from 'react';
import { StudySession, AiPatternAnalysisResult } from '../types';
import { 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  BookOpen, 
  Target, 
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface AiPatternAnalysisProps {
  sessions: StudySession[];
  analysis: AiPatternAnalysisResult | null;
  onRefreshAnalysis: () => Promise<void>;
  isLoading: boolean;
}

export const AiPatternAnalysis: React.FC<AiPatternAnalysisProps> = ({
  sessions,
  analysis,
  onRefreshAnalysis,
  isLoading,
}) => {
  const [copiedTipIndex, setCopiedTipIndex] = useState<number | null>(null);

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const abandonedCount = sessions.filter(s => s.status === 'abandoned').length;

  const handleCopyTip = (tip: string, index: number) => {
    navigator.clipboard?.writeText(tip);
    setCopiedTipIndex(index);
    setTimeout(() => setCopiedTipIndex(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative AI Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Sello de IA: Diagnóstico de Hábitos & Franja Óptima
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                M5 • Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              La IA lee tu patrón de la semana e identifica exactamente cuándo rinde mejor tu cerebro y dónde ataca el celular.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshAnalysis}
          disabled={isLoading || sessions.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-md shadow-indigo-600/30 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analizando con IA...' : 'Re-analizar Patrones'}</span>
        </button>
      </div>

      {!analysis ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl relative z-10">
          <Sparkles className="w-10 h-10 text-indigo-400/60 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            Descubre tu Franja Horaria de Máximo Rendimiento
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Analizaremos tus {sessions.length} sesiones para desglosar tus horas de oro, picos de dopamina y momentos de mayor riesgo de distracción por el celular.
          </p>
          <button
            onClick={onRefreshAnalysis}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
          >
            {isLoading ? 'Consultando IA...' : 'Iniciar Análisis Inteligente'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          {/* Main 2 Highlight Columns: Optimal Peak Hour vs High Risk Hour */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🌟 FRANJA HORARIA ÓPTIMA (El requerimiento M5 exacto) */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-emerald-400/70 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Clock className="w-3.5 h-3.5" />
                  🌟 Franja Horaria de Oro
                </span>
                <span className="text-xs font-mono-numbers font-bold text-emerald-400">
                  {analysis.optimalTimeWindow.completionRate}% Efectividad
                </span>
              </div>

              <div className="mb-2">
                <h3 className="text-2xl font-black font-mono-numbers text-white tracking-tight">
                  {analysis.optimalTimeWindow.start} - {analysis.optimalTimeWindow.end}
                </h3>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  {analysis.optimalTimeWindow.periodName}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                {analysis.optimalTimeWindow.explanation}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300/80">
                <Target className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Recomendación: Reserva este bloque para materias densas (ej: matemáticas, código).</span>
              </div>
            </div>

            {/* ⚠️ FRANJA CRÍTICA / ALTO RIESGO CELULAR */}
            <div className="bg-slate-950/80 border border-rose-500/40 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-rose-400/70 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <Smartphone className="w-3.5 h-3.5" />
                  ⚠️ Franja de Alto Riesgo de Celular
                </span>
                <span className="text-xs font-mono-numbers font-bold text-rose-400">
                  {analysis.highRiskTimeWindow.abandonmentRate}% Abandono
                </span>
              </div>

              <div className="mb-2">
                <h3 className="text-2xl font-black font-mono-numbers text-white tracking-tight">
                  {analysis.highRiskTimeWindow.start} - {analysis.highRiskTimeWindow.end}
                </h3>
                <p className="text-xs font-semibold text-rose-400 mt-0.5">
                  Distractor #1: {analysis.highRiskTimeWindow.primaryDistractor}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
                {analysis.highRiskTimeWindow.explanation}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-rose-300/80">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Medida preventiva: Apaga notificaciones o deja el celular en otra habitación.</span>
              </div>
            </div>
          </div>

          {/* Secondary AI Insights Row: Chronotype, Habit Score, Best/Worst Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Cronotipo */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tu Cronotipo</span>
              </div>
              <p className="text-sm font-bold text-white line-clamp-1" title={analysis.chronotype}>
                {analysis.chronotype}
              </p>
              <p className="text-[10px] text-indigo-300 mt-1">Patrón biológico detectado</p>
            </div>

            {/* Puntaje de Hábito */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Salud del Hábito</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono-numbers text-cyan-400">
                  {analysis.habitScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate" title={analysis.habitScoreLabel}>
                {analysis.habitScoreLabel}
              </p>
            </div>

            {/* Materia con Mejor Retención */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Materia Más Fuerte</span>
              </div>
              <p className="text-sm font-bold text-white truncate" title={analysis.bestSubject.name}>
                {analysis.bestSubject.name}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono-numbers">
                {analysis.bestSubject.successRate}% de éxito
              </p>
            </div>

            {/* Materia más vulnerable a abandono */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Materia Vulnerable</span>
              </div>
              <p className="text-sm font-bold text-white truncate" title={analysis.challengingSubject.name}>
                {analysis.challengingSubject.name}
              </p>
              <p className="text-[10px] text-amber-400 mt-1 font-mono-numbers">
                {analysis.challengingSubject.abandonmentRate}% de abandono
              </p>
            </div>
          </div>

          {/* Actionable Recommendations Generated by AI */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Plan de Choque Anti-Celular Recomendado por la IA
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.actionableRecommendations.map((tip, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopyTip(tip, idx)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center font-mono-numbers">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                      {tip}
                    </p>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {copiedTipIndex === idx ? '✓ Copiado' : 'Clic para copiar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">Diagnóstico del Mentor IA: </strong>
              <span>{analysis.executiveSummary}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>
              Sesiones evaluadas: {completedCount} completadas / {abandonedCount} abandonadas
            </span>
            <span>
              Última actualización: {new Date(analysis.analyzedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
