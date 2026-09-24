import React, { useState } from 'react';
import { Question, QuestionCategory } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  Clock,
  Layers,
  HelpCircle,
  Hash,
} from 'lucide-react';

interface AdminExamViewerProps {
  questions: Question[];
}

export const AdminExamViewer: React.FC<AdminExamViewerProps> = ({ questions }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<{ id: QuestionCategory; label: string; icon: any; color: string }> = [
    { id: 'logica', label: 'Lógica de Programación', icon: Cpu, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'matematicas', label: 'Razonamiento Matemático', icon: Calculator, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'comprension', label: 'Comprensión Lectora', icon: BookOpen, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'psicologico', label: 'Test Psicotécnico / Vocacional', icon: HeartHandshake, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  // Count questions per category
  const categoryCounts = {
    logica: questions.filter((q) => q.category === 'logica').length,
    matematicas: questions.filter((q) => q.category === 'matematicas').length,
    comprension: questions.filter((q) => q.category === 'comprension').length,
    psicologico: questions.filter((q) => q.category === 'psicologico').length,
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inTitle = q.title.toLowerCase().includes(query);
      const inPrompt = q.prompt.toLowerCase().includes(query);
      const inContext = (q.context || '').toLowerCase().includes(query);
      if (!inTitle && !inPrompt && !inContext) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden space-y-6 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Cuestionario Oficial Completo · Fase 2 ADSO</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Visualización Completa del Examen
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Consulte el cuestionario estandarizado de 40 preguntas que presentan todos los aspirantes (10 por componente temático). El examen se genera con un orden aleatorio anti-copia para cada estudiante y dispone de un tiempo límite estricto de 30 minutos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Tiempo Límite</span>
                <span className="font-bold text-gray-900">30 Minutos</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Estructura</span>
                <span className="font-bold text-gray-900">4 Componentes (40 P.)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Components Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id];
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${count === 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                    {count} / 10
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 truncate">{cat.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">25% del puntaje total</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar pregunta por enunciado, código o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Mostrando:</span>
          <span className="font-bold text-gray-900">{filteredQuestions.length}</span>
          <span>de {questions.length} preguntas en el banco</span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const catInfo = categories.find((c) => c.id === q.category);

          return (
            <div
              key={q.id || idx}
              className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all space-y-3"
            >
              {/* Question Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-900 text-white font-black text-xs">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900">
                    {q.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${catInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                    {catInfo?.label || q.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {q.type === 'open_ended' ? 'Respuesta Libre' : 'Opción Múltiple'}
                  </span>
                </div>
              </div>

              {/* Prompt Enunciado */}
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                {q.prompt}
              </p>

              {/* Context / Code snippet */}
              {q.context && (
                q.category === 'comprension' ? (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 text-slate-900 rounded-lg text-xs leading-relaxed space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider pb-1 border-b border-amber-200/70">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>Texto Base de Lectura y Análisis</span>
                    </div>
                    <div className="font-serif whitespace-pre-line text-slate-800">
                      {q.context}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-slate-800">
                    {q.context}
                  </div>
                )
              )}

              {/* Options or Open Ended Rubric */}
              {q.type === 'open_ended' ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5 text-xs text-blue-950">
                  <span className="font-bold block">
                    Criterio de Evaluación y Respuesta Modelo (IA Gemini / Heurística):
                  </span>
                  <p className="text-blue-900 leading-relaxed font-mono bg-white p-2.5 rounded border border-blue-200">
                    {q.sampleAnswer || 'Evaluación semántica de coherencia técnica y argumentación.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = q.correctAnswer === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isCorrect ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Respuesta Correcta</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {q.explanation && (
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  <strong className="text-gray-900">Justificación Técnica: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
