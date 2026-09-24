import React, { useState } from 'react';
import { ExamResult, Question, SystemStats, AdmissionDecision } from '../../types';
import {
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FilePlus,
  BarChart3,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  KeyRound,
  Eye,
  UserCheck,
  Clock,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { ResultsTable } from './ResultsTable';
import { QuestionManager } from './QuestionManager';
import { QuestionImporter } from './QuestionImporter';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { AdminExamViewer } from './AdminExamViewer';
import { ClassificationReportModal } from './ClassificationReportModal';

interface AdminDashboardProps {
  results: ExamResult[];
  questions: Question[];
  stats: SystemStats;
  onSaveQuestion: (question: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onResetBank: () => Promise<void>;
  onDeleteResult: (id: string) => Promise<void>;
  onResendEmail: (id: string) => Promise<void>;
  onUpdateAdmission: (id: string, decision: AdmissionDecision) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  results,
  questions,
  stats,
  onSaveQuestion,
  onDeleteQuestion,
  onResetBank,
  onDeleteResult,
  onResendEmail,
  onUpdateAdmission,
  onRefreshData,
  onLogout,
}) => {
  const [adminSubTab, setAdminSubTab] = useState<'resultados' | 'preguntas' | 'examen' | 'importar' | 'seguridad'>('resultados');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner with Navigation between Admin Views */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Panel de Administración · Fase 2 ADSO
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gestión automática de resultados, visualización integral del examen, selección de admisión y banco de preguntas.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setAdminSubTab('resultados')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              adminSubTab === 'resultados'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Resultados ({results.length})</span>
          </button>

          <button
            id="admin-tab-examen-btn"
            type="button"
            onClick={() => setAdminSubTab('examen')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              adminSubTab === 'examen'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-700" />
            <span>Visualizar Examen</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminSubTab('preguntas')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              adminSubTab === 'preguntas'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Banco de Preguntas ({questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminSubTab('importar')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              adminSubTab === 'importar'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FilePlus className="w-3.5 h-3.5 text-purple-700" />
            <span>Importar JSON / PDF</span>
          </button>

          <button
            id="admin-tab-seguridad-btn"
            type="button"
            onClick={() => setAdminSubTab('seguridad')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              adminSubTab === 'seguridad'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>Seguridad</span>
          </button>

          {/* Direct Report Action Button */}
          <button
            id="admin-open-report-btn"
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-red-700 hover:bg-red-800 text-white shadow-2xs"
            title="Exportar reporte de lista de estudiantes con sus clasificaciones ordenados por puntaje en PDF"
          >
            <FileText className="w-3.5 h-3.5 text-red-200" />
            <span>Reporte PDF Clasificado</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Always visible in Resultados view) */}
      {adminSubTab === 'resultados' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Evaluated */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Total Evaluados
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-gray-900">{stats.totalExams}</span>
                <span className="text-xs text-gray-500">aspirantes</span>
              </div>
              <div className="mt-2 text-[11px] text-gray-400">
                Sincronizados en la nube
              </div>
            </div>

            {/* Aprobados */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aprobados (≥ 70%)</span>
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-emerald-700">{stats.totalAprobados}</span>
                <span className="text-xs text-emerald-800/80 font-bold">
                  ({stats.totalExams > 0 ? Math.round((stats.totalAprobados / stats.totalExams) * 100) : 0}%)
                </span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-700">
                Superaron umbral de admisión
              </div>
            </div>

            {/* Desaprobados */}
            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/20">
              <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Desaprobados (&lt; 70%)</span>
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-red-700">{stats.totalDesaprobados}</span>
                <span className="text-xs text-red-800/80 font-bold">
                  ({stats.totalExams > 0 ? Math.round((stats.totalDesaprobados / stats.totalExams) * 100) : 0}%)
                </span>
              </div>
              <div className="mt-2 text-[11px] text-red-700">
                No alcanzaron puntaje mínimo
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Promedio General
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-gray-900">{stats.averageScore}%</span>
                <span className="text-xs text-gray-500">global</span>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">
                Tasa de éxito: <strong>{stats.passingRate}%</strong>
              </div>
            </div>
          </div>

          {/* Admission Decisions KPI Bar (Admin Selection Status) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Estado de Admisión al Programa ADSO (Decisión del Administrador)</span>
                </h3>
                <span className="text-[11px] text-gray-500">
                  Aprobados (≥ 70%), En Lista de Espera y Desaprobados (&lt; 70%)
                </span>
              </div>
              <button
                id="admission-panel-export-report-btn"
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-900 text-xs font-bold transition-colors shrink-0 shadow-2xs"
                title="Generar y exportar reporte en tablas ordenado por puntaje en PDF"
              >
                <FileText className="w-3.5 h-3.5 text-red-700" />
                <span>Reporte PDF en Tablas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Estudiantes Admitidos</span>
                    <span className="text-[11px] text-emerald-700">Cupo confirmado en el programa</span>
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-800">
                  {stats.admissionCounts?.admitidos ?? stats.totalAprobados}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">Lista de Espera</span>
                    <span className="text-[11px] text-amber-700">Pendientes de liberación de cupo</span>
                  </div>
                </div>
                <span className="text-xl font-black text-amber-800">
                  {stats.admissionCounts?.enEspera ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-red-200 bg-red-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  <div>
                    <span className="text-xs font-bold text-red-900 block">No Admitidos</span>
                    <span className="text-[11px] text-red-700">No admitidos en esta convocatoria</span>
                  </div>
                </div>
                <span className="text-xl font-black text-red-800">
                  {stats.admissionCounts?.noAdmitidos ?? stats.totalDesaprobados}
                </span>
              </div>
            </div>
          </div>

          {/* Student Cohorts Capacity Status (30 students max per group) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Capacidad de Grupos de Estudiantes (Máximo 30 alumnos por grupo)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Los grupos son cohortes organizativas con tope de 30 estudiantes. Los primeros 30 aspirantes pertenecen al Grupo A; una vez completo, los siguientes se matriculan en el Grupo B, y luego en el C.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {(['A', 'B', 'C'] as const).map((grp) => {
                const count = stats.groupCounts[grp] || 0;
                const max = 30;
                const pct = Math.min(100, Math.round((count / max) * 100));
                const isFull = count >= max;
                const available = Math.max(0, max - count);

                return (
                  <div
                    key={grp}
                    className={`p-3.5 rounded-lg border ${
                      isFull
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm text-gray-900">Grupo {grp}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isFull
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFull ? 'COMPLETO (30/30)' : `${available} cupos libres`}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-1.5 my-1.5">
                      <span className="text-2xl font-black text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500 font-semibold">/ {max} estudiantes</span>
                      <span className="text-xs text-gray-400">({pct}%)</span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFull ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Averages */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Promedios Globales por Módulo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Lógica */}
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5 font-semibold text-gray-800">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lógica y Algoritmia</span>
                  </span>
                  <strong className="text-blue-700 text-sm">{stats.categoryAverages.logica}%</strong>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.categoryAverages.logica}%` }}></div>
                </div>
              </div>

              {/* Matemáticas */}
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5 font-semibold text-gray-800">
                    <Calculator className="w-3.5 h-3.5 text-purple-600" />
                    <span>Análisis Matemático</span>
                  </span>
                  <strong className="text-purple-700 text-sm">{stats.categoryAverages.matematicas}%</strong>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${stats.categoryAverages.matematicas}%` }}></div>
                </div>
              </div>

              {/* Comprensión */}
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5 font-semibold text-gray-800">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Comprensión Lectora</span>
                  </span>
                  <strong className="text-amber-700 text-sm">{stats.categoryAverages.comprension}%</strong>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${stats.categoryAverages.comprension}%` }}></div>
                </div>
              </div>

              {/* Psicológico */}
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5 font-semibold text-gray-800">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Psicológico</span>
                  </span>
                  <strong className="text-emerald-700 text-sm">{stats.categoryAverages.psicologico}%</strong>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${stats.categoryAverages.psicologico}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content View by Sub-Tab */}
      {adminSubTab === 'resultados' && (
        <ResultsTable
          results={results}
          questions={questions}
          onDeleteResult={onDeleteResult}
          onResendEmail={onResendEmail}
          onUpdateAdmission={onUpdateAdmission}
        />
      )}

      {adminSubTab === 'examen' && (
        <AdminExamViewer questions={questions} />
      )}

      {adminSubTab === 'preguntas' && (
        <QuestionManager
          questions={questions}
          onSaveQuestion={onSaveQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onResetBank={onResetBank}
        />
      )}

      {adminSubTab === 'importar' && (
        <QuestionImporter onImportSuccess={onRefreshData} />
      )}

      {adminSubTab === 'seguridad' && (
        <AdminSecuritySettings onLogout={onLogout} />
      )}

      {/* Classification Report Modal */}
      <ClassificationReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        results={results}
      />
    </div>
  );
};
