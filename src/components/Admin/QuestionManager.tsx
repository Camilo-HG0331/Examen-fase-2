import React, { useState } from 'react';
import { Question, QuestionCategory, QuestionDifficulty, QuestionType } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  ListOrdered,
} from 'lucide-react';

interface QuestionManagerProps {
  questions: Question[];
  onSaveQuestion: (question: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onResetBank: () => Promise<void>;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  questions,
  onSaveQuestion,
  onDeleteQuestion,
  onResetBank,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedType !== 'all' && (q.type || 'multiple_choice') !== selectedType) return false;
    if (selectedGroup !== 'all' && q.targetGroup && q.targetGroup !== 'ALL' && q.targetGroup !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const qry = searchQuery.toLowerCase();
      const inTitle = q.title.toLowerCase().includes(qry);
      const inContext = q.context ? q.context.toLowerCase().includes(qry) : false;
      const inExplanation = q.explanation ? q.explanation.toLowerCase().includes(qry) : false;
      if (!inTitle && !inContext && !inExplanation) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingQuestion({
      id: '',
      type: 'multiple_choice',
      category: 'logica',
      title: '',
      context: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      sampleAnswer: '',
      explanation: '',
      difficulty: 'medio',
      targetGroup: 'ALL',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion({
      ...q,
      type: q.type || 'multiple_choice',
      options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
      sampleAnswer: q.sampleAnswer || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.title.trim()) {
      alert('Por favor ingrese el enunciado de la pregunta.');
      return;
    }

    if (editingQuestion.type === 'multiple_choice') {
      if (editingQuestion.options.some((opt) => !opt.trim())) {
        alert('Todas las 4 opciones de respuesta deben tener texto para preguntas de opción múltiple.');
        return;
      }
    } else {
      // open_ended
      if (!editingQuestion.sampleAnswer?.trim()) {
        alert('Por favor ingrese los criterios de evaluación o respuesta modelo esperada.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSaveQuestion(editingQuestion);
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la pregunta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        '¿Restablecer el banco oficial completo? Esto cargará las 40 preguntas estandarizadas (10 por componente) de Fase 2 ADSO.'
      )
    ) {
      setIsResetting(true);
      try {
        await onResetBank();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const categoryMeta: Record<
    QuestionCategory,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    logica: { label: 'Lógica y Algoritmia', icon: <Cpu className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-800' },
    matematicas: { label: 'Análisis Matemático', icon: <Calculator className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-800' },
    comprension: { label: 'Comprensión Lectora', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-800' },
    psicologico: { label: 'Test Psicológico', icon: <HeartHandshake className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Banco de Preguntas del Examen</h2>
          <p className="text-xs text-gray-500">
            Configure las preguntas del examen oficial. Admite preguntas con <strong>Opción Múltiple</strong> y <strong>Respuesta Libre</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="reset-bank-btn"
            type="button"
            disabled={isResetting}
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Restaura las 40 preguntas estándar de inducción SENA ADSO"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Restableciendo...' : 'Restablecer 40 Preguntas'}</span>
          </button>

          <button
            id="create-question-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Pregunta</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por palabra clave, código o enunciado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Todas las Áreas</option>
              <option value="logica">Lógica y Algoritmia</option>
              <option value="matematicas">Análisis Matemático</option>
              <option value="comprension">Comprensión Lectora</option>
              <option value="psicologico">Test Psicológico</option>
            </select>
          </div>

          {/* Question Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Todos los Tipos</option>
              <option value="multiple_choice">Opción Múltiple</option>
              <option value="open_ended">Respuesta Libre</option>
            </select>
          </div>

          {/* Group */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Todos los Grupos (A, B, C)</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
              <option value="C">Grupo C</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>Mostrando <strong>{filteredQuestions.length}</strong> de {questions.length} preguntas en el banco</span>
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedGroup !== 'all' || selectedType !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedGroup('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No se encontraron preguntas con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const cat = categoryMeta[q.category] || categoryMeta.logica;
            const isOpenEnded = q.type === 'open_ended';

            return (
              <div
                key={q.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold ${cat.color}`}>
                      {cat.icon}
                      <span>{cat.label}</span>
                    </span>

                    {isOpenEnded ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                        <FileText className="w-3 h-3" />
                        <span>Respuesta Libre</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        <ListOrdered className="w-3 h-3" />
                        <span>Opción Múltiple</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 capitalize">
                      {q.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      Grupo: {q.targetGroup || 'ALL'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`¿Eliminar la pregunta "${q.title.slice(0, 40)}..."?`)) {
                          await onDeleteQuestion(q.id);
                        }
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{q.title}</h3>
                  {q.context && (
                    <div className="mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {q.context}
                    </div>
                  )}
                </div>

                {isOpenEnded ? (
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-indigo-900 block">Criterio / Respuesta Modelo para Evaluación por IA:</span>
                    <p className="text-indigo-800">{q.sampleAnswer || 'Sin respuesta modelo definida.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-gray-50/60 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="truncate">
                            <strong className="mr-1.5">{['A', 'B', 'C', 'D'][optIdx]}:</strong>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="shrink-0 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                              Correcta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-[11px] text-gray-500 italic bg-gray-50/50 p-2 rounded border border-gray-100">
                    <strong>Rúbrica / Explicación:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editingQuestion.id ? 'Editar Pregunta' : 'Añadir Nueva Pregunta'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              {/* Question Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Tipo de Pregunta *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, type: 'multiple_choice' })}
                    className={`p-3 rounded-lg border text-left flex items-center space-x-2.5 transition-all ${
                      editingQuestion.type === 'multiple_choice'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <ListOrdered className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Opción Múltiple</span>
                      <span className="text-[10px] text-gray-500 font-normal">4 opciones con 1 clave correcta</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, type: 'open_ended' })}
                    className={`p-3 rounded-lg border text-left flex items-center space-x-2.5 transition-all ${
                      editingQuestion.type === 'open_ended'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 font-bold'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Respuesta Libre</span>
                      <span className="text-[10px] text-gray-500 font-normal">Texto abierto evaluado con IA</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    Área Evaluativa *
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, category: e.target.value as QuestionCategory })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="logica">Lógica y Algoritmia</option>
                    <option value="matematicas">Análisis Matemático</option>
                    <option value="comprension">Comprensión Lectora</option>
                    <option value="psicologico">Test Psicológico</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    Dificultad *
                  </label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as QuestionDifficulty })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>

                {/* Target Group */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    Asignación de Grupo
                  </label>
                  <select
                    value={editingQuestion.targetGroup || 'ALL'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, targetGroup: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="ALL">Todos los Grupos (A, B, C)</option>
                    <option value="A">Grupo A</option>
                    <option value="B">Grupo B</option>
                    <option value="C">Grupo C</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                  Enunciado de la Pregunta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Desarrolle el pseudocódigo para calcular el salario neto..."
                  value={editingQuestion.title}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Context / Code */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                  Contexto, Caso de Estudio o Fragmento de Código (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Texto del caso, especificación de requerimientos o código a analizar..."
                  value={editingQuestion.context || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, context: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Conditional Inputs based on Type */}
              {editingQuestion.type === 'multiple_choice' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    4 Opciones de Respuesta (Marque el círculo de la opción correcta) *
                  </label>
                  {editingQuestion.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct-option-radio"
                        checked={editingQuestion.correctAnswer === optIdx}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: optIdx })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="w-5 text-xs font-bold text-gray-600">
                        {['A', 'B', 'C', 'D'][optIdx]}:
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Texto de la opción ${['A', 'B', 'C', 'D'][optIdx]}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[optIdx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          editingQuestion.correctAnswer === optIdx
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-indigo-900">
                    Respuesta Modelo / Criterios de Calificación Esperados *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Escriba la respuesta esperada o los puntos clave que la IA evaluará en la respuesta del aspirante..."
                    value={editingQuestion.sampleAnswer || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, sampleAnswer: e.target.value })}
                    className="w-full px-3 py-2 bg-indigo-50/40 border border-indigo-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:ring-1 focus:ring-indigo-600"
                  />
                  <span className="text-[11px] text-gray-500 block">
                    * El motor de IA comparará la redacción del aspirante contra estos criterios para calificar objetivamente de 0 a 100 puntos.
                  </span>
                </div>
              )}

              {/* Explanation / Rubric */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                  Justificación Pedagógica / Rúbrica
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique el razonamiento técnico de la solución..."
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Guardando en la Nube...' : 'Guardar Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
