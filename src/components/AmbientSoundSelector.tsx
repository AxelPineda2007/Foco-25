import React from 'react';
import { AmbientSoundType, soundManager } from '../utils/audio';
import { 
  CloudRain, 
  Waves, 
  Coffee, 
  Radio, 
  VolumeX, 
  Volume2, 
  Play, 
  Square,
  Sparkles
} from 'lucide-react';

interface AmbientSoundSelectorProps {
  currentSound: AmbientSoundType;
  isPlaying: boolean;
  volume: number;
  onSelectSound: (sound: AmbientSoundType) => void;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
  isSessionRunning?: boolean;
}

export const AMBIENT_SOUND_OPTIONS: Array<{
  id: AmbientSoundType;
  name: string;
  shortDesc: string;
  icon: typeof CloudRain;
  color: string;
  badge: string;
}> = [
  {
    id: 'lluvia',
    name: 'Lluvia',
    shortDesc: 'Gotas suaves y lluvia constante para relajar la mente',
    icon: CloudRain,
    color: '#06b6d4', // Cyan
    badge: 'Popular',
  },
  {
    id: 'ruidoblanco',
    name: 'Ruido Blanco',
    shortDesc: 'Enmascara conversaciones y ruidos repentinos',
    icon: Waves,
    color: '#6366f1', // Indigo
    badge: 'Lectura',
  },
  {
    id: 'cafe',
    name: 'Café',
    shortDesc: 'Murmullo acogedor de cafetería con sutiles tazas',
    icon: Coffee,
    color: '#f59e0b', // Amber
    badge: 'Ambiente',
  },
  {
    id: 'binaural',
    name: 'Ondas 40Hz',
    shortDesc: 'Frecuencia gamma binaural para concentración aguda',
    icon: Radio,
    color: '#8b5cf6', // Purple
    badge: 'Foco Alpha',
  },
];

export const AmbientSoundSelector: React.FC<AmbientSoundSelectorProps> = ({
  currentSound,
  isPlaying,
  volume,
  onSelectSound,
  onTogglePlay,
  onVolumeChange,
  isSessionRunning,
}) => {
  return (
    <div className="bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm transition-colors duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Sonidos de Ambiente (Sesión 25 min)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Lluvia, Ruido Blanco y Café para bloquear el mundo exterior
            </span>
          </div>
        </div>

        {/* Volume & Master Play Controls */}
        <div className="flex items-center gap-2.5">
          {currentSound !== 'none' && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono-numbers">
                {Math.round(volume * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => onVolumeChange(Number(e.target.value))}
                className="w-16 accent-indigo-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                title="Volumen del sonido de ambiente"
              />
            </div>
          )}

          {currentSound !== 'none' && (
            <button
              onClick={onTogglePlay}
              className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold px-2.5 ${
                isPlaying
                  ? 'bg-emerald-500/10 dark:bg-emerald-600/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm'
              }`}
              title={isPlaying ? 'Pausar sonido de fondo' : 'Reproducir sonido de fondo'}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span className="text-[11px]">Sonando</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span className="text-[11px]">Escuchar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sound Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {AMBIENT_SOUND_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isSelected = currentSound === opt.id;
          const isCurrentlyActive = isSelected && isPlaying;

          return (
            <button
              key={opt.id}
              onClick={() => onSelectSound(opt.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative group overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/80 shadow-sm'
              }`}
            >
              {/* Active Soundwave Animation bars when playing */}
              {isCurrentlyActive && (
                <div className="absolute right-2.5 top-2.5 flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse delay-150" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="p-1.5 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${opt.color}15`,
                    color: opt.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {opt.name}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                {opt.shortDesc}
              </p>

              <span
                className="mt-2 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold"
                style={{
                  backgroundColor: `${opt.color}15`,
                  color: opt.color,
                }}
              >
                {opt.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mute / None option */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
        <button
          onClick={() => onSelectSound('none')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            currentSound === 'none'
              ? 'text-slate-900 dark:text-white font-semibold bg-slate-200/80 dark:bg-slate-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>Silencio (Sin sonido de ambiente)</span>
        </button>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
          {isSessionRunning ? '✓ Se reproduce durante tus 25 min de foco' : 'Activo al iniciar el temporizador'}
        </span>
      </div>
    </div>
  );
};
