import fs from 'fs';
import path from 'path';
import { Question, ExamResult, SystemStats, EvaluationGroup, AdmissionDecision } from '../src/types';
import { defaultQuestions } from './defaultQuestions';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  questions: Question[];
  results: ExamResult[];
  adminPassword?: string;
  lastUpdated: string;
}

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ADSO2025*';

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      questions: defaultQuestions,
      results: [],
      adminPassword: DEFAULT_ADMIN_PASSWORD,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length < 20) {
      // Merge in default 40 questions if database has fewer
      parsed.questions = defaultQuestions;
      saveDb(parsed);
    }
    if (!parsed.results || !Array.isArray(parsed.results)) {
      parsed.results = [];
    }
    if (!parsed.adminPassword) {
      parsed.adminPassword = DEFAULT_ADMIN_PASSWORD;
      saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, reinitializing with defaults:', err);
    const initialData: DatabaseSchema = {
      questions: defaultQuestions,
      results: [],
      adminPassword: DEFAULT_ADMIN_PASSWORD,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function checkAdminPassword(password: string): boolean {
  const db = ensureDbExists();
  const currentPassword = db.adminPassword || DEFAULT_ADMIN_PASSWORD;
  return password === currentPassword;
}

export function setAdminPassword(newPassword: string): void {
  const db = ensureDbExists();
  db.adminPassword = newPassword;
  saveDb(db);
}


function saveDb(data: DatabaseSchema): void {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Question operations
export function getQuestions(): Question[] {
  const db = ensureDbExists();
  return db.questions;
}

export function getQuestionById(id: string): Question | undefined {
  const db = ensureDbExists();
  return db.questions.find((q) => q.id === id);
}

export function saveQuestion(question: Question): Question {
  const db = ensureDbExists();
  const index = db.questions.findIndex((q) => q.id === question.id);
  if (index >= 0) {
    db.questions[index] = { ...question };
  } else {
    db.questions.push({ ...question, createdAt: new Date().toISOString() });
  }
  saveDb(db);
  return question;
}

export function deleteQuestion(id: string): boolean {
  const db = ensureDbExists();
  const initialLength = db.questions.length;
  db.questions = db.questions.filter((q) => q.id !== id);
  if (db.questions.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

export function addQuestionsBatch(newQuestions: Question[]): { added: number; total: number } {
  const db = ensureDbExists();
  let count = 0;
  for (const q of newQuestions) {
    if (!q.id) {
      q.id = 'q-' + Math.random().toString(36).substring(2, 9);
    }
    const idx = db.questions.findIndex((existing) => existing.id === q.id);
    if (idx >= 0) {
      db.questions[idx] = q;
    } else {
      db.questions.push(q);
      count++;
    }
  }
  saveDb(db);
  return { added: count, total: db.questions.length };
}

export function resetQuestionsToDefault(): Question[] {
  const db = ensureDbExists();
  db.questions = [...defaultQuestions];
  saveDb(db);
  return db.questions;
}

// Result operations
export function getResults(): ExamResult[] {
  const db = ensureDbExists();
  return db.results;
}

export function getResultById(id: string): ExamResult | undefined {
  const db = ensureDbExists();
  return db.results.find((r) => r.id === id);
}

export function saveResult(result: ExamResult): ExamResult {
  const db = ensureDbExists();
  const idx = db.results.findIndex((r) => r.id === result.id);
  if (idx >= 0) {
    db.results[idx] = result;
  } else {
    db.results.unshift(result); // Put latest at beginning
  }
  saveDb(db);
  return result;
}

export function deleteResult(id: string): boolean {
  const db = ensureDbExists();
  const initialLength = db.results.length;
  db.results = db.results.filter((r) => r.id !== id);
  if (db.results.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

export function updateAdmissionDecision(id: string, decision: AdmissionDecision): ExamResult | null {
  const db = ensureDbExists();
  const idx = db.results.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  db.results[idx].admissionDecision = decision;
  saveDb(db);
  return db.results[idx];
}

export function getResultByDocumentNumber(docNumber: string): ExamResult | undefined {
  const db = ensureDbExists();
  const clean = docNumber.trim().toLowerCase();
  return db.results.find((r) => r.candidate?.documentNumber?.trim().toLowerCase() === clean);
}

export const MAX_STUDENTS_PER_GROUP = 30;

// Cohort Group status helper (groups with max 30 students each)
export function getCohortsOverview() {
  const db = ensureDbExists();
  const counts: Record<EvaluationGroup, number> = { A: 0, B: 0, C: 0 };

  for (const r of db.results) {
    const grp = r.candidate?.assignedGroup as EvaluationGroup;
    if (grp && counts[grp] !== undefined) {
      counts[grp]++;
    }
  }

  // Next active group according to capacity
  let currentActiveGroup: EvaluationGroup = 'A';
  if (counts.A >= MAX_STUDENTS_PER_GROUP && counts.B < MAX_STUDENTS_PER_GROUP) {
    currentActiveGroup = 'B';
  } else if (counts.A >= MAX_STUDENTS_PER_GROUP && counts.B >= MAX_STUDENTS_PER_GROUP) {
    currentActiveGroup = 'C';
  }

  const groups = [
    {
      id: 'A' as EvaluationGroup,
      name: 'Grupo A',
      enrolled: counts.A,
      enrolledCount: counts.A,
      maxCapacity: MAX_STUDENTS_PER_GROUP,
      isFull: counts.A >= MAX_STUDENTS_PER_GROUP,
      availableSpots: Math.max(0, MAX_STUDENTS_PER_GROUP - counts.A),
    },
    {
      id: 'B' as EvaluationGroup,
      name: 'Grupo B',
      enrolled: counts.B,
      enrolledCount: counts.B,
      maxCapacity: MAX_STUDENTS_PER_GROUP,
      isFull: counts.B >= MAX_STUDENTS_PER_GROUP,
      availableSpots: Math.max(0, MAX_STUDENTS_PER_GROUP - counts.B),
    },
    {
      id: 'C' as EvaluationGroup,
      name: 'Grupo C',
      enrolled: counts.C,
      enrolledCount: counts.C,
      maxCapacity: MAX_STUDENTS_PER_GROUP,
      isFull: counts.C >= MAX_STUDENTS_PER_GROUP,
      availableSpots: Math.max(0, MAX_STUDENTS_PER_GROUP - counts.C),
    },
  ];

  return {
    currentActiveGroup,
    maxPerGroup: MAX_STUDENTS_PER_GROUP,
    groups,
    cohorts: {
      A: groups[0],
      B: groups[1],
      C: groups[2],
    },
    totalEnrolled: counts.A + counts.B + counts.C,
  };
}

// System Stats
export function calculateStats(): SystemStats {
  const db = ensureDbExists();
  const results = db.results;

  const totalExams = results.length;
  if (totalExams === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      passingRate: 0,
      totalAprobados: 0,
      totalDesaprobados: 0,
      groupCounts: { A: 0, B: 0, C: 0 },
      categoryAverages: { logica: 0, matematicas: 0, comprension: 0, psicologico: 0 },
    };
  }

  let totalScoreSum = 0;
  let totalAprobados = 0;
  let totalDesaprobados = 0;
  const admissionCounts = { admitidos: 0, enEspera: 0, noAdmitidos: 0 };
  const groupCounts = { A: 0, B: 0, C: 0 };
  const tierCounts = { A: 0, B: 0, C: 0 };

  const catSums = { logica: 0, matematicas: 0, comprension: 0, psicologico: 0 };
  const catCounts = { logica: 0, matematicas: 0, comprension: 0, psicologico: 0 };

  for (const r of results) {
    totalScoreSum += r.overallScore;

    // Aprobado if overallScore >= 70 or status is explicit APROBADO
    const isApproved = r.status === 'APROBADO' || (r.overallScore >= 70 && r.status !== 'DESAPROBADO');
    if (isApproved) {
      totalAprobados++;
    } else {
      totalDesaprobados++;
    }

    // Admission status
    const decision = r.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO');
    if (decision === 'ADMITIDO') admissionCounts.admitidos++;
    else if (decision === 'LISTA_ESPERA') admissionCounts.enEspera++;
    else if (decision === 'NO_ADMITIDO') admissionCounts.noAdmitidos++;

    const grp = r.candidate?.assignedGroup as EvaluationGroup;
    if (grp && groupCounts[grp] !== undefined) {
      groupCounts[grp]++;
    }

    const tier = (r.performanceTier || grp) as EvaluationGroup;
    if (tier && tierCounts[tier] !== undefined) {
      tierCounts[tier]++;
    }

    if (r.scores?.logica) {
      catSums.logica += r.scores.logica.percentage;
      catCounts.logica++;
    }
    if (r.scores?.matematicas) {
      catSums.matematicas += r.scores.matematicas.percentage;
      catCounts.matematicas++;
    }
    if (r.scores?.comprension) {
      catSums.comprension += r.scores.comprension.percentage;
      catCounts.comprension++;
    }
    if (r.scores?.psicologico) {
      catSums.psicologico += r.scores.psicologico.percentage;
      catCounts.psicologico++;
    }
  }

  return {
    totalExams,
    averageScore: Math.round(totalScoreSum / totalExams),
    passingRate: Math.round((totalAprobados / totalExams) * 100),
    totalAprobados,
    totalDesaprobados,
    admissionCounts,
    groupCounts,
    tierCounts,
    categoryAverages: {
      logica: catCounts.logica > 0 ? Math.round(catSums.logica / catCounts.logica) : 0,
      matematicas: catCounts.matematicas > 0 ? Math.round(catSums.matematicas / catCounts.matematicas) : 0,
      comprension: catCounts.comprension > 0 ? Math.round(catSums.comprension / catCounts.comprension) : 0,
      psicologico: catCounts.psicologico > 0 ? Math.round(catSums.psicologico / catCounts.psicologico) : 0,
    },
  };
}
