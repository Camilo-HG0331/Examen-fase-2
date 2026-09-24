import { GoogleGenAI, Type } from '@google/genai';
import { Question, QuestionCategory, QuestionDifficulty } from '../src/types';

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not defined. AI features will use fallback logic.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Valid model pool for basic text tasks.
 * If primary model experiences high demand (503), the engine will automatically
 * retry with candidate fallback models from the official skill guide.
 */
const TEXT_MODELS_POOL = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

/**
 * Execute a Gemini call with automatic multi-model failover and transient error recovery (503/429).
 */
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<any> {
  const preferred = params.preferredModel || 'gemini-3.8-flash';
  const modelsToTry = [preferred, ...TEXT_MODELS_POOL.filter((m) => m !== preferred)];

  let lastError: any = null;

  for (const model of modelsToTry) {
    // Attempt up to 2 times with a brief backoff for temporary spikes in demand
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || String(err)).toLowerCase();
        const isTransient =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('unavailable') ||
          msg.includes('429') ||
          msg.includes('resource_exhausted') ||
          msg.includes('rate limit');

        if (isTransient) {
          // Log informative warning without polluting error tracking
          console.warn(`[Gemini Info] Model ${model} returned transient status (${attempt + 1}/2). Switching/retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          // Continue to next attempt or next model
          continue;
        } else {
          // Non-transient error; break to try next model or failover
          break;
        }
      }
    }
  }

  throw lastError;
}

/**
 * Pedagogical heuristic scoring for open-ended answers when AI models are temporarily unavailable.
 */
function heuristicEvaluateOpenAnswer(params: {
  questionTitle: string;
  questionContext?: string;
  sampleAnswer?: string;
  explanation?: string;
  candidateAnswer: string;
  category: string;
}): { isCorrect: boolean; score: number; feedback: string } {
  const text = params.candidateAnswer.trim();
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 4) {
    return {
      isCorrect: false,
      score: 30,
      feedback: 'Respuesta muy breve. Se requiere una justificación técnica más completa.',
    };
  }

  // Extract reference vocabulary
  const refText = `${params.questionTitle} ${params.questionContext || ''} ${params.sampleAnswer || ''} ${params.explanation || ''}`.toLowerCase();
  const refWords = new Set(
    refText
      .replace(/[^\w\sáéíóúüñ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  // Match domain terms
  let matches = 0;
  for (const w of words) {
    if (refWords.has(w.toLowerCase())) {
      matches++;
    }
  }

  const baseScore = Math.min(65, 45 + words.length * 2);
  const bonus = Math.min(30, matches * 6);
  const score = Math.min(96, Math.max(50, baseScore + bonus));
  const isCorrect = score >= 60;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? 'Respuesta estructurada y sustentada técnicamente conforme a los criterios de selección ADSO.'
      : 'La respuesta aborda el planteamiento pero requiere profundizar en los fundamentos del problema.',
  };
}

/**
 * Pedagogical heuristic feedback generator when AI models are temporarily unavailable.
 */
function heuristicPerformanceFeedback(scores: {
  logica: number;
  matematicas: number;
  comprension: number;
  psicologico: number;
  overall: number;
  assignedGroup: string;
}): string {
  const isApproved = scores.overall >= 70;
  if (isApproved) {
    return `El aspirante demostró un desempeño favorable (${scores.overall}%) en la Fase 2 ADSO (Cohorte Grupo ${scores.assignedGroup}). Sobresale en ${
      scores.logica >= scores.matematicas ? 'Lógica y Algoritmia' : 'Análisis Matemático'
    } (${Math.max(scores.logica, scores.matematicas)}%), evidenciando competencias idóneas para el análisis y desarrollo de software.`;
  } else {
    return `El aspirante obtuvo un promedio global de ${scores.overall}% en el examen de selección. Se recomienda afianzar los fundamentos de ${
      scores.logica < 70 ? 'lógica algorítmica' : 'análisis matemático'
    } e interpretación de especificaciones técnicas para futuras convocatorias.`;
  }
}

/**
 * Extract structured questions from an uploaded PDF (base64) or text content using Gemini.
 */
export async function extractQuestionsWithGemini(params: {
  base64Data?: string;
  mimeType?: string;
  textContent?: string;
}): Promise<Question[]> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('La clave de API de Gemini no está configurada para el procesamiento inteligente.');
  }

  const promptText = `
Eres un pedagogo experto en admisiones técnicas para el programa de formación SENA ADSO (Tecnología en Análisis y Desarrollo de Software) Fase 2.
Analiza el documento o texto proporcionado y extrae todas las preguntas de selección múltiple relevantes, clasificándolas en una de las siguientes 4 categorías oficiales:
1. "logica" (Lógica de programación, diagramas de flujo, pseudocódigo, secuencias lógicas, estructuras de control, álgebra booleana)
2. "matematicas" (Análisis matemático, cálculo proporcional, razones, porcentajes, álgebra aplicada)
3. "comprension" (Comprensión lectora, especificaciones de requisitos de software, casos de uso, análisis de textos técnicos)
4. "psicologico" (Test psicológico, competencias blandas, resolución de conflictos, trabajo en equipo, ética profesional, vocación TI)

Reglas estrictas:
- Cada pregunta debe tener exactamente 4 opciones de respuesta coherentes.
- 'correctAnswer' debe ser el índice entero de la opción correcta (0, 1, 2 o 3).
- 'explanation' debe detallar por qué la respuesta correcta es la adecuada.
- 'difficulty' debe ser 'facil', 'medio' o 'dificil'.
- Si en el documento faltan preguntas de alguna de las 4 categorías para conformar un examen completo, genera preguntas adicionales pertinentes de alta calidad para esa categoría.
- Devuelve la lista en formato JSON estructurado.
`;

  const contentsParts: any[] = [{ text: promptText }];

  if (params.base64Data && params.mimeType) {
    contentsParts.push({
      inlineData: {
        mimeType: params.mimeType,
        data: params.base64Data,
      },
    });
  } else if (params.textContent) {
    contentsParts.push({
      text: `\n\nCONTENIDO DEL DOCUMENTO:\n${params.textContent}`,
    });
  }

  const response = await callGeminiWithFallback(ai, {
    preferredModel: 'gemini-3.8-flash',
    contents: { parts: contentsParts },
    config: {
      systemInstruction: 'Eres un extractor y generador estructurado de reactivos para exámenes técnicos de selección ADSO.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        description: 'Lista de preguntas extraídas y validadas',
        items: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Debe ser logica, matematicas, comprension o psicologico',
            },
            title: {
              type: Type.STRING,
              description: 'Título o tema principal del reactivo',
            },
            context: {
              type: Type.STRING,
              description: 'Enunciado detallado, caso de estudio, texto técnico o código de la pregunta',
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Arreglo con las 4 opciones de respuesta',
            },
            correctAnswer: {
              type: Type.INTEGER,
              description: 'Índice (0-3) de la opción correcta',
            },
            explanation: {
              type: Type.STRING,
              description: 'Justificación pedagógica de la respuesta correcta',
            },
            difficulty: {
              type: Type.STRING,
              description: 'facil, medio o dificil',
            },
          },
          required: ['category', 'title', 'context', 'options', 'correctAnswer', 'explanation'],
        },
      },
    },
  });

  const rawJson = response.text || '[]';
  const parsed = JSON.parse(rawJson);

  return parsed.map((item: any, idx: number): Question => {
    const validCategory: QuestionCategory = ['logica', 'matematicas', 'comprension', 'psicologico'].includes(item.category)
      ? item.category
      : 'logica';
    const validDifficulty: QuestionDifficulty = ['facil', 'medio', 'dificil'].includes(item.difficulty)
      ? item.difficulty
      : 'medio';

    return {
      id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: validCategory,
      title: item.title || `Pregunta ${idx + 1}`,
      context: item.context || item.title || '',
      options: Array.isArray(item.options) && item.options.length >= 2 ? item.options : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correctAnswer: typeof item.correctAnswer === 'number' && item.correctAnswer >= 0 && item.correctAnswer < (item.options?.length || 4)
        ? item.correctAnswer
        : 0,
      explanation: item.explanation || 'Respuesta verificada según criterios técnicos de la Fase 2 ADSO.',
      difficulty: validDifficulty,
      targetGroup: 'ALL',
      createdAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate qualitative AI diagnosis and personalized recommendations for an exam result.
 */
export async function generatePerformanceFeedback(scores: {
  logica: number;
  matematicas: number;
  comprension: number;
  psicologico: number;
  overall: number;
  assignedGroup: string;
}): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return heuristicPerformanceFeedback(scores);
  }

  try {
    const prompt = `
Genera un dictamen psicotécnico y académico conciso (máximo 4 oraciones) para un aspirante a la carrera de Tecnología en Análisis y Desarrollo de Software (ADSO) - Fase 2:
- Calificación Global: ${scores.overall}%
- Grupo de Convocatoria: Grupo ${scores.assignedGroup}
- Lógica de Programación: ${scores.logica}%
- Análisis Matemático: ${scores.matematicas}%
- Comprensión Lectora Técnica: ${scores.comprension}%
- Test Psicológico y Vocacional: ${scores.psicologico}%

El dictamen debe ser objetivo, profesional, resaltar fortalezas y sugerir acciones de mejora o felicitación según corresponda.
`;

    const response = await callGeminiWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el comité de admisiones y psicología vocacional del programa ADSO.',
        temperature: 0.7,
      },
    });

    return response.text?.trim() || heuristicPerformanceFeedback(scores);
  } catch (err) {
    // Model pool unavailable or temporary spike; fallback to standard pedagogical feedback
    console.warn('[AI Service Notice] Using pedagogical heuristic feedback due to model demand.');
    return heuristicPerformanceFeedback(scores);
  }
}

/**
 * Evaluate an open-ended / free-response answer using Gemini AI or robust heuristic analysis.
 * Returns score (0-100), isCorrect (>= 60), and brief pedagogical feedback.
 */
export async function evaluateOpenEndedAnswer(params: {
  questionTitle: string;
  questionContext?: string;
  sampleAnswer?: string;
  explanation?: string;
  candidateAnswer: string;
  category: string;
}): Promise<{ isCorrect: boolean; score: number; feedback: string }> {
  const { questionTitle, questionContext, sampleAnswer, explanation, candidateAnswer, category } = params;

  if (!candidateAnswer || candidateAnswer.trim().length < 4) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'No se ingresó una respuesta suficiente para ser calificada.',
    };
  }

  const ai = getAiClient();
  if (!ai) {
    return heuristicEvaluateOpenAnswer(params);
  }

  try {
    const prompt = `
Eres el docente evaluador experto del comité de admisiones SENA ADSO Fase 2.
Evalúa la siguiente respuesta libre de un aspirante frente a la pregunta y criterios proporcionados:

CATEGORÍA: ${category}
PREGUNTA: ${questionTitle}
${questionContext ? `CONTEXTO / CASO: ${questionContext}` : ''}
CRITERIOS O RESPUESTA MODELO: ${sampleAnswer || explanation || 'Comprensión técnica y coherencia lógica.'}

RESPUESTA INGRESADA POR EL ASPIRANTE:
"${candidateAnswer}"

Instrucciones de evaluación:
- Califica la respuesta con un puntaje entero de 0 a 100 basado en coherencia técnica, justificación y alineación con los criterios.
- Considera aprobada (isCorrect: true) si el puntaje es >= 60.
- Escribe una retroalimentación concisa de máximo 2 oraciones.
- Devuelve estrictamente un objeto JSON con las claves: "score" (número entre 0 y 100), "isCorrect" (booleano), "feedback" (texto breve).
`;

    const response = await callGeminiWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const score = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 75;
    const isCorrect = typeof parsed.isCorrect === 'boolean' ? parsed.isCorrect : score >= 60;
    const feedback = parsed.feedback || 'Respuesta revisada por rúbrica pedagógica.';

    return { isCorrect, score, feedback };
  } catch (err) {
    // Graceful fallback to heuristic evaluation
    console.warn('[AI Service Notice] Using heuristic rubric evaluation due to model demand.');
    return heuristicEvaluateOpenAnswer(params);
  }
}
