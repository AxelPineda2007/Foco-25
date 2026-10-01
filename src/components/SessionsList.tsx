import React, { useState } from 'react';
import { StudySession, Subject, SessionStatus } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Plus, 
  Filter, 
  Download, 
  RotateCcw,
  Smartphone,
  Calendar,
  Clock,
  Search
} from 'lucide-react';
import { DISTRACTION_OPTIONS } from '../utils/storage';

interface SessionsListProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onAddManualSession: (session: StudySession) => void;
  onResetSampleData: () => void;
  onClearAll: () => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  subjects,
  onDeleteSession,
  onAddManualSession,
  onResetSampleData,
  onClearAll,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Manual session form state
  const [manualSubjectId, setManualSubjectId] = useState<string>(subjects[0]?.id || '');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState<string>('10:00');
  const [manualDuration, setManualDuration] = useState<number>(25);
  const [manualStatus, setManualStatus] = useState<SessionStatus>('completed');
  const [manualDistraction, setManualDistraction] = useState<string>(DISTRACTION_OPTIONS[0]);
  const [manualNotes, setManualNotes] = useState<string>('');

  // Filtered sessions
  const filteredSessions = sessions.filter(session => {
    if (selectedSubjectId !== 'all' && session.subjectId !== selectedSubjectId) return false;
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = session.subjectName.toLowerCase().includes(q);
      const matchNotes = session.notes?.toLowerCase().includes(q) || false;
      const matchDistraction = session.distractionReason?.toLowerCase().includes(q) || false;
      if (!matchSubject && !matchNotes && !matchDistraction) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find(s => s.id === manualSubjectId) || subjects[0];
    const startDateTime = new Date(`${manualDate}T${manualTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + manualDuration * 60 * 1000);

    const newSession: StudySession = {
      id: `manual-${Date.now()}`,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectColor: sub.color,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      durationMinutes: manualDuration,
      targetMinutes: 25,
      status: manualStatus,
      distractionReason: manualStatus === 'abandoned' ? manualDistraction : undefined,
      notes: manualNotes.trim() || undefined,
      focusQuality: manualStatus === 'completed' ? 'bueno' : 'disperso',
    };

    onAddManualSession(newSession);
    setShowManualModal(false);
    setManualNotes('');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foco25_sesiones_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Registro de Sesiones por Materia</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial con fecha, hora, materia y causa de abandono
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Manual</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Exportar respaldo JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <button
            onClick={onResetSampleData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Restaurar datos de ejemplo de la semana"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Semana Demo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
        {/* Subject Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Filtrar por Materia:</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las Materias ({sessions.length})</option>
            {subjects.map(sub => {
              const count = sessions.filter(s => s.subjectId === sub.id).length;
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Filtrar por Estado:</label>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 text-center rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex-1 py-1 text-center rounded-lg transition-colors ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completadas
            </button>
            <button
              onClick={() => setStatusFilter('abandoned')}
              className={`flex-1 py-1 text-center rounded-lg transition-colors ${
                statusFilter === 'abandoned' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Abandonadas
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Buscar en notas o distractor:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar tema, palabra clave..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table / List */}
      <div className="overflow-x-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No se encontraron sesiones con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map(session => {
              const d = new Date(session.startTime);
              const dateStr = d.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const timeStr = d.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isCompleted = session.status === 'completed';

              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
                >
                  {/* Left: Subject & Date */}
                  <div className="flex items-start gap-3 min-w-[200px]">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: session.subjectColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{session.subjectName}</span>
                        {session.focusQuality && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {session.focusQuality}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{dateStr}</span>
                        <span>•</span>
                        <span className="font-mono-numbers">{timeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Notes & Distraction reason */}
                  <div className="flex-1 text-xs">
                    {session.notes && (
                      <p className="text-slate-300 text-xs italic">
                        "{session.notes}"
                      </p>
                    )}
                    {session.distractionReason && (
                      <div className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1">
                        <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Distractor: {session.distractionReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Duration, Status & Delete button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono-numbers font-bold text-white">
                        {session.durationMinutes} min
                        <span className="text-[10px] text-slate-500 font-normal"> / {session.targetMinutes}m</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          isCompleted ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Completada
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Abandonada
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Session Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Registrar Sesión Manual</h3>
            <p className="text-xs text-slate-400 mb-4">
              Registra una sesión que estudiaste fuera de la app para incluirla en el análisis.
            </p>

            <form onSubmit={handleCreateManualSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Materia:</label>
                <select
                  value={manualSubjectId}
                  onChange={e => setManualSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Hora de Inicio:</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Duración (minutos):</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={manualDuration}
                    onChange={e => setManualDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Resultado:</label>
                  <select
                    value={manualStatus}
                    onChange={e => setManualStatus(e.target.value as SessionStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="completed">Completada (25 min)</option>
                    <option value="abandoned">Abandonada antes de tiempo</option>
                  </select>
                </div>
              </div>

              {manualStatus === 'abandoned' && (
                <div>
                  <label className="block text-rose-300 mb-1">Motivo de distracción:</label>
                  <select
                    value={manualDistraction}
                    onChange={e => setManualDistraction(e.target.value)}
                    className="w-full bg-slate-950 border border-rose-900 rounded-xl px-3 py-2 text-rose-200"
                  >
                    {DISTRACTION_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Notas / Tema estudiado:</label>
                <input
                  type="text"
                  placeholder="Ej: Repasé ejercicios para el parcial..."
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Guardar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
