import React, { useState, useEffect, useRef } from 'react';
import { Question, Candidate, QuestionCategory } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  Check,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface AnswerItem {
  selectedOption?: number;
  selectedOptionText?: string;
  textAnswer?: string;
}

interface ExamRunnerProps {
  candidate: Candidate;
  questions: Question[];
  onSubmit: (answers: { questionId: string; selectedOption?: number; selectedOptionText?: string; textAnswer?: string }[]) => Promise<void>;
  isSubmitting: boolean;
}

const categoryMeta: Record<
  QuestionCategory,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  logica: {
    label: 'Lógica y Algoritmia',
    icon: <Cpu className="w-3.5 h-3.5" />,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  matematicas: {
    label: 'Análisis Matemático',
    icon: <Calculator className="w-3.5 h-3.5" />,
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  comprension: {
    label: 'Comprensión Lectora',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  psicologico: {
    label: 'Test Psicológico / Vocacional',
    icon: <HeartHandshake className="w-3.5 h-3.5" />,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

const EXAM_DURATION_SECONDS = 30 * 60; // 30 minutes = 1,800 seconds

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  candidate,
  questions,
  onSubmit,
  isSubmitting,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerItem>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const autoSubmittedRef = useRef(false);

  // 30-Minute Strict Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Count answered questions
  const answeredCount = Object.values(answers).filter((ans: AnswerItem) => {
    if (ans.selectedOption !== undefined && ans.selectedOption >= 0) return true;
    if (ans.textAnswer && ans.textAnswer.trim().length > 0) return true;
    return false;
  }).length;

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Auto-submit when time expires
  useEffect(() => {
    if (isTimeExpired && !autoSubmittedRef.current && !isSubmitting) {
      autoSubmittedRef.current = true;
      handleDoSubmit();
    }
  }, [isTimeExpired]);

  const handleSelectOption = (optionIndex: number, optionText: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: optionIndex,
        selectedOptionText: optionText,
      },
    }));
  };

  const handleTextAnswerChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        textAnswer: text,
      },
    }));
  };

  const handleDoSubmit = async () => {
    const formattedAnswers = questions.map((q) => {
      const recorded = answers[q.id];
      return {
        questionId: q.id,
        selectedOption: recorded?.selectedOption !== undefined ? recorded.selectedOption : -1,
        selectedOptionText: recorded?.selectedOptionText || '',
        textAnswer: recorded?.textAnswer || '',
      };
    });

    await onSubmit(formattedAnswers);
  };

  const handleFinishClick = () => {
    setShowConfirmModal(true);
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-500">No hay preguntas disponibles en este momento.</p>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const currentCategoryInfo = categoryMeta[currentQuestion.category] || categoryMeta.logica;
  const isCurrentAnswered =
    answers[currentQuestion.id]?.selectedOption !== undefined ||
    (answers[currentQuestion.id]?.textAnswer && answers[currentQuestion.id]?.textAnswer!.trim().length > 0);

  const isOpenEnded = currentQuestion.type === 'open_ended';

  // Timer color states
  const isUrgent = remainingSeconds <= 60; // < 1 min
  const isWarning = remainingSeconds <= 300 && !isUrgent; // < 5 min

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Time Expired Notice Overlay */}
      {isTimeExpired && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-red-200 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Tiempo Límite Cumplido (30 Minutos)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              El tiempo reglamentario de <strong>media hora</strong> ha finalizado. El sistema está cerrando el examen y guardando automáticamente sus respuestas en la nube de selección.
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-800 flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 animate-spin text-red-600" />
              <span>Procesando y enviando resultados al correo...</span>
            </div>
          </div>
        </div>
      )}

      {/* Urgent 1-minute warning banner */}
      {isUrgent && !isTimeExpired && (
        <div className="bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>¡Atención: Queda menos de 1 minuto! El examen se cerrará y enviará automáticamente al llegar a 00:00.</span>
          </div>
          <span className="font-mono text-sm font-black bg-red-700 px-2 py-0.5 rounded">
            {formatTime(remainingSeconds)}
          </span>
        </div>
      )}

      {/* Sticky Test Header with Progress & 30-min Timer */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sticky top-16 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-gray-900 text-sm">
              {candidate.fullName}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              Grupo {candidate.assignedGroup}
            </span>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              (Banco aleatorio anti-copia)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            {/* Answered progress */}
            <div className="flex items-center space-x-1.5 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>{answeredCount}</strong> de {totalQuestions} ({progressPercent}%)
              </span>
            </div>

            {/* 30-minute Countdown Timer */}
            <div
              className={`flex items-center space-x-1.5 font-mono font-bold px-3 py-1.5 rounded-lg border transition-all ${
                isUrgent
                  ? 'bg-red-100 border-red-300 text-red-900 animate-pulse ring-2 ring-red-400'
                  : isWarning
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-gray-100 border-gray-200 text-gray-800'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-700 animate-spin' : isWarning ? 'text-amber-700' : 'text-gray-500'}`} />
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase font-semibold text-gray-500">Tiempo Restante</span>
                <span className="text-sm">{formatTime(remainingSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Display Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Category banner & Question type badge */}
        <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${currentCategoryInfo.badgeClass}`}
            >
              {currentCategoryInfo.icon}
              <span>{currentCategoryInfo.label}</span>
            </span>

            {isOpenEnded ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <FileText className="w-3 h-3" />
                <span>Respuesta Libre</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                <span>Opción Múltiple</span>
              </span>
            )}

            <span className="text-xs text-gray-500 font-medium">
              Dificultad: <span className="capitalize">{currentQuestion.difficulty}</span>
            </span>
          </div>

          <span className="text-xs font-bold text-gray-600">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {currentQuestion.title}
            </h2>

            {/* Context Box: code/pseudocode (mono) or authentic reading text (serif, editorial card) */}
            {currentQuestion.context && (
              currentQuestion.category === 'comprension' ? (
                <div className="mt-4 p-5 rounded-xl bg-amber-50/40 border border-amber-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider pb-2 border-b border-amber-200/60">
                    <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Texto de Lectura y Comprensión Crítica (Fuente Oficial)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-900 font-serif leading-relaxed whitespace-pre-line selection:bg-amber-200">
                    {currentQuestion.context}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {currentQuestion.context}
                </div>
              )
            )}
          </div>

          {/* Conditional Input: Free Response vs Multiple Choice */}
          {isOpenEnded ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Escriba su justificación o algoritmo de respuesta libre:
                </label>
                <span className="text-[11px] text-gray-500">
                  {(answers[currentQuestion.id]?.textAnswer || '').length} caracteres
                </span>
              </div>
              <textarea
                id="free-response-textarea"
                rows={6}
                value={answers[currentQuestion.id]?.textAnswer || ''}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                placeholder="Escriba aquí su desarrollo técnico, razonamiento o pseudocódigo paso a paso..."
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-sans leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 italic">
                * Su respuesta será evaluada automáticamente con el modelo pedagógico ADSO y rúbricas de ingeniería de software.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Seleccione la opción correcta (Opciones aleatorizadas):
              </label>
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion.id]?.selectedOption === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx, opt)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs font-medium'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : optionLetters[optIdx] || optIdx + 1}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed pt-0.5 font-normal">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Question Footer Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishClick}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Finalizar Examen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Question Map / Matrix */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Navegador de las 40 Preguntas (10 por Componente)
          </span>
          <div className="flex items-center space-x-3 text-[11px] text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Respondida</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block"></span>
              <span>Pendiente</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {questions.map((q, idx) => {
            const hasAns =
              answers[q.id]?.selectedOption !== undefined ||
              (answers[q.id]?.textAnswer && answers[q.id]?.textAnswer!.trim().length > 0);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent ? 'ring-2 ring-emerald-600 ring-offset-1 font-extrabold shadow-xs' : ''
                } ${
                  hasAns
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`Pregunta ${idx + 1} (${categoryMeta[q.category]?.label || q.category}${q.type === 'open_ended' ? ' - Abierta' : ''})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Límite de tiempo: 30:00 min. Cierre automático e inmutable.
          </span>
          <button
            type="button"
            onClick={handleFinishClick}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Revisar y Enviar Evaluación</span>
          </button>
        </div>
      </div>

      {/* Manual Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">¿Desea finalizar y enviar su examen?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Ha respondido <strong>{answeredCount}</strong> de <strong>{totalQuestions}</strong> preguntas.
              </p>
              {answeredCount < totalQuestions && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Tiene {totalQuestions - answeredCount} preguntas sin contestar. Recuerde que el examen se cierra definitivamente tras el envío.
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl text-xs text-gray-600 space-y-1.5 border border-gray-200">
              <p>
                • Tiempo restante: <strong className="text-gray-900 font-mono">{formatTime(remainingSeconds)}</strong>
              </p>
              <p>
                • Los resultados se clasificarán automáticamente en <strong>Grupos A, B o C</strong>.
              </p>
              <p>
                • Se enviará de inmediato el informe oficial a: <strong className="text-gray-900">{candidate.email}</strong>.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Continuar Respondiendo
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleDoSubmit();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Evaluando en la nube...</span>
                ) : (
                  <>
                    <span>Confirmar y Enviar</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
