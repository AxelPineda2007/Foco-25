import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldAlert, Sparkles, CheckCircle2, XCircle, HeartHandshake } from 'lucide-react';

interface AntiDistractionSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOvercomeTemptation: () => void;
  onConfirmAbandon: () => void;
}

export const AntiDistractionSosModal: React.FC<AntiDistractionSosModalProps> = ({
  isOpen,
  onClose,
  onOvercomeTemptation,
  onConfirmAbandon,
}) => {
  const [seconds, setSeconds] = useState(60);
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');

  useEffect(() => {
    if (!isOpen) {
      setSeconds(60);
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // 4-7-8 breathing loop (19 seconds cycle)
    const breathTimer = setInterval(() => {
      const cycleTime = (60 - seconds) % 19;
      if (cycleTime < 4) {
        setBreathPhase('Inhala');
      } else if (cycleTime < 11) {
        setBreathPhase('Sostén');
      } else {
        setBreathPhase('Exhala');
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(breathTimer);
    };
  }, [isOpen, seconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Pausa de Emergencia Anti-Celular
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Micro-tregua de 60 segundos para rescatar tu atención y dopamina
            </p>
          </div>
        </div>

        {/* Breathing Circle Visualizer */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 transition-colors duration-300">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Animated breathing expansion ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                breathPhase === 'Inhala'
                  ? 'border-indigo-500 scale-110 bg-indigo-500/10'
                  : breathPhase === 'Sostén'
                  ? 'border-amber-500 scale-100 bg-amber-500/10'
                  : 'border-emerald-500 scale-90 bg-emerald-500/10'
              }`}
            />
            <div className="text-center z-10">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
                {breathPhase}
              </span>
              <span className="text-xs font-mono-numbers text-slate-500 dark:text-slate-400">
                {seconds}s de tregua
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Técnica 4-7-8 para calmar la urgencia impulsiva de dopamina
          </p>
        </div>

        {/* Reality Check Cognitive Reframes */}
        <div className="space-y-2 mb-5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex items-start gap-2 transition-colors duration-300">
            <span className="text-amber-600 dark:text-amber-400 font-bold">1.</span>
            <span>
              <strong>El costo real:</strong> Tocar el teléfono ahora reiniciará tu curva de concentración y tu cerebro tardará <strong>23 minutos</strong> en volver al mismo nivel de profundidad.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex items-start gap-2 transition-colors duration-300">
            <span className="text-amber-600 dark:text-amber-400 font-bold">2.</span>
            <span>
              <strong>Falsa urgencia:</strong> Ningún mensaje de redes o notificación cambiará tu vida en los próximos 15 minutos.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex items-start gap-2 transition-colors duration-300">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">3.</span>
            <span>
              <strong>La recompensa:</strong> Al completar este bloque de 25m, tendrás <strong>5 minutos de descanso libre</strong> con la satisfacción de haber vencido la tentación.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={onOvercomeTemptation}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Vencí la Tentación! Volver a Estudiar</span>
          </button>

          <button
            onClick={onConfirmAbandon}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-white bg-rose-50 dark:bg-slate-950 hover:bg-rose-100 dark:hover:bg-rose-950 border border-rose-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
          >
            No pude resistir (Abandonar)
          </button>
        </div>
      </div>
    </div>
  );
};
