import { StudySession, Subject, DistractionCategory, AiPatternAnalysisResult } from '../types';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-mat', name: 'Matemáticas', color: '#4f46e5' },
  { id: 'sub-prog', name: 'Programación / Código', color: '#059669' },
  { id: 'sub-hist', name: 'Historia & Sociales', color: '#d97706' },
  { id: 'sub-fis', name: 'Física & Química', color: '#7c3aed' },
  { id: 'sub-ing', name: 'Idiomas / Inglés', color: '#e11d48' },
];

export const DISTRACTION_OPTIONS: DistractionCategory[] = [
  'Celular / Redes Sociales (Instagram, TikTok)',
  'WhatsApp / Mensajería',
  'Notificación o llamada imprevista',
  'Pérdida de concentración / Fatiga mental',
  'Hambre / Interrupción externa',
  'Frustración con el tema / Dificultad',
  'Otro motivo',
];

const STORAGE_KEYS = {
  SESSIONS: 'foco25_sessions_v1',
  SUBJECTS: 'foco25_subjects_v1',
  AI_CACHE: 'foco25_ai_analysis_cache_v1',
};

// Generate realistic mock history for the current week so charts and AI analysis shine immediately
export function generateSeedSessions(): StudySession[] {
  const now = new Date();
  const sessions: StudySession[] = [];
  
  // Calculate Monday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const subjects = DEFAULT_SUBJECTS;

  // Patterns designed to reveal clear peak focus window:
  // - Morning (08:30 - 11:30): very high completion (90%+)
  // - Afternoon (15:00 - 18:30): high cellphone distraction & abandonment (60%+)
  // - Evening (20:00 - 21:30): moderate completion
  
  const mockTemplates = [
    // Lunes
    { dayOffset: 0, hour: 8, min: 30, dur: 25, status: 'completed', subIdx: 0, notes: 'Cálculo integral, muy concentrado' },
    { dayOffset: 0, hour: 9, min: 15, dur: 25, status: 'completed', subIdx: 0, notes: 'Resolución de problemas' },
    { dayOffset: 0, hour: 16, min: 0, dur: 12, status: 'abandoned', subIdx: 1, reason: 'Celular / Redes Sociales (Instagram, TikTok)', notes: 'Miré un video de TikTok y perdí el hilo' },
    { dayOffset: 0, hour: 17, min: 15, dur: 8, status: 'abandoned', subIdx: 2, reason: 'WhatsApp / Mensajería', notes: 'Mensajes en el grupo de amigos' },
    
    // Martes
    { dayOffset: 1, hour: 8, min: 45, dur: 25, status: 'completed', subIdx: 1, notes: 'Estructuras de datos en TypeScript' },
    { dayOffset: 1, hour: 9, min: 30, dur: 25, status: 'completed', subIdx: 1, notes: 'Algoritmos de grafos' },
    { dayOffset: 1, hour: 10, min: 20, dur: 25, status: 'completed', subIdx: 3, notes: 'Leyes de Newton' },
    { dayOffset: 1, hour: 16, min: 30, dur: 14, status: 'abandoned', subIdx: 2, reason: 'Celular / Redes Sociales (Instagram, TikTok)', notes: 'Scroll infinito en Instagram' },
    { dayOffset: 1, hour: 20, min: 15, dur: 25, status: 'completed', subIdx: 4, notes: 'Vocabulario B2 inglés' },

    // Miércoles
    { dayOffset: 2, hour: 9, min: 0, dur: 25, status: 'completed', subIdx: 0, notes: 'Matrices y vectores' },
    { dayOffset: 2, hour: 10, min: 0, dur: 25, status: 'completed', subIdx: 1, notes: 'API REST backend' },
    { dayOffset: 2, hour: 11, min: 0, dur: 25, status: 'completed', subIdx: 3, notes: 'Termodinámica' },
    { dayOffset: 2, hour: 15, min: 45, dur: 9, status: 'abandoned', subIdx: 2, reason: 'Notificación o llamada imprevista', notes: 'Llamada familiar' },
    { dayOffset: 2, hour: 17, min: 0, dur: 11, status: 'abandoned', subIdx: 0, reason: 'Celular / Redes Sociales (Instagram, TikTok)', notes: 'Revisé Twitter/X 10 minutos' },

    // Jueves
    { dayOffset: 3, hour: 8, min: 30, dur: 25, status: 'completed', subIdx: 1, notes: 'Frontend React & hooks' },
    { dayOffset: 3, hour: 9, min: 30, dur: 25, status: 'completed', subIdx: 0, notes: 'Ecuaciones diferenciales' },
    { dayOffset: 3, hour: 16, min: 20, dur: 15, status: 'abandoned', subIdx: 4, reason: 'Celular / Redes Sociales (Instagram, TikTok)', notes: 'Notificación de reels' },
    { dayOffset: 3, hour: 20, min: 0, dur: 25, status: 'completed', subIdx: 2, notes: 'Historia contemporánea' },

    // Viernes
    { dayOffset: 4, hour: 9, min: 15, dur: 25, status: 'completed', subIdx: 1, notes: 'Deploy y configuración de base de datos' },
    { dayOffset: 4, hour: 10, min: 30, dur: 25, status: 'completed', subIdx: 3, notes: 'Circuitos eléctricos' },
    { dayOffset: 4, hour: 18, min: 0, dur: 6, status: 'abandoned', subIdx: 0, reason: 'Pérdida de concentración / Fatiga mental', notes: 'Cansancio del viernes' },
  ];

  mockTemplates.forEach((item, index) => {
    const sessionDate = new Date(monday);
    sessionDate.setDate(monday.getDate() + item.dayOffset);
    sessionDate.setHours(item.hour, item.min, 0, 0);

    // Only add if it's not in the future beyond today
    if (sessionDate.getTime() <= now.getTime()) {
      const endD = new Date(sessionDate.getTime() + item.dur * 60 * 1000);
      const sub = subjects[item.subIdx % subjects.length];

      sessions.push({
        id: `seed-session-${index + 1}`,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectColor: sub.color,
        startTime: sessionDate.toISOString(),
        endTime: endD.toISOString(),
        durationMinutes: item.dur,
        targetMinutes: 25,
        status: item.status as 'completed' | 'abandoned',
        distractionReason: item.reason,
        notes: item.notes,
        focusQuality: item.status === 'completed' ? 'excelente' : 'disperso',
      });
    }
  });

  return sessions;
}

export function getSavedSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      const initial = generateSeedSessions();
      saveSessions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading sessions from storage:', err);
    return [];
  }
}

export function saveSessions(sessions: StudySession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

export function getSavedSubjects(): Subject[] {
  if (typeof window === 'undefined') return DEFAULT_SUBJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading subjects from storage:', err);
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.error('Error saving subjects:', err);
  }
}

export function getCachedAiAnalysis(): AiPatternAnalysisResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedAiAnalysis(data: AiPatternAnalysisResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(data));
  } catch (err) {
    console.error('Error caching AI analysis:', err);
  }
}
