export type SessionStatus = 'completed' | 'abandoned';

export type DistractionCategory = 
  | 'Celular / Redes Sociales (Instagram, TikTok)'
  | 'WhatsApp / Mensajería'
  | 'Notificación o llamada imprevista'
  | 'Pérdida de concentración / Fatiga mental'
  | 'Hambre / Interrupción externa'
  | 'Frustración con el tema / Dificultad'
  | 'Otro motivo';

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string; // Hex color
  startTime: string; // ISO date
  endTime: string; // ISO date
  durationMinutes: number; // Actual minutes completed
  targetMinutes: number; // Target (usually 25)
  status: SessionStatus;
  distractionReason?: DistractionCategory | string;
  notes?: string;
  focusQuality?: 'excelente' | 'bueno' | 'regular' | 'disperso';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  iconName?: string;
}

export interface AiPatternAnalysisResult {
  optimalTimeWindow: {
    start: string;
    end: string;
    periodName: string;
    completionRate: number;
    explanation: string;
  };
  highRiskTimeWindow: {
    start: string;
    end: string;
    periodName: string;
    abandonmentRate: number;
    primaryDistractor: string;
    explanation: string;
  };
  chronotype: string;
  habitScore: number; // 0 - 100
  habitScoreLabel: string;
  cellphoneImpactLevel: 'Bajo' | 'Moderado' | 'Crítico';
  bestSubject: {
    name: string;
    successRate: number;
  };
  challengingSubject: {
    name: string;
    abandonmentRate: number;
  };
  actionableRecommendations: string[];
  executiveSummary: string;
  analyzedAt: string;
  isAiGenerated: boolean;
}

export interface WeekDayStats {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Lun", "Mar", etc.
  dayNumber: number;
  completedCount: number;
  abandonedCount: number;
  totalMinutes: number;
  successRate: number;
  isToday: boolean;
  sessions: StudySession[];
}
