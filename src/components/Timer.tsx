import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession, DistractionCategory } from '../types';
import { soundManager } from '../utils/audio';
import { DISTRACTION_OPTIONS } from '../utils/storage';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Smartphone, 
  Coffee, 
  Brain, 
  CheckCircle2, 
  AlertTriangle,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface TimerProps {
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  onSaveSession: (session: StudySession) => void;
}

type TimerMode = 'work' | 'break';

export const Timer: React.FC<TimerProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onSaveSession,
}) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [isTestMode, setIsTestMode] = useState(false); // 10s test mode for quick demos
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Anti-cellphone shield state
  const [phoneShieldActive, setPhoneShieldActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showDistractionModal, setShowDistractionModal] = useState<boolean>(false);
  const [selectedDistraction, setSelectedDistraction] = useState<DistractionCategory>(
    'Celular / Redes Sociales (Instagram, TikTok)'
  );
  const [distractionNotes, setDistractionNotes] = useState<string>('');

  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [focusRating, setFocusRating] = useState<'excelente' | 'bueno' | 'regular'>('excelente');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getTargetSeconds = (currentMode: TimerMode, testMode: boolean) => {
    if (testMode) {
      return currentMode === 'work' ? 10 : 5;
    }
    return currentMode === 'work' ? 25 * 60 : 5 * 60;
  };

  // Sync timeLeft when switching modes or test mode
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getTargetSeconds(mode, isTestMode));
    }
  }, [mode, isTestMode]);

  // Main countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, isTestMode]);

  const handleStart = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning(true);
    soundManager.playStart();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionStartTime(null);
    setTimeLeft(getTargetSeconds(mode, isTestMode));
  };

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'work') {
      soundManager.playCompleted();
      setShowCompletionModal(true);
    } else {
      soundManager.playBreakFinished();
      // Switch back to work mode
      setMode('work');
      setTimeLeft(getTargetSeconds('work', isTestMode));
      setSessionStartTime(null);
    }
  };

  // Confirm completion
  const handleConfirmCompletion = () => {
    const start = sessionStartTime || new Date(Date.now() - 25 * 60 * 1000);
    const end = new Date();
    const duration = isTestMode ? 25 : Math.round((end.getTime() - start.getTime()) / (60 * 1000)) || 25;

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subjectId: activeSubject.id,
      subjectName: activeSubject.name,
      subjectColor: activeSubject.color,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: Math.max(1, duration),
      targetMinutes: 25,
      status: 'completed',
      notes: completionNotes.trim() || undefined,
      focusQuality: focusRating,
    };

    onSaveSession(newSession);
    setShowCompletionModal(false);
    setCompletionNotes('');
    setSessionStartTime(null);

    // Switch to 5-min break
    setMode('break');
    setTimeLeft(getTargetSeconds('break', isTestMode));
  };

  // Trigger abandonment
  const handleTriggerAbandon = () => {
    setIsRunning(false);
    soundManager.playAbandonAlert();
    setShowDistractionModal(true);
  };

  // Confirm abandonment
  const handleConfirmAbandon = () => {
    const start = sessionStartTime || new Date(Date.now() - (getTargetSeconds(mode, isTestMode) - timeLeft) * 1000);
    const end = new Date();
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subjectId: activeSubject.id,
      subjectName: activeSubject.name,
      subjectColor: activeSubject.color,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: durationMinutes > 25 ? 24 : durationMinutes,
      targetMinutes: 25,
      status: 'abandoned',
      distractionReason: selectedDistraction,
      notes: distractionNotes.trim() || undefined,
      focusQuality: 'disperso',
    };

    onSaveSession(newSession);
    setShowDistractionModal(false);
    setDistractionNotes('');
    handleReset();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTarget = getTargetSeconds(mode, isTestMode);
  const progressPercent = Math.min(100, Math.max(0, ((totalTarget - timeLeft) / totalTarget) * 100));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow based on mode */}
      <div 
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          mode === 'work' ? 'bg-indigo-600/15' : 'bg-emerald-600/15'
        }`} 
      />
      <div 
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 bg-cyan-600/10"
      />

      {/* Top Header: Mode Toggles & Subject Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              if (isRunning) return;
              setMode('work');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'work'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Foco 25 min</span>
          </button>
          <button
            onClick={() => {
              if (isRunning) return;
              setMode('break');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Descanso 5 min</span>
          </button>
        </div>

        {/* Quick Demo Mode & Sound Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isRunning) return;
              setIsTestMode(!isTestMode);
            }}
            title={isTestMode ? "Modo rápido 10s activo" : "Activar modo prueba rápido (10s)"}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              isTestMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isTestMode ? '10s Demo' : 'Modo Demo'}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Subject Picker Row */}
      <div className="mb-6 relative z-10">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Materia a estudiar:
        </label>
        <div className="flex flex-wrap gap-2">
          {subjects.map(sub => {
            const isSelected = sub.id === activeSubject.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/60 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center my-6 relative z-10">
        {/* Anti-distraction badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/80 border border-slate-800 text-slate-300 mb-4">
          <Smartphone className={`w-3.5 h-3.5 ${phoneShieldActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{phoneShieldActive ? '🛡️ Escudo Anti-Celular Activo' : 'Celular cerca'}</span>
        </div>

        {/* Digital Clock */}
        <div className="relative flex items-center justify-center">
          <div className="text-7xl md:text-8xl font-black font-mono-numbers tracking-tight text-white drop-shadow-md select-none">
            {formattedTime}
          </div>
        </div>

        {/* Mode subtitle */}
        <p className="text-sm font-medium text-slate-400 mt-2">
          {mode === 'work' ? (
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Sesión de enfoque intenso en <strong className="text-white">{activeSubject.name}</strong>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Coffee className="w-4 h-4" />
              Descanso activo (estírate, toma agua, aléjate de las pantallas)
            </span>
          )}
        </p>

        {/* Linear Progress Bar */}
        <div className="w-full max-w-md bg-slate-950 h-2 rounded-full mt-5 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'work' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-10">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{sessionStartTime ? 'Reanudar' : 'Iniciar Foco'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 text-base"
          >
            <Pause className="w-5 h-5" />
            <span>Pausar</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reiniciar temporizador"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Distraction / Abandonment Trigger during work mode */}
        {mode === 'work' && isRunning && (
          <button
            onClick={handleTriggerAbandon}
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 active:scale-95 transition-all"
            title="Registrar distracción o abandono por celular"
          >
            <Smartphone className="w-4 h-4 text-rose-400" />
            <span>¡Miré el celular! / Abandonar</span>
          </button>
        )}
      </div>

      {/* Phone Commitment toggle banner */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Regla de oro: Celular con pantalla abajo y en silencio.</span>
        </div>
        <button
          onClick={() => setPhoneShieldActive(!phoneShieldActive)}
          className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline"
        >
          {phoneShieldActive ? 'Blindaje Activo' : 'Activar Blindaje'}
        </button>
      </div>

      {/* MODAL 1: Distracción / Abandono (P0 / M2) */}
      {showDistractionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Registro de Abandono</h3>
                <p className="text-xs text-rose-300">Identificar el distractor es el paso #1 para vencerlo</p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                ¿Qué te interrumpió? (Dato clave para la IA):
              </label>
              <div className="space-y-2">
                {DISTRACTION_OPTIONS.map(opt => (
                  <label
                    key={opt}
                    onClick={() => setSelectedDistraction(opt)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedDistraction === opt
                        ? 'border-rose-500 bg-rose-950/30 text-rose-200 font-medium'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="distraction"
                      checked={selectedDistraction === opt}
                      onChange={() => setSelectedDistraction(opt)}
                      className="accent-rose-500 w-4 h-4"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nota o detalle adicional (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: Vi una notificación de WhatsApp y me colgué 10 min..."
                value={distractionNotes}
                onChange={e => setDistractionNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDistractionModal(false);
                  setIsRunning(true); // continue
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Fue falsa alarma (Continuar)
              </button>
              <button
                onClick={handleConfirmAbandon}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/30"
              >
                Guardar Abandono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Completitud Exitosa (25 min cumplidos) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-emerald-400 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¡25 Minutos de Enfoque Puro!</h3>
                <p className="text-xs text-emerald-300">¡Venciste la tentación del celular en esta sesión!</p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                ¿Cómo sentiste la calidad de tu enfoque?
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['excelente', 'bueno', 'regular'] as const).map(quality => (
                  <button
                    key={quality}
                    onClick={() => setFocusRating(quality)}
                    className={`py-2 px-3 rounded-xl border font-medium capitalize transition-all ${
                      focusRating === quality
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {quality === 'excelente' ? '⚡ Excelente' : quality === 'bueno' ? '👍 Bueno' : '😐 Regular'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                ¿Qué tema lograste avanzar en {activeSubject.name}?
              </label>
              <input
                type="text"
                placeholder="Ej: Resolví 5 problemas de álgebra lineal..."
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleConfirmCompletion}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Sesión e Iniciar 5 min de Descanso</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
