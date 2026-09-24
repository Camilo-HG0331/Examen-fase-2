import React, { useState } from 'react';
import { ExamResult, Question, AdmissionDecision } from '../../types';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Send,
  Trash2,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  Eye,
  FileText,
  UserCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EmailViewerModal } from './EmailViewerModal';

interface ResultDetailModalProps {
  result: ExamResult;
  questions: Question[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onResendEmail: (id: string) => Promise<void>;
  onUpdateAdmission?: (id: string, decision: AdmissionDecision) => Promise<void>;
  initialTab?: 'resumen' | 'preguntas';
}

export const ResultDetailModal: React.FC<ResultDetailModalProps> = ({
  result,
  questions,
  onClose,
  onDelete,
  onResendEmail,
  onUpdateAdmission,
  initialTab = 'resumen',
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'preguntas'>(initialTab);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Admission decision state
  const isApproved = result.status === 'APROBADO' || result.overallScore >= 70;
  const [currentDecision, setCurrentDecision] = useState<AdmissionDecision>(
    result.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO')
  );
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  // Question tab filters
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('all');
  const [questionOutcomeFilter, setQuestionOutcomeFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const { candidate, scores, overallScore, status, aiFeedback, completedAt, answers } = result;
  const questionMap = new Map<string, Question>(questions.map((q) => [q.id, q]));

  const handleSetAdmission = async (decision: AdmissionDecision) => {
    setCurrentDecision(decision);
    if (!onUpdateAdmission) return;

    setIsSavingDecision(true);
    setDecisionFeedback(null);
    try {
      await onUpdateAdmission(result.id, decision);
      setDecisionFeedback(
        decision === 'ADMITIDO'
          ? 'Aspirante ADMITIDO en el programa ADSO.'
          : decision === 'LISTA_ESPERA'
          ? 'Aspirante ubicado en LISTA DE ESPERA.'
          : 'Aspirante registrado como NO ADMITIDO.'
      );
      setTimeout(() => setDecisionFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Error al actualizar decisión de admisión: ' + err.message);
    } finally {
      setIsSavingDecision(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(result.id);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-900">{candidate.fullName}</h3>
                {isApproved ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>APROBADO</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                    <XCircle className="w-3 h-3 text-red-700" />
                    <span>DESAPROBADO</span>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                  Grupo {candidate.assignedGroup} (Máx. 30)
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {candidate.documentType} {candidate.documentNumber} · {candidate.email} · Finalizado: {new Date(completedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admission Decision Selector Bar (Admin Control) */}
        <div className="px-6 py-3 bg-slate-100 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-800 shrink-0" />
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Selección de Admisión en el Programa ADSO:
              </span>
              <span className="text-[11px] text-gray-500">
                Determine si el aspirante es admitido, queda en lista de espera o no es admitido.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {decisionFeedback && (
              <span className="text-xs font-medium text-emerald-700 mr-1 animate-pulse">
                ✓ {decisionFeedback}
              </span>
            )}
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                id="modal-admission-admitido-btn"
                disabled={isSavingDecision}
                onClick={() => handleSetAdmission('ADMITIDO')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
                  currentDecision === 'ADMITIDO'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Admitido</span>
              </button>

              <button
                type="button"
                id="modal-admission-espera-btn"
                disabled={isSavingDecision}
                onClick={() => handleSetAdmission('LISTA_ESPERA')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
                  currentDecision === 'LISTA_ESPERA'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>En Espera</span>
              </button>

              <button
                type="button"
                id="modal-admission-no-admitido-btn"
                disabled={isSavingDecision}
                onClick={() => handleSetAdmission('NO_ADMITIDO')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
                  currentDecision === 'NO_ADMITIDO'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-800 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>No Admitido</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="px-6 bg-white border-b border-gray-200 flex space-x-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'resumen'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informe Diagnóstico y Puntajes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preguntas')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'preguntas'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Revisión Pregunta por Pregunta ({answers.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'resumen' ? (
            <div className="space-y-6">
              {/* Overall metric banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Calificación Global</span>
                  <span className="text-3xl font-black text-gray-900 mt-1">{overallScore}%</span>
                  <span className={`text-xs font-bold mt-0.5 ${isApproved ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isApproved ? 'Aprobado' : 'Desaprobado'}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Grupo de Estudiantes</span>
                  <span className="text-2xl font-black text-slate-800 mt-1">Grupo {candidate.assignedGroup}</span>
                  <span className="text-xs text-gray-600 mt-0.5">Cohorte máx. 30 alumnos</span>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col justify-center text-xs space-y-1">
                  <span className="font-semibold text-gray-500 uppercase">Estado Notificación Email</span>
                  <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enviado a {candidate.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(true)}
                    className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 underline font-medium pt-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Correo Generado</span>
                  </button>
                </div>
              </div>

              {/* Category Scores */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
                  Rendimiento por Módulo Técnico
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Lógica */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lógica y Algoritmia</span>
                      </span>
                      <strong className="text-blue-700">{scores.logica.percentage}%</strong>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${scores.logica.percentage}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-500 flex justify-between">
                      <span>{scores.logica.correct} / {scores.logica.total} aciertos</span>
                      <span>{scores.logica.percentage >= 70 ? 'Competente' : 'Básico'}</span>
                    </div>
                  </div>

                  {/* Matemáticas */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                        <Calculator className="w-3.5 h-3.5 text-purple-600" />
                        <span>Análisis Matemático</span>
                      </span>
                      <strong className="text-purple-700">{scores.matematicas.percentage}%</strong>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${scores.matematicas.percentage}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-500 flex justify-between">
                      <span>{scores.matematicas.correct} / {scores.matematicas.total} aciertos</span>
                      <span>{scores.matematicas.percentage >= 70 ? 'Competente' : 'Básico'}</span>
                    </div>
                  </div>

                  {/* Comprensión */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>Comprensión Lectora</span>
                      </span>
                      <strong className="text-amber-700">{scores.comprension.percentage}%</strong>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${scores.comprension.percentage}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-500 flex justify-between">
                      <span>{scores.comprension.correct} / {scores.comprension.total} aciertos</span>
                      <span>{scores.comprension.percentage >= 70 ? 'Competente' : 'Básico'}</span>
                    </div>
                  </div>

                  {/* Psicológico */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Test Psicológico / Vocacional</span>
                      </span>
                      <strong className="text-emerald-700">{scores.psicologico.percentage}%</strong>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${scores.psicologico.percentage}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-500 flex justify-between">
                      <span>{scores.psicologico.correct} / {scores.psicologico.total} aciertos</span>
                      <span>{scores.psicologico.percentage >= 70 ? 'Perfil Idóneo' : 'Aceptable'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              {aiFeedback && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 space-y-1">
                  <span className="font-bold block text-blue-950">
                    Dictamen Psicotécnico y Académico Automatizado:
                  </span>
                  <p className="leading-relaxed text-blue-800">
                    {aiFeedback}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Questions detailed inspection */
            <div className="space-y-4">
              {/* Question filtering toolbar */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-gray-700 mr-1">Componente:</span>
                  {[
                    { id: 'all', label: 'Todos (40)' },
                    { id: 'logica', label: 'Lógica (10)' },
                    { id: 'matematicas', label: 'Matemáticas (10)' },
                    { id: 'comprension', label: 'Comprensión (10)' },
                    { id: 'psicologico', label: 'Psicotécnico (10)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQuestionCategoryFilter(tab.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        questionCategoryFilter === tab.id
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-gray-700 mr-1">Resultado:</span>
                  <button
                    type="button"
                    onClick={() => setQuestionOutcomeFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                      questionOutcomeFilter === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                  >
                    Todas ({answers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionOutcomeFilter('correct')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                      questionOutcomeFilter === 'correct'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-emerald-200 text-emerald-800'
                    }`}
                  >
                    Correctas ({answers.filter((a) => a.isCorrect).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionOutcomeFilter('incorrect')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                      questionOutcomeFilter === 'incorrect'
                        ? 'bg-red-700 text-white'
                        : 'bg-white border border-red-200 text-red-800'
                    }`}
                  >
                    Incorrectas ({answers.filter((a) => !a.isCorrect).length})
                  </button>
                </div>
              </div>

              {answers
                .filter((ans) => {
                  if (questionCategoryFilter !== 'all' && ans.category !== questionCategoryFilter) return false;
                  if (questionOutcomeFilter === 'correct' && !ans.isCorrect) return false;
                  if (questionOutcomeFilter === 'incorrect' && ans.isCorrect) return false;
                  return true;
                })
                .map((ans, idx) => {
                const q = questionMap.get(ans.questionId);
                const isCorrect = ans.isCorrect;
                return (
                  <div
                    key={ans.questionId || idx}
                    className={`p-4 rounded-lg border text-xs sm:text-sm space-y-3 ${
                      isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">
                          #{idx + 1}. {q?.title || 'Pregunta'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 uppercase">
                          {ans.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correcta</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-700 font-bold text-xs bg-red-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrecta</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {q?.context && (
                      ans.category === 'comprension' ? (
                        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-slate-800 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-900 uppercase">
                            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                            <span>Texto Base de Lectura y Análisis</span>
                          </div>
                          <div className="font-serif whitespace-pre-line text-slate-900 leading-relaxed">
                            {q.context}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded bg-white border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap">
                          {q.context}
                        </div>
                      )
                    )}

                    {/* Options status or Open-ended response */}
                    {q?.type === 'open_ended' || ans.textAnswer !== undefined ? (
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-lg bg-white border border-gray-200">
                          <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                            Respuesta Escrita por el Aspirante:
                          </span>
                          <p className="text-xs text-gray-900 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-200">
                            {ans.textAnswer || '(Sin respuesta escrita)'}
                          </p>
                        </div>

                        {ans.feedback && (
                          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">Evaluación Automatizada por IA:</span>
                              {ans.score !== undefined && (
                                <span className="font-bold text-xs bg-blue-200/80 px-2 py-0.5 rounded">
                                  Puntaje: {ans.score}/100
                                </span>
                              )}
                            </div>
                            <p>{ans.feedback}</p>
                          </div>
                        )}

                        {q?.sampleAnswer && (
                          <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                            <strong>Criterio / Respuesta Modelo Esperada: </strong>
                            {q.sampleAnswer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {q?.options?.map((opt, optIdx) => {
                          const wasChosen = ans.selectedOption === optIdx;
                          const isTheCorrectOne = q.correctAnswer === optIdx;
                          let optionStyle = 'bg-white border-gray-200 text-gray-700';

                          if (isTheCorrectOne) {
                            optionStyle = 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-semibold';
                          } else if (wasChosen && !isTheCorrectOne) {
                            optionStyle = 'bg-red-100/70 border-red-300 text-red-950 line-through';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded border text-xs flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              <div className="flex items-center space-x-1 text-[11px] font-medium">
                                {wasChosen && (
                                  <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800">
                                    Respuesta elegida
                                  </span>
                                )}
                                {isTheCorrectOne && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                    Clave correcta
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q?.explanation && (
                      <div className="p-2.5 rounded bg-white/80 border border-gray-200 text-xs text-gray-600">
                        <strong className="text-gray-800">Justificación pedagógica: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          {confirmDeleteOpen ? (
            <div className="flex items-center space-x-2 bg-red-50 p-1.5 px-3 rounded-lg border border-red-200 text-xs">
              <span className="text-red-700 font-semibold">¿Confirmar eliminación?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow-2xs"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Eliminar Evaluación</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onResendEmail(result.id)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
            >
              <Send className="w-3 h-3 text-emerald-600" />
              <span>Reenviar al Correo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <EmailViewerModal
          result={result}
          onClose={() => setShowEmailModal(false)}
          onResend={() => onResendEmail(result.id)}
        />
      )}
    </div>
  );
};
