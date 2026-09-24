import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getQuestions,
  getQuestionById,
  saveQuestion,
  deleteQuestion,
  addQuestionsBatch,
  resetQuestionsToDefault,
  getResults,
  getResultById,
  saveResult,
  deleteResult,
  updateAdmissionDecision,
  getResultByDocumentNumber,
  calculateStats,
  getCohortsOverview,
  MAX_STUDENTS_PER_GROUP,
  checkAdminPassword,
  setAdminPassword,
} from './server/db';
import { sendExamNotificationEmail } from './server/emailService';
import { extractQuestionsWithGemini, generatePerformanceFeedback, evaluateOpenEndedAnswer } from './server/geminiService';
import { ExamResult, Question, CategoryScore, EvaluationGroup, ExamAnswer, ExamStatus, AdmissionDecision } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware with extended limits for PDF payloads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- ADMINISTRATOR AUTHENTICATION ---
  app.post('/api/admin/login', (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Debe ingresar la contraseña de administrador' });
      }
      const isValid = checkAdminPassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Contraseña de administrador incorrecta' });
      }
      return res.json({ success: true, message: 'Acceso administrativo autorizado' });
    } catch (err: any) {
      console.error('Error during admin login:', err);
      return res.status(500).json({ error: 'Error al verificar credenciales' });
    }
  });

  app.post('/api/admin/change-password', (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'La nueva contraseña debe contener al menos 4 caracteres' });
      }
      if (!checkAdminPassword(currentPassword)) {
        return res.status(401).json({ error: 'La contraseña actual no es correcta' });
      }
      setAdminPassword(newPassword);
      return res.json({ success: true, message: 'Contraseña de administrador actualizada con éxito' });
    } catch (err: any) {
      console.error('Error changing admin password:', err);
      return res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
  });

  // --- EXAM GENERATION (ANTI-COPIA & 40 PREGUNTAS: 10 POR COMPONENTE) ---
  app.get('/api/exams/generate', (req, res) => {
    try {
      const { group } = req.query;
      const allQuestions = getQuestions();

      const categories: Array<'logica' | 'matematicas' | 'comprension' | 'psicologico'> = [
        'logica',
        'matematicas',
        'comprension',
        'psicologico',
      ];

      // Fisher-Yates shuffle helper
      const shuffle = <T>(arr: T[]): T[] => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };

      const selectedQuestions: Question[] = [];

      // Select exactly 10 questions per component
      for (const cat of categories) {
        const catQuestions = allQuestions.filter((q) => q.category === cat);
        let eligible = catQuestions.filter((q) => !q.targetGroup || q.targetGroup === 'ALL' || q.targetGroup === group);
        if (eligible.length < 10) {
          eligible = catQuestions;
        }

        const shuffledCat = shuffle(eligible);
        const picked = shuffledCat.slice(0, 10);
        selectedQuestions.push(...picked);
      }

      // Shuffle entire 40 questions to randomize sequence for each aspirant
      const candidateQuestions = shuffle(selectedQuestions);

      // Randomize option order for multiple-choice questions to prevent screen peering
      const finalQuestionsForStudent = candidateQuestions.map((q) => {
        if (q.type === 'open_ended' || !Array.isArray(q.options) || q.options.length <= 1) {
          return {
            id: q.id,
            category: q.category,
            title: q.title,
            context: q.context,
            type: 'open_ended' as const,
            options: [],
            correctAnswer: 0,
            difficulty: q.difficulty,
          };
        }

        const indexedOptions = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
        const shuffledOptions = shuffle(indexedOptions);
        const newCorrectIndex = shuffledOptions.findIndex((item) => item.originalIndex === q.correctAnswer);

        return {
          id: q.id,
          category: q.category,
          title: q.title,
          context: q.context,
          type: 'multiple_choice' as const,
          options: shuffledOptions.map((o) => o.text),
          correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : q.correctAnswer,
          difficulty: q.difficulty,
        };
      });

      res.json({
        success: true,
        total: finalQuestionsForStudent.length,
        timeLimitMinutes: 30,
        timeLimitSeconds: 1800, // 30 minutes
        questions: finalQuestionsForStudent,
      });
    } catch (err: any) {
      console.error('Error generating randomized exam:', err);
      res.status(500).json({ error: 'Error al generar examen' });
    }
  });

  // Get question bank (with optional filters)
  app.get('/api/questions', (req, res) => {
    try {
      const { category, group, search } = req.query;
      let questions = getQuestions();

      if (category && typeof category === 'string' && category !== 'all') {
        questions = questions.filter((q) => q.category === category);
      }

      if (group && typeof group === 'string' && group !== 'ALL') {
        questions = questions.filter((q) => !q.targetGroup || q.targetGroup === 'ALL' || q.targetGroup === group);
      }

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        questions = questions.filter(
          (q) =>
            q.title.toLowerCase().includes(query) ||
            (q.context && q.context.toLowerCase().includes(query)) ||
            q.explanation.toLowerCase().includes(query)
        );
      }

      res.json(questions);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      res.status(500).json({ error: 'Error al obtener preguntas', details: err?.message });
    }
  });

  // Create single question
  app.post('/api/questions', (req, res) => {
    try {
      const { category, title, context, type, options, correctAnswer, sampleAnswer, explanation, difficulty, targetGroup } = req.body;

      const questionType = type === 'open_ended' ? 'open_ended' : 'multiple_choice';

      if (!category || !title) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para la pregunta' });
      }

      if (questionType === 'multiple_choice' && (!Array.isArray(options) || options.length < 2 || correctAnswer === undefined)) {
        return res.status(400).json({ error: 'Las preguntas de opción múltiple requieren al menos 2 opciones y la respuesta correcta' });
      }

      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category,
        title,
        context: context || '',
        type: questionType,
        options: Array.isArray(options) ? options : [],
        correctAnswer: questionType === 'multiple_choice' ? Number(correctAnswer || 0) : 0,
        sampleAnswer: sampleAnswer || '',
        explanation: explanation || '',
        difficulty: difficulty || 'medio',
        targetGroup: targetGroup || 'ALL',
        createdAt: new Date().toISOString(),
      };

      const saved = saveQuestion(newQuestion);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('Error creating question:', err);
      res.status(500).json({ error: 'Error al crear la pregunta' });
    }
  });

  // Update existing question
  app.put('/api/questions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = getQuestionById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }

      const updatedQuestion: Question = {
        ...existing,
        ...req.body,
        id,
      };

      const saved = saveQuestion(updatedQuestion);
      res.json(saved);
    } catch (err: any) {
      console.error('Error updating question:', err);
      res.status(500).json({ error: 'Error al actualizar la pregunta' });
    }
  });

  // Delete question
  app.delete('/api/questions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = deleteQuestion(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }
      res.json({ success: true, message: 'Pregunta eliminada correctamente' });
    } catch (err: any) {
      console.error('Error deleting question:', err);
      res.status(500).json({ error: 'Error al eliminar la pregunta' });
    }
  });

  // Batch import questions from JSON
  app.post('/api/questions/import-json', (req, res) => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'El archivo JSON debe contener un arreglo de preguntas válido' });
      }

      const sanitized: Question[] = questions.map((item: any, idx: number) => ({
        id: item.id || `json-${Date.now()}-${idx}`,
        category: ['logica', 'matematicas', 'comprension', 'psicologico'].includes(item.category)
          ? item.category
          : 'logica',
        title: item.title || `Pregunta Importada ${idx + 1}`,
        context: item.context || item.title || '',
        options: Array.isArray(item.options) && item.options.length >= 2 ? item.options : ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
        correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
        explanation: item.explanation || 'Respuesta verificada.',
        difficulty: ['facil', 'medio', 'dificil'].includes(item.difficulty) ? item.difficulty : 'medio',
        targetGroup: item.targetGroup || 'ALL',
        createdAt: new Date().toISOString(),
      }));

      const result = addQuestionsBatch(sanitized);
      res.json({ success: true, count: result.added, total: result.total });
    } catch (err: any) {
      console.error('Error importing JSON questions:', err);
      res.status(500).json({ error: 'Error al importar preguntas desde JSON', details: err?.message });
    }
  });

  // AI Extraction of questions from PDF or Text
  app.post('/api/questions/import-ai', async (req, res) => {
    try {
      const { base64Data, mimeType, textContent } = req.body;

      if (!base64Data && !textContent) {
        return res.status(400).json({ error: 'Debe adjuntar un archivo PDF o ingresar el texto del examen.' });
      }

      const extracted = await extractQuestionsWithGemini({
        base64Data,
        mimeType: mimeType || 'application/pdf',
        textContent,
      });

      if (!extracted || extracted.length === 0) {
        return res.status(422).json({ error: 'No se pudieron extraer preguntas estructuradas del documento.' });
      }

      // Automatically add to question bank
      const result = addQuestionsBatch(extracted);

      res.json({
        success: true,
        extractedCount: extracted.length,
        totalQuestionsInBank: result.total,
        questions: extracted,
      });
    } catch (err: any) {
      console.error('Error in AI question extraction:', err);
      res.status(500).json({ error: 'Error al procesar el archivo con IA', details: err?.message });
    }
  });

  // Reset questions to standard default Fase 2
  app.post('/api/questions/reset-bank', (req, res) => {
    try {
      const resetList = resetQuestionsToDefault();
      res.json({ success: true, count: resetList.length, questions: resetList });
    } catch (err: any) {
      console.error('Error resetting questions:', err);
      res.status(500).json({ error: 'Error al restablecer banco de preguntas' });
    }
  });

  // Submit and evaluate completed test
  app.post('/api/exams/submit', async (req, res) => {
    try {
      const { candidate, answers, startedAt } = req.body;

      if (!candidate || !candidate.fullName || !candidate.email || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Datos de examen incompletos' });
      }

      // Single attempt rule: Candidate cannot repeat exam once submitted
      if (candidate.documentNumber) {
        const existingAttempt = getResultByDocumentNumber(candidate.documentNumber);
        if (existingAttempt) {
          return res.status(400).json({
            error: `El aspirante con documento ${candidate.documentNumber} ya completó y envió su examen previamente (Fecha: ${new Date(
              existingAttempt.completedAt
            ).toLocaleString()}). Por políticas de la convocatoria Fase 2 ADSO no está permitido repetir la prueba.`,
          });
        }
      }

      const allQuestions = getQuestions();
      const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

      // Category counters
      const categories: Array<'logica' | 'matematicas' | 'comprension' | 'psicologico'> = [
        'logica',
        'matematicas',
        'comprension',
        'psicologico',
      ];

      const counts = {
        logica: { total: 0, correct: 0, points: 0 },
        matematicas: { total: 0, correct: 0, points: 0 },
        comprension: { total: 0, correct: 0, points: 0 },
        psicologico: { total: 0, correct: 0, points: 0 },
      };

      const evaluatedAnswers: ExamAnswer[] = await Promise.all(
        answers.map(async (ans: any) => {
          const q = questionMap.get(ans.questionId);
          const cat = q?.category || 'logica';

          if (q?.type === 'open_ended' || ans.textAnswer !== undefined) {
            // Evaluate open-ended response with Gemini AI or rubric
            const openResult = await evaluateOpenEndedAnswer({
              questionTitle: q?.title || 'Pregunta de respuesta abierta',
              questionContext: q?.context,
              sampleAnswer: q?.sampleAnswer,
              explanation: q?.explanation,
              candidateAnswer: ans.textAnswer || '',
              category: cat,
            });

            if (counts[cat]) {
              counts[cat].total++;
              if (openResult.isCorrect) counts[cat].correct++;
              counts[cat].points += openResult.score;
            }

            return {
              questionId: ans.questionId,
              textAnswer: ans.textAnswer,
              isCorrect: openResult.isCorrect,
              score: openResult.score,
              feedback: openResult.feedback,
              category: cat,
            };
          } else {
            // Multiple choice evaluation
            // Supports both option text matching (for shuffled options) and index matching
            let isCorrect = false;
            if (q && ans.selectedOptionText && Array.isArray(q.options) && q.options[q.correctAnswer]) {
              isCorrect = q.options[q.correctAnswer].trim() === ans.selectedOptionText.trim();
            } else if (q) {
              isCorrect = q.correctAnswer === ans.selectedOption;
            }

            if (counts[cat]) {
              counts[cat].total++;
              if (isCorrect) {
                counts[cat].correct++;
                counts[cat].points += 100;
              }
            }

            return {
              questionId: ans.questionId,
              selectedOption: ans.selectedOption,
              isCorrect,
              score: isCorrect ? 100 : 0,
              feedback: isCorrect ? 'Respuesta correcta.' : `Incorrecta. Explicación: ${q?.explanation || ''}`,
              category: cat,
            };
          }
        })
      );

      // Calculate percentage per category (based on accumulated points)
      const buildScore = (cat: 'logica' | 'matematicas' | 'comprension' | 'psicologico', label: string): CategoryScore => {
        const c = counts[cat];
        const pct = c.total > 0 ? Math.round(c.points / c.total) : 0;
        return {
          total: c.total,
          correct: c.correct,
          percentage: pct,
          label,
        };
      };

      const scores = {
        logica: buildScore('logica', 'Lógica de Programación'),
        matematicas: buildScore('matematicas', 'Análisis Matemático'),
        comprension: buildScore('comprension', 'Comprensión Lectora'),
        psicologico: buildScore('psicologico', 'Test Psicológico y Perfil Vocacional'),
      };

      // Overall score: weighted calculation (equal weights by default)
      const validCategories = Object.values(scores).filter((s) => s.total > 0);
      const overallScore = validCategories.length > 0
        ? Math.round(validCategories.reduce((acc, curr) => acc + curr.percentage, 0) / validCategories.length)
        : 0;

      // User requirement:
      // "Los grupos no tienen que ver con clasificacion son solo grupos de estudiantes con maximo 30 estudiantes,
      // luego los siguientes deben ser del grupo b, en la gestion automatica agrega si esta aprobado o desaprobado"
      
      // Auto-assign cohort group based on 30 students per group capacity:
      const cohorts = getCohortsOverview();
      let assignedCohortGroup: EvaluationGroup = candidate.assignedGroup || cohorts.currentActiveGroup;

      // If the candidate's chosen group is already full (>= 30), automatically assign to the next active cohort group
      const targetGroupInfo = cohorts.groups.find((g) => g.id === assignedCohortGroup);
      if (targetGroupInfo && targetGroupInfo.isFull) {
        assignedCohortGroup = cohorts.currentActiveGroup;
      }
      candidate.assignedGroup = assignedCohortGroup;

      // Status: APROBADO (overallScore >= 70%) or DESAPROBADO (overallScore < 70%)
      const PASSING_SCORE = 70;
      const status: ExamStatus = overallScore >= PASSING_SCORE ? 'APROBADO' : 'DESAPROBADO';

      // Generate AI diagnostic feedback
      const aiFeedback = await generatePerformanceFeedback({
        logica: scores.logica.percentage,
        matematicas: scores.matematicas.percentage,
        comprension: scores.comprension.percentage,
        psicologico: scores.psicologico.percentage,
        overall: overallScore,
        assignedGroup: candidate.assignedGroup || 'A',
      });

      const completedAt = new Date().toISOString();
      const examId = `adso-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const examResult: ExamResult = {
        id: examId,
        candidate,
        startedAt: startedAt || completedAt,
        completedAt,
        scores,
        overallScore,
        passingScore: PASSING_SCORE,
        performanceTier: assignedCohortGroup,
        status,
        admissionDecision: (status === 'APROBADO' ? 'ADMITIDO' : 'NO_ADMITIDO') as AdmissionDecision,
        aiFeedback,
        emailNotification: {
          sent: false,
          recipientEmail: candidate.email,
          sentAt: '',
          subject: `Resultados Examen Fase 2 ADSO - ${candidate.fullName} · ${status} (${overallScore}%) · Grupo ${candidate.assignedGroup}`,
          previewHtml: '',
          statusMessage: 'Preparando envío...',
        },
        answers: evaluatedAnswers,
      };

      // Send email automatically
      try {
        const emailDispatch = await sendExamNotificationEmail(examResult);
        examResult.emailNotification.sent = emailDispatch.success;
        examResult.emailNotification.sentAt = emailDispatch.sentAt;
        examResult.emailNotification.previewHtml = emailDispatch.previewHtml;
        examResult.emailNotification.statusMessage = emailDispatch.message;
      } catch (emailErr: any) {
        console.error('Error sending email notification:', emailErr);
        examResult.emailNotification.statusMessage = `Error al enviar: ${emailErr?.message || 'Fallo de conexión'}`;
      }

      // Save result in persistent cloud database
      saveResult(examResult);

      res.status(201).json(examResult);
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      res.status(500).json({ error: 'Error al evaluar y guardar el examen', details: err?.message });
    }
  });

  // Get all exam results with filters
  app.get('/api/results', (req, res) => {
    try {
      const { assignedGroup, performanceTier, search } = req.query;
      let results = getResults();

      if (assignedGroup && typeof assignedGroup === 'string' && assignedGroup !== 'ALL') {
        results = results.filter((r) => r.candidate.assignedGroup === assignedGroup);
      }

      if (performanceTier && typeof performanceTier === 'string' && performanceTier !== 'ALL') {
        results = results.filter((r) => r.performanceTier === performanceTier);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        results = results.filter(
          (r) =>
            r.candidate.fullName.toLowerCase().includes(q) ||
            r.candidate.documentNumber.includes(q) ||
            r.candidate.email.toLowerCase().includes(q)
        );
      }

      res.json(results);
    } catch (err: any) {
      console.error('Error fetching results:', err);
      res.status(500).json({ error: 'Error al obtener resultados' });
    }
  });

  // Get single result by ID
  app.get('/api/results/:id', (req, res) => {
    try {
      const result = getResultById(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Resultado no encontrado' });
      }
      res.json(result);
    } catch (err: any) {
      console.error('Error fetching result:', err);
      res.status(500).json({ error: 'Error al obtener detalle del resultado' });
    }
  });

  // Re-send email notification for an existing result
  app.post('/api/results/:id/send-email', async (req, res) => {
    try {
      const result = getResultById(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Resultado no encontrado' });
      }

      const dispatch = await sendExamNotificationEmail(result);
      result.emailNotification.sent = dispatch.success;
      result.emailNotification.sentAt = dispatch.sentAt;
      result.emailNotification.statusMessage = dispatch.message;
      result.emailNotification.previewHtml = dispatch.previewHtml;

      saveResult(result);
      res.json({ success: true, emailNotification: result.emailNotification });
    } catch (err: any) {
      console.error('Error resending email:', err);
      res.status(500).json({ error: 'Error al reenviar el correo' });
    }
  });

  // Delete result
  app.delete('/api/results/:id', (req, res) => {
    try {
      const deleted = deleteResult(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Resultado no encontrado' });
      }
      res.json({ success: true, message: 'Resultado eliminado correctamente' });
    } catch (err: any) {
      console.error('Error deleting result:', err);
      res.status(500).json({ error: 'Error al eliminar resultado' });
    }
  });

  // Check if an aspirant has already completed the exam (enforces single attempt rule)
  app.get('/api/aspirants/check-completed/:documentNumber', (req, res) => {
    try {
      const { documentNumber } = req.params;
      const existing = getResultByDocumentNumber(documentNumber);
      if (existing) {
        return res.json({
          completed: true,
          completedAt: existing.completedAt,
          fullName: existing.candidate.fullName,
          status: existing.status,
          overallScore: existing.overallScore,
          admissionDecision: existing.admissionDecision || (existing.status === 'APROBADO' ? 'ADMITIDO' : 'NO_ADMITIDO'),
          assignedGroup: existing.candidate.assignedGroup,
        });
      }
      res.json({ completed: false });
    } catch (err: any) {
      console.error('Error checking completed aspirant:', err);
      res.status(500).json({ error: 'Error al consultar estado del aspirante' });
    }
  });

  // Update admission decision by Admin (Admitido, En Espera, No Admitido)
  app.patch('/api/results/:id/admission', (req, res) => {
    try {
      const { id } = req.params;
      const { admissionDecision } = req.body;

      if (!['ADMITIDO', 'LISTA_ESPERA', 'NO_ADMITIDO'].includes(admissionDecision)) {
        return res.status(400).json({
          error: 'Estado de admisión inválido. Debe ser: ADMITIDO, LISTA_ESPERA o NO_ADMITIDO.',
        });
      }

      const updated = updateAdmissionDecision(id, admissionDecision as AdmissionDecision);
      if (!updated) {
        return res.status(404).json({ error: 'Resultado no encontrado' });
      }

      res.json({ success: true, result: updated });
    } catch (err: any) {
      console.error('Error updating admission decision:', err);
      res.status(500).json({ error: 'Error al actualizar decisión de admisión' });
    }
  });

  // System Stats for Dashboard
  app.get('/api/stats', (req, res) => {
    try {
      const stats = calculateStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Error calculating stats:', err);
      res.status(500).json({ error: 'Error al calcular estadísticas' });
    }
  });

  // Student Cohorts Status (Groups with max 30 students each)
  app.get('/api/cohorts/status', (req, res) => {
    try {
      const overview = getCohortsOverview();
      res.json(overview);
    } catch (err: any) {
      console.error('Error getting cohorts overview:', err);
      res.status(500).json({ error: 'Error al consultar cohortes de estudiantes' });
    }
  });

  // --- VITE MIDDLEWARE (DEVELOPMENT) OR STATIC SERVING (PRODUCTION) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sistema de Examen Fase 2 ADSO ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
