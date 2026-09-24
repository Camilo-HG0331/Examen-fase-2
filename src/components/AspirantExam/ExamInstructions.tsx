import React from 'react';
import { Candidate } from '../../types';
import { Clock, Cpu, Calculator, BookOpen, HeartHandshake, ShieldAlert, ArrowRight, ArrowLeft, Shuffle, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

interface ExamInstructionsProps {
  candidate: Candidate;
  onStartExam: () => void;
  onBack: () => void;
  totalQuestions: number;
}

export const ExamInstructions: React.FC<ExamInstructionsProps> = ({
  candidate,
  onStartExam,
  onBack,
  totalQuestions,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Paso 2 de 3 · Sala de Inducción y Normas
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              Instrucciones Oficiales · Fase 2 ADSO
            </h2>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
            <span className="text-gray-500">Aspirante: </span>
            <strong className="text-gray-900">{candidate.fullName}</strong>
            <span className="ml-2 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Grupo {candidate.assignedGroup}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Critical Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-red-900 block">Tiempo Límite: 30 Minutos</span>
                <span className="text-[11px] text-red-800">
                  Pasada media hora, el examen se cierra y califica automáticamente.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start space-x-3">
              <Shuffle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-blue-900 block">Orden Anti-Copia</span>
                <span className="text-[11px] text-blue-800">
                  Mismo banco pero con permutación aleatoria de preguntas y opciones.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start space-x-3">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-emerald-900 block">40 Preguntas (10 c/u)</span>
                <span className="text-[11px] text-emerald-800">
                  Opción múltiple y preguntas con respuesta libre evaluadas por IA.
                </span>
              </div>
            </div>
          </div>

          {/* 4 Evaluative Areas Grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
              Estructura de la Evaluación (10 Preguntas por Componente = 40 Preguntas)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lógica */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-blue-900">1. Lógica y Algoritmia</h4>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">10 Preguntas</span>
                  </div>
                  <p className="text-xs text-blue-800/80 mt-1">
                    Pseudocódigo, condicionales anidados, bucles iterativos, estructuras de control y lógica proposicional.
                  </p>
                </div>
              </div>

              {/* Matemático */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-purple-900">2. Análisis Matemático</h4>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">10 Preguntas</span>
                  </div>
                  <p className="text-xs text-purple-800/80 mt-1">
                    Regla de tres, porcentajes de optimización, proporciones computacionales, escalas y razonamiento numérico.
                  </p>
                </div>
              </div>

              {/* Comprensión */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-900">3. Comprensión Lectora</h4>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">10 Preguntas</span>
                  </div>
                  <p className="text-xs text-amber-800/80 mt-1">
                    Interpretación de especificaciones técnicas, historias de usuario, requerimientos y detección de ambigüedades.
                  </p>
                </div>
              </div>

              {/* Psicológico */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-900">4. Test Psicológico y Vocacional</h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">10 Preguntas</span>
                  </div>
                  <p className="text-xs text-emerald-800/80 mt-1">
                    Trabajo colaborativo (Scrum), resiliencia a la frustración, pensamiento crítico, ética profesional e integridad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Classification tiers */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-gray-500" />
              <span>Clasificación Automatizada en Grupos Evaluativos</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Grupo A · Admitido (≥ 80%)</span>
                <span className="text-emerald-700 text-[11px]">Cupo directo e inmediato para el programa ADSO.</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900 block">Grupo B · Lista de Espera (60% - 79%)</span>
                <span className="text-amber-700 text-[11px]">Asignación prioritaria ante cupos liberados.</span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="font-bold text-red-900 block">Grupo C · No Admitido (&lt; 60%)</span>
                <span className="text-red-700 text-[11px]">Recomendación de cursos formativos introductorios.</span>
              </div>
            </div>
          </div>

          {/* Email notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Al finalizar o cuando expiren los 30 minutos, el reporte con el certificado y el desglose de puntajes será enviado inmediatamente a: <strong>{candidate.email}</strong> y archivado en la nube.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              id="back-to-register-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modificar Mis Datos</span>
            </button>

            <button
              id="start-exam-now-btn"
              type="button"
              onClick={onStartExam}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <span>Iniciar Examen Oficial (30 Minutos)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
