import React, { useState, useEffect } from 'react';
import { StudySession, Subject, AiPatternAnalysisResult } from './types';
import { 
  getSavedSessions, 
  saveSessions, 
  getSavedSubjects, 
  saveSubjects, 
  getCachedAiAnalysis, 
  saveCachedAiAnalysis, 
  generateSeedSessions,
  DEFAULT_SUBJECTS 
} from './utils/storage';
import { StatsCards } from './components/StatsCards';
import { Timer } from './components/Timer';
import { WeeklyChart } from './components/WeeklyChart';
import { AiPatternAnalysis } from './components/AiPatternAnalysis';
import { SessionsList } from './components/SessionsList';
import { SubjectManagerModal } from './components/SubjectManagerModal';
import { GitHubModal } from './components/GitHubModal';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './utils/theme';
import { 
  Brain, 
  Smartphone, 
  Github, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [activeSubject, setActiveSubject] = useState<Subject>(DEFAULT_SUBJECTS[0]);
  const [aiAnalysis, setAiAnalysis] = useState<AiPatternAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data from local storage
  useEffect(() => {
    const loadedSubjects = getSavedSubjects();
    setSubjects(loadedSubjects);
    if (loadedSubjects.length > 0) {
      setActiveSubject(loadedSubjects[0]);
    }

    const loadedSessions = getSavedSessions();
    setSessions(loadedSessions);

    const cachedAi = getCachedAiAnalysis();
    if (cachedAi) {
      setAiAnalysis(cachedAi);
    } else if (loadedSessions.length > 0) {
      // Auto run first analysis in background
      triggerAiAnalysis(loadedSessions);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSession = (newSession: StudySession) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    
    if (newSession.status === 'completed') {
      showToast(`¡Sesión completada en ${newSession.subjectName}! 25 min de foco puro.`);
    } else {
      showToast(`Sesión abandonada registrada. ¡La próxima será mejor!`);
    }

    // Trigger AI analysis update when a session finishes
    triggerAiAnalysis(updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    showToast('Sesión eliminada');
  };

  const handleResetSampleData = () => {
    const seed = generateSeedSessions();
    setSessions(seed);
    saveSessions(seed);
    triggerAiAnalysis(seed);
    showToast('Datos de ejemplo de la semana restaurados');
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas reiniciar todo el historial de sesiones?')) {
      setSessions([]);
      saveSessions([]);
      setAiAnalysis(null);
      localStorage.removeItem('foco25_ai_analysis_cache_v1');
      showToast('Historial limpiado');
    }
  };

  const handleAddSubject = (newSub: Subject) => {
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
    setActiveSubject(newSub);
    showToast(`Materia "${newSub.name}" agregada`);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    saveSubjects(updated);
    if (activeSubject.id === id) {
      setActiveSubject(updated[0]);
    }
    showToast('Materia eliminada');
  };

  // AI analysis fetcher
  const triggerAiAnalysis = async (sessionList = sessions) => {
    if (sessionList.length === 0) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/analyze-habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: sessionList }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: AiPatternAnalysisResult = await res.json();
      setAiAnalysis(data);
      saveCachedAiAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze habits via API:', err);
      // Fallback is handled automatically inside backend service or if offline
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-indigo-400/40">
            <CheckCircle className="w-4 h-4 text-indigo-200" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Value Proposition */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white font-black text-lg">
              25
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">FOCO 25</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 uppercase">
                  Anti-Celular
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
                Temporizador 25/5 • Hábitos de estudio • Análisis horario con IA
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Oscuro / Claro) */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-colors duration-300"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">Materias ({subjects.length})</span>
            </button>

            <button
              onClick={() => setIsGithubModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Ver commit y comandos para GitHub"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Anti-Cell Problem Statement Banner */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Objetivo: Vencer el estudio con el celular en la mano</span>
              <span className="text-slate-600 dark:text-slate-400">
                Cada 25 minutos sin celular entrena tu cerebro para retener el doble. Registra tus abandonos con honestidad para que la IA detecte tus horas de oro.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Sesiones registradas: <strong className="text-slate-900 dark:text-white">{sessions.length}</strong></span>
          </div>
        </div>

        {/* Dato clave que maneja: Sesiones completadas vs abandonadas (M2) */}
        <StatsCards sessions={sessions} />

        {/* Daily Focus Goal Bar */}
        <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-600/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Meta de Enfoque Diario: 4 Sesiones (100 min)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
                  {sessions.filter(s => s.status === 'completed' && s.startTime.split('T')[0] === new Date().toISOString().split('T')[0]).length} / 4 Hoy
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Cumplir 4 bloques diarios de 25 minutos sin celular equivale a duplicar tu retención académica semanal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[1, 2, 3, 4].map(idx => {
              const todayCompleted = sessions.filter(s => s.status === 'completed' && s.startTime.split('T')[0] === new Date().toISOString().split('T')[0]).length;
              const isFilled = idx <= todayCompleted;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                    isFilled
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800'
                  }`}
                  title={isFilled ? `Bloque ${idx} completado` : `Bloque ${idx} pendiente`}
                >
                  {isFilled ? '✓' : idx}
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Row: Timer (P0) & AI Pattern Analysis (M5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timer */}
          <div className="lg:col-span-5 flex flex-col">
            <Timer
              subjects={subjects}
              activeSubject={activeSubject}
              onSelectSubject={setActiveSubject}
              onSaveSession={handleSaveSession}
              totalCompletedSessions={sessions.filter(s => s.status === 'completed').length}
              totalAbandonedSessions={sessions.filter(s => s.status === 'abandoned').length}
            />
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-7 flex flex-col">
            <AiPatternAnalysis
              sessions={sessions}
              analysis={aiAnalysis}
              onRefreshAnalysis={() => triggerAiAnalysis()}
              isLoading={isAiLoading}
            />
          </div>
        </div>

        {/* Weekly Chart: Gráfico de la semana (P0 / M1) */}
        <WeeklyChart sessions={sessions} />

        {/* Sessions History Table: Registro por materia (P0) */}
        <SessionsList
          sessions={sessions}
          subjects={subjects}
          onDeleteSession={handleDeleteSession}
          onAddManualSession={handleSaveSession}
          onResetSampleData={handleResetSampleData}
          onClearAll={handleClearAll}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950 py-6 text-center text-xs text-slate-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-400">FOCO 25 • Hábitos de estudio para estudiantes enfocados</span>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsGithubModalOpen(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Repositorio GitHub & Primer Commit
            </button>
            <span>•</span>
            <button
              onClick={handleResetSampleData}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Cargar datos demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubjectManagerModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <GitHubModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />
    </div>
  );
}
