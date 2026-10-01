import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession, DistractionCategory } from '../types';
import { soundManager, AmbientSoundType } from '../utils/audio';
import { DISTRACTION_OPTIONS } from '../utils/storage';
import { fireConfetti } from '../utils/confetti';
import { FocusTree } from './FocusTree';
import { AmbientSoundSelector } from './AmbientSoundSelector';
import { AntiDistractionSosModal } from './AntiDistractionSosModal';
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
  ShieldCheck,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  CloudRain,
  Waves,
  Wind
} from 'lucide-react';

interface TimerProps {
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  onSaveSession: (session: StudySession) => void;
  totalCompletedSessions: number;
  totalAbandonedSessions: number;
}

type TimerMode = 'work' | 'break';

export const Timer: React.FC<TimerProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onSaveSession,
  totalCompletedSessions,
  totalAbandonedSessions,
}) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [isTestMode, setIsTestMode] = useState(false); // 10s test mode for quick demos
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isZenFullscreen, setIsZenFullscreen] = useState<boolean>(false);
  
  // Anti-cellphone shield state
  const [phoneShieldActive, setPhoneShieldActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientSoundType>('lluvia');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.4);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);

  // Tab switch warning
  const [tabSwitchWarning, setTabSwitchWarning] = useState<string | null>(null);

  // Tree state
  const [treeAbandoned, setTreeAbandoned] = useState<boolean>(false);
  const [treeCompleted, setTreeCompleted] = useState<boolean>(false);

  // Modals
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showDistractionModal, setShowDistractionModal] = useState<boolean>(false);
  const [selectedDistraction, setSelectedDistraction] = useState<DistractionCategory>(
    'Celular / Redes Sociales (Instagram, TikTok)'
  );
  const [distractionNotes, setDistractionNotes] = useState<string>('');

  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [focusRating, setFocusRating] = useState<'excelente' | 'bueno' | 'regular'>('excelente');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tabAwayTimeRef = useRef<number | null>(null);

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
      setTreeAbandoned(false);
      setTreeCompleted(false);
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

  // Active anti-tab switch detection (catches if student leaves to browse Instagram/YouTube/WhatsApp Web)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning || mode !== 'work') return;

      if (document.hidden) {
        tabAwayTimeRef.current = Date.now();
      } else {
        if (tabAwayTimeRef.current) {
          const secondsAway = Math.round((Date.now() - tabAwayTimeRef.current) / 1000);
          tabAwayTimeRef.current = null;
          if (secondsAway >= 3) {
            soundManager.playTabAlert();
            setTabSwitchWarning(
              `🚨 ¡Alerta de Fuga! Saliste de FOCO 25 durante ${secondsAway}s. ¿Fuiste a ver el celular o redes? Mantente en la zona.`
            );
            setTimeout(() => setTabSwitchWarning(null), 7000);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, mode]);

  const handleStart = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning(true);
    setTreeAbandoned(false);
    setTreeCompleted(false);
    soundManager.playStart();
    if (selectedAmbient !== 'none' && soundEnabled) {
      soundManager.startAmbient(selectedAmbient);
      setIsAmbientPlaying(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    setIsAmbientPlaying(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    setIsAmbientPlaying(false);
    setSessionStartTime(null);
    setTimeLeft(getTargetSeconds(mode, isTestMode));
    setTreeAbandoned(false);
    setTreeCompleted(false);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    setIsAmbientPlaying(false);

    if (mode === 'work') {
      setTreeCompleted(true);
      soundManager.playCompleted();
      fireConfetti();
      setShowCompletionModal(true);
    } else {
      soundManager.playBreakFinished();
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
    soundManager.stopAmbient();
    setIsAmbientPlaying(false);
    soundManager.playAbandonAlert();
    setShowDistractionModal(true);
  };

  // Confirm abandonment
  const handleConfirmAbandon = () => {
    const start = sessionStartTime || new Date(Date.now() - (getTargetSeconds(mode, isTestMode) - timeLeft) * 1000);
    const end = new Date();
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));

    setTreeAbandoned(true);

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

  const handleSelectAmbient = (ambient: AmbientSoundType) => {
    setSelectedAmbient(ambient);
    if (ambient === 'none') {
      soundManager.stopAmbient();
      setIsAmbientPlaying(false);
    } else {
      if (soundEnabled) {
        soundManager.startAmbient(ambient);
        setIsAmbientPlaying(true);
      }
    }
  };

  const handleToggleAmbientPlay = () => {
    if (isAmbientPlaying) {
      soundManager.stopAmbient();
      setIsAmbientPlaying(false);
    } else {
      const soundToPlay = selectedAmbient === 'none' ? 'lluvia' : selectedAmbient;
      setSelectedAmbient(soundToPlay);
      if (soundEnabled) {
        soundManager.startAmbient(soundToPlay);
        setIsAmbientPlaying(true);
      }
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundManager.setAmbientVolume(vol);
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

  // Circular gauge math (radius 120, circumference ~ 753.98)
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isZenFullscreen ? 'fixed inset-0 z-50 rounded-none p-8 flex flex-col justify-center max-w-none' : ''
      }`}
    >
      {/* Background ambient light */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
          mode === 'work' ? 'bg-indigo-600/20' : 'bg-emerald-600/20'
        }`}
      />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 bg-cyan-600/10" />

      {/* Tab Switch Escape Alert Banner */}
      {tabSwitchWarning && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-300 relative z-20">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>{tabSwitchWarning}</span>
          </div>
          <button
            onClick={() => setTabSwitchWarning(null)}
            className="text-amber-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Controls: Mode Switcher, Quick 10s Demo, Zen Fullscreen & Sound */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              if (isRunning) return;
              setMode('work');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              mode === 'work'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-bold'
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Descanso 5 min</span>
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          {/* Demo Button */}
          <button
            onClick={() => {
              if (isRunning) return;
              setIsTestMode(!isTestMode);
            }}
            title={isTestMode ? 'Modo rápido 10s activo' : 'Activar prueba rápida de 10s'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border transition-colors ${
              isTestMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTestMode ? '10s Demo' : 'Modo Demo'}</span>
          </button>

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={() => setIsZenFullscreen(!isZenFullscreen)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isZenFullscreen ? 'Salir de pantalla completa' : 'Modo Zen Pantalla Completa'}
          >
            {isZenFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Subject Picker Row */}
      {!isZenFullscreen && (
        <div className="mb-5 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Materia de estudio:</span>
            <span className="text-[11px] text-indigo-400 font-semibold">
              {activeSubject.name} seleccionada
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => {
              const isSelected = sub.id === activeSubject.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubject(sub)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/70 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
      )}

      {/* Main Focus Stage: Circular SVG Gauge with Breathing Glow */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        {/* Anti-cellphone badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 mb-4 shadow-sm">
          <Smartphone className={`w-3.5 h-3.5 ${phoneShieldActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{phoneShieldActive ? '🛡️ Celular Lejos / Pantalla Abajo' : 'Celular cerca'}</span>
        </div>

        {/* Circular Gauge Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Animated concentric pulse when running */}
          {isRunning && (
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-10 pointer-events-none ${
                mode === 'work' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}
              style={{ animationDuration: '3s' }}
            />
          )}

          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background Track */}
            <circle
              cx="140"
              cy="140"
              r={circleRadius}
              className="stroke-slate-950 fill-none"
              strokeWidth="12"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="140"
              cy="140"
              r={circleRadius}
              className={`fill-none transition-all duration-500 ${
                mode === 'work' ? 'stroke-indigo-500' : 'stroke-emerald-500'
              }`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time & Active State in Center */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="text-6xl sm:text-7xl font-black font-mono-numbers tracking-tight text-white drop-shadow-lg select-none">
              {formattedTime}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeSubject.color }}
              />
              <span className="text-white">{activeSubject.name}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-mono-numbers">
              {Math.round(progressPercent)}% transcurrido
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/30 text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{sessionStartTime ? 'Reanudar Foco' : 'Iniciar 25 Minutos'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 text-base shadow-lg"
            >
              <Pause className="w-5 h-5" />
              <span>Pausar</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reiniciar temporizador"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* S.O.S. Micro-Pause Button when studying */}
          {mode === 'work' && isRunning && (
            <button
              onClick={() => {
                setIsRunning(false);
                setShowSosModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 transition-all shadow-sm"
              title="Pausa guiada si tienes ganas de mirar el celular"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>S.O.S. Celular</span>
            </button>
          )}

          {/* Distraction / Abandonment Trigger during work mode */}
          {mode === 'work' && isRunning && (
            <button
              onClick={handleTriggerAbandon}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-all"
              title="Registrar abandono por celular"
            >
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>Abandonar</span>
            </button>
          )}
        </div>
      </div>

      {/* Ambient Sound Selector (Lluvia, Ruido Blanco, Café) */}
      {!isZenFullscreen && (
        <div className="mt-5 relative z-10">
          <AmbientSoundSelector
            currentSound={selectedAmbient}
            isPlaying={isAmbientPlaying}
            volume={ambientVolume}
            onSelectSound={handleSelectAmbient}
            onTogglePlay={handleToggleAmbientPlay}
            onVolumeChange={handleAmbientVolumeChange}
            isSessionRunning={isRunning}
          />
        </div>
      )}

      {/* Gamified Focus Tree & Forest Progress */}
      {!isZenFullscreen && (
        <div className="mt-4 relative z-10">
          <FocusTree
            progressPercent={progressPercent}
            isRunning={isRunning}
            isCompleted={treeCompleted}
            isAbandoned={treeAbandoned}
            totalCompletedSessions={totalCompletedSessions}
            totalAbandonedSessions={totalAbandonedSessions}
          />
        </div>
      )}

      {/* MODAL 1: S.O.S. Tentación Celular */}
      <AntiDistractionSosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        onOvercomeTemptation={() => {
          setShowSosModal(false);
          setIsRunning(true);
        }}
        onConfirmAbandon={() => {
          setShowSosModal(false);
          handleConfirmAbandon();
        }}
      />

      {/* MODAL 2: Distracción / Abandono */}
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
                  setIsRunning(true);
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

      {/* MODAL 3: Completitud Exitosa (25 min cumplidos) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-emerald-400 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¡25 Minutos de Enfoque Puro!</h3>
                <p className="text-xs text-emerald-300">¡Tu árbol de concentración ha florecido y sumas +25 XP!</p>
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
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold'
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
                <span>Guardar Árbol Florecido e Iniciar 5 min de Descanso</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
