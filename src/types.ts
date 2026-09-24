export type QuestionCategory = 'logica' | 'matematicas' | 'comprension' | 'psicologico';

export type QuestionDifficulty = 'facil' | 'medio' | 'dificil';

export type QuestionType = 'multiple_choice' | 'open_ended';

export type EvaluationGroup = 'A' | 'B' | 'C';

export type ExamStatus = 'APROBADO' | 'DESAPROBADO';

export type AdmissionDecision = 'ADMITIDO' | 'LISTA_ESPERA' | 'NO_ADMITIDO';

export interface Question {
  id: string;
  category: QuestionCategory;
  title: string;
  context?: string;
  type?: QuestionType; // 'multiple_choice' by default or 'open_ended' (free response)
  options?: string[]; // for multiple choice
  correctAnswer?: number; // 0-indexed for multiple choice
  sampleAnswer?: string; // model answer or grading criteria for open_ended
  explanation: string;
  difficulty: QuestionDifficulty;
  targetGroup?: 'ALL' | EvaluationGroup;
  createdAt?: string;
}

export interface Candidate {
  fullName: string;
  documentType: 'CC' | 'TI' | 'CE' | 'PASAPORTE';
  documentNumber: string;
  email: string;
  assignedGroup: EvaluationGroup; // Student cohort group (max 30 students per group)
}

export interface ExamAnswer {
  questionId: string;
  selectedOption?: number; // for multiple choice
  textAnswer?: string; // for open-ended / free response
  isCorrect: boolean;
  score?: number; // 0-100 score for open ended or multiple choice
  feedback?: string; // AI or teacher feedback
  category: QuestionCategory;
}

export interface CategoryScore {
  total: number;
  correct: number;
  percentage: number;
  label: string;
  feedback?: string;
}

export interface ExamResult {
  id: string;
  candidate: Candidate;
  startedAt: string;
  completedAt: string;
  scores: {
    logica: CategoryScore;
    matematicas: CategoryScore;
    comprension: CategoryScore;
    psicologico: CategoryScore;
  };
  overallScore: number; // 0 - 100
  status: ExamStatus; // 'APROBADO' | 'DESAPROBADO'
  admissionDecision?: AdmissionDecision; // Admin decision: 'ADMITIDO' | 'LISTA_ESPERA' | 'NO_ADMITIDO'
  passingScore?: number; // default 70
  performanceTier?: EvaluationGroup; // kept for legacy reference or matches assignedGroup
  aiFeedback: string;
  emailNotification: {
    sent: boolean;
    recipientEmail: string;
    sentAt: string;
    subject: string;
    previewHtml: string;
    statusMessage: string;
  };
  answers: ExamAnswer[];
}

export interface CohortGroupStatus {
  id: EvaluationGroup;
  name: string;
  enrolled: number;
  maxCapacity: number;
  isFull: boolean;
  availableSpots: number;
}

export interface CohortsOverview {
  currentActiveGroup: EvaluationGroup;
  maxPerGroup: number;
  groups: CohortGroupStatus[];
  totalEnrolled: number;
}

export interface SystemStats {
  totalExams: number;
  averageScore: number;
  passingRate: number;
  totalAprobados: number;
  totalDesaprobados: number;
  admissionCounts?: {
    admitidos: number;
    enEspera: number;
    noAdmitidos: number;
  };
  groupCounts: {
    A: number;
    B: number;
    C: number;
  };
  tierCounts?: {
    A: number;
    B: number;
    C: number;
  };
  categoryAverages: {
    logica: number;
    matematicas: number;
    comprension: number;
    psicologico: number;
  };
}
