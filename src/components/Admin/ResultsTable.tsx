import React, { useState } from 'react';
import { ExamResult, EvaluationGroup, Question, AdmissionDecision } from '../../types';
import {
  Search,
  Download,
  Mail,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Send,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Clock,
  UserCheck,
  Award,
} from 'lucide-react';
import { ResultDetailModal } from './ResultDetailModal';
import { EmailViewerModal } from './EmailViewerModal';
import { ClassificationReportModal, getStudentClassification } from './ClassificationReportModal';

interface ResultsTableProps {
  results: ExamResult[];
  questions: Question[];
  onDeleteResult: (id: string) => Promise<void>;
  onResendEmail: (id: string) => Promise<void>;
  onUpdateAdmission: (id: string, decision: AdmissionDecision) => Promise<void>;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  questions,
  onDeleteResult,
  onResendEmail,
  onUpdateAdmission,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 'all' | 'APROBADO' | 'DESAPROBADO'
  const [selectedAdmission, setSelectedAdmission] = useState<string>('all'); // 'all' | 'ADMITIDO' | 'LISTA_ESPERA' | 'NO_ADMITIDO'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultForDetail, setSelectedResultForDetail] = useState<ExamResult | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'resumen' | 'preguntas'>('resumen');
  const [selectedResultForEmail, setSelectedResultForEmail] = useState<ExamResult | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Deletion modal state (in-app modal to avoid window.confirm iframe blocks)
  const [candidateToDelete, setCandidateToDelete] = useState<ExamResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Filter results
  const filteredResults = results.filter((r) => {
    // Group filter (A, B, C)
    if (selectedGroup !== 'all' && r.candidate.assignedGroup !== selectedGroup) return false;

    // Status filter (Aprobado / Desaprobado)
    const isApproved = r.status === 'APROBADO' || r.overallScore >= 70;
    if (selectedStatus === 'APROBADO' && !isApproved) return false;
    if (selectedStatus === 'DESAPROBADO' && isApproved) return false;

    // Admission filter
    const currentDecision = r.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO');
    if (selectedAdmission !== 'all' && currentDecision !== selectedAdmission) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = r.candidate.fullName.toLowerCase().includes(q);
      const inDoc = r.candidate.documentNumber.includes(q);
      const inEmail = r.candidate.email.toLowerCase().includes(q);
      if (!inName && !inDoc && !inEmail) return false;
    }
    return true;
  });

  // Handle Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    try {
      const targetName = candidateToDelete.candidate.fullName;
      await onDeleteResult(candidateToDelete.id);
      setDeleteSuccessMsg(`El examen y resultado de ${targetName} ha sido eliminado del sistema.`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);
      setCandidateToDelete(null);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar resultado: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV (Ordered by score descending with classifications)
  const handleExportCsv = () => {
    if (filteredResults.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    // Sort by overallScore descending
    const sorted = [...filteredResults].sort((a, b) => b.overallScore - a.overallScore);

    const headers = [
      'Puesto_Ranking',
      'Clasificacion_Final',
      'Puntaje_Global_%',
      'Estado_Evaluacion',
      'Aspirante',
      'Tipo_Documento',
      'Numero_Documento',
      'Correo_Electronico',
      'Grupo_Estudiantes',
      'Logica_%',
      'Matematicas_%',
      'Comprension_%',
      'Psicologico_%',
      'Estado_Email',
      'Fecha_Realizacion',
      'ID_Examen',
    ];

    const rows = sorted.map((r, index) => {
      const cls = getStudentClassification(r);
      const clsLabel =
        cls === 'APROBADO'
          ? 'APROBADO (ADMITIDO)'
          : cls === 'LISTA_ESPERA'
          ? 'EN LISTA DE ESPERA'
          : 'DESAPROBADO (NO ADMITIDO)';

      return [
        index + 1,
        `"${clsLabel}"`,
        r.overallScore,
        `"${r.status}"`,
        `"${r.candidate.fullName.replace(/"/g, '""')}"`,
        `"${r.candidate.documentType}"`,
        `"${r.candidate.documentNumber}"`,
        `"${r.candidate.email}"`,
        `"Grupo ${r.candidate.assignedGroup}"`,
        r.scores.logica?.percentage ?? 0,
        r.scores.matematicas?.percentage ?? 0,
        r.scores.comprension?.percentage ?? 0,
        r.scores.psicologico?.percentage ?? 0,
        `"${r.emailNotification.sent ? 'Enviado' : 'Pendiente'}"`,
        `"${new Date(r.completedAt).toLocaleString('es-CO')}"`,
        `"${r.id}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-estudiantes-adso-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-resultados-adso-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
      {/* Toast message if deleted */}
      {deleteSuccessMsg && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{deleteSuccessMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Gestión Automática de Resultados ({filteredResults.length} de {results.length})</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Estado automático: <strong>Aprobado</strong> (≥ 70%) o <strong>Desaprobado</strong> (&lt; 70%). Grupos de estudiantes con capacidad de máx. 30 alumnos.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="open-classified-report-btn"
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-2xs transition-colors"
              title="Abrir y exportar reporte completo de aspirantes clasificados en PDF y Excel ordenado por puntaje"
            >
              <FileText className="w-3.5 h-3.5 text-red-200" />
              <span>Reporte PDF Clasificado</span>
            </button>
            <button
              id="export-csv-btn"
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exportar CSV</span>
            </button>
            <button
              id="export-json-btn"
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Copia Nube JSON</span>
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              id="search-aspirants-input"
              type="text"
              placeholder="Buscar por aspirante, cédula o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Group filter */}
          <select
            id="filter-group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-gray-800"
          >
            <option value="all">Todos los Grupos de Estudiantes</option>
            <option value="A">Grupo A (Capacidad máx. 30 alumnos)</option>
            <option value="B">Grupo B (Capacidad máx. 30 alumnos)</option>
            <option value="C">Grupo C (Capacidad máx. 30 alumnos)</option>
          </select>

          {/* Status filter: APROBADO / DESAPROBADO */}
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-gray-800"
          >
            <option value="all">Todos los Estados del Examen</option>
            <option value="APROBADO">Solo Aprobados (Puntaje ≥ 70%)</option>
            <option value="DESAPROBADO">Solo Desaprobados (Puntaje &lt; 70%)</option>
          </select>

          {/* Admission Decision Filter */}
          <select
            id="filter-admission-select"
            value={selectedAdmission}
            onChange={(e) => setSelectedAdmission(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-gray-800"
          >
            <option value="all">Todas las Decisiones de Admisión</option>
            <option value="ADMITIDO">Solo Admitidos</option>
            <option value="LISTA_ESPERA">Solo en Lista de Espera</option>
            <option value="NO_ADMITIDO">Solo No Admitidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4">Aspirante / Documento</th>
              <th className="py-3 px-3 text-center">Grupo de Estudiantes</th>
              <th className="py-3 px-3 text-center">Puntaje Global</th>
              <th className="py-3 px-3 text-center">Estado Examen</th>
              <th className="py-3 px-3 text-center">Decisión Admisión (Admin)</th>
              <th className="py-3 px-3 text-center">Lógica</th>
              <th className="py-3 px-3 text-center">Matem.</th>
              <th className="py-3 px-3 text-center">Lectora</th>
              <th className="py-3 px-3 text-center">Psicol.</th>
              <th className="py-3 px-3">Correo</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No hay evaluaciones registradas con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredResults.map((r) => {
                const isApproved = r.status === 'APROBADO' || r.overallScore >= 70;

                return (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Candidate */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{r.candidate.fullName}</div>
                      <div className="text-gray-500 text-[11px]">
                        {r.candidate.documentType} {r.candidate.documentNumber} · {r.candidate.email}
                      </div>
                    </td>

                    {/* Group of students */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Grupo {r.candidate.assignedGroup}
                      </span>
                    </td>

                    {/* Overall Score */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-sm text-gray-900">
                        {r.overallScore}%
                      </span>
                    </td>

                    {/* Estado: Aprobado / Desaprobado */}
                    <td className="py-3 px-3 text-center">
                      {isApproved ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>APROBADO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <XCircle className="w-3 h-3 text-red-700" />
                          <span>DESAPROBADO</span>
                        </span>
                      )}
                    </td>

                    {/* Decisión de Admisión (Admin): Selección Activa */}
                    <td className="py-3 px-3 text-center">
                      <select
                        id={`admission-decision-select-${r.id}`}
                        value={r.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO')}
                        onChange={(e) => onUpdateAdmission(r.id, e.target.value as AdmissionDecision)}
                        className={`px-2 py-1 rounded text-xs font-bold border transition-colors cursor-pointer focus:outline-none focus:ring-1 ${
                          (r.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO')) === 'ADMITIDO'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : (r.admissionDecision || (isApproved ? 'ADMITIDO' : 'NO_ADMITIDO')) === 'LISTA_ESPERA'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                        title="Seleccionar estado de admisión del estudiante en ADSO"
                      >
                        <option value="ADMITIDO">✓ Admitido</option>
                        <option value="LISTA_ESPERA">⏳ En Espera</option>
                        <option value="NO_ADMITIDO">✕ No Admitido</option>
                      </select>
                    </td>

                    {/* Category scores */}
                    <td className="py-3 px-3 text-center font-medium text-blue-700">
                      {r.scores?.logica?.percentage ?? 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-purple-700">
                      {r.scores?.matematicas?.percentage ?? 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-amber-700">
                      {r.scores?.comprension?.percentage ?? 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-emerald-700">
                      {r.scores?.psicologico?.percentage ?? 0}%
                    </td>

                    {/* Email status */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedResultForEmail(r)}
                        className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-medium hover:underline"
                        title="Ver correo despachado"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enviado</span>
                      </button>
                    </td>

                    {/* Actions: View Details, View Entire Exam, Resend Email, and Enabled Delete button */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          id={`view-detail-${r.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedResultForDetail(r);
                            setDetailModalTab('resumen');
                          }}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                          title="Ver informe diagnóstico"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`view-entire-exam-${r.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedResultForDetail(r);
                            setDetailModalTab('preguntas');
                          }}
                          className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          title="Visualizar todo el examen (40 preguntas y respuestas del aspirante)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`resend-email-${r.id}`}
                          type="button"
                          onClick={() => onResendEmail(r.id)}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Reenviar correo"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Habilitar Botón de Eliminar claramente funcional */}
                        <button
                          id={`delete-result-${r.id}`}
                          type="button"
                          onClick={() => setCandidateToDelete(r)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Eliminar este resultado de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Result Detail Modal */}
      {selectedResultForDetail && (
        <ResultDetailModal
          result={selectedResultForDetail}
          questions={questions}
          onClose={() => setSelectedResultForDetail(null)}
          onDelete={onDeleteResult}
          onResendEmail={onResendEmail}
          onUpdateAdmission={onUpdateAdmission}
          initialTab={detailModalTab}
        />
      )}

      {/* Email Viewer Modal */}
      {selectedResultForEmail && (
        <EmailViewerModal
          result={selectedResultForEmail}
          onClose={() => setSelectedResultForEmail(null)}
          onResend={() => onResendEmail(selectedResultForEmail.id)}
        />
      )}

      {/* In-App Confirmation Modal for Safe & Reliable Deletion */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                ¿Eliminar registro de evaluación?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Está a punto de eliminar permanentemente la prueba y calificación del aspirante:
              </p>
              <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-left text-xs space-y-1">
                <p><strong>Aspirante:</strong> {candidateToDelete.candidate.fullName}</p>
                <p><strong>Documento:</strong> {candidateToDelete.candidate.documentType} {candidateToDelete.candidate.documentNumber}</p>
                <p><strong>Grupo:</strong> Grupo {candidateToDelete.candidate.assignedGroup}</p>
                <p><strong>Puntaje:</strong> {candidateToDelete.overallScore}% ({candidateToDelete.status})</p>
              </div>
              <p className="text-xs text-red-600 font-medium">
                Esta acción liberará el cupo en el grupo de estudiantes y no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCandidateToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-action-btn"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
