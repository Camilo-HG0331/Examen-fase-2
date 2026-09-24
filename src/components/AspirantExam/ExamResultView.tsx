import React, { useState } from 'react';
import { ExamResult } from '../../types';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Mail,
  Cpu,
  Calculator,
  BookOpen,
  HeartHandshake,
  Home,
  Lock,
  Eye,
  Send,
} from 'lucide-react';
import { EmailViewerModal } from '../Admin/EmailViewerModal';

interface ExamResultViewProps {
  result: ExamResult;
  onRestart: () => void;
  onGoToAdmin?: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onRestart,
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState(result.emailNotification.statusMessage);

  const { candidate, scores, overallScore, status, aiFeedback, completedAt } = result;

  const isApproved = status === 'APROBADO' || overallScore >= 70;

  const statusMeta = isApproved
    ? {
        title: 'ESTADO: APROBADO',
        subtitle: 'Cumple satisfactoriamente con los estándares y competencias exigidos para la carrera ADSO.',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        badge: 'bg-emerald-600 text-white',
        ring: 'border-emerald-600',
      }
    : {
        title: 'ESTADO: DESAPROBADO',
        subtitle: 'Puntaje global por debajo del 70% requerido para superar la Fase 2 de ADSO.',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-600 text-white',
        ring: 'border-red-600',
      };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const res = await fetch(`/api/results/${result.id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEmailStatusMsg(`Correo reenviado exitosamente a ${candidate.email}`);
      }
    } catch (err) {
      console.error(err);
      setEmailStatusMsg('Error al intentar reenviar el correo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Main Result Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Banner with Overall Score */}
        <div className={`p-6 sm:p-8 text-center border-b ${statusMeta.border} ${statusMeta.bg}`}>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-white/80 border border-gray-200 text-gray-800">
            <span>Evaluación Finalizada · Sincronizada en Nube</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Resultados Fase 2 ADSO
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Aspirante: <strong>{candidate.fullName}</strong> · {candidate.documentType} {candidate.documentNumber}
          </p>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Cohorte: <span className="px-2 py-0.5 rounded bg-white border border-gray-300 font-bold">Grupo {candidate.assignedGroup}</span> (Máx. 30 estudiantes)
          </p>

          <div className="my-6">
            <div className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white shadow-sm border-4 ${statusMeta.ring}`}>
              <span className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">
                {overallScore}%
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase mt-1">
                Puntaje Global
              </span>
            </div>
          </div>

          <div className="inline-block">
            <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs ${statusMeta.badge}`}>
              {statusMeta.title}
            </span>
          </div>
          <p className="text-xs text-gray-600 max-w-md mx-auto mt-2">
            {statusMeta.subtitle}
          </p>
        </div>

        {/* Breakdown by areas */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Desglose por Áreas Evaluadas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lógica */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>Lógica y Algoritmia</span>
                </div>
                <span className="text-blue-700 font-extrabold">{scores.logica.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${scores.logica.percentage}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{scores.logica.correct} de {scores.logica.total} aciertos</span>
                <span>{scores.logica.percentage >= 70 ? 'Apto' : 'Requiere refuerzo'}</span>
              </div>
            </div>

            {/* Matemáticas */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <span>Análisis Matemático</span>
                </div>
                <span className="text-purple-700 font-extrabold">{scores.matematicas.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${scores.matematicas.percentage}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{scores.matematicas.correct} de {scores.matematicas.total} aciertos</span>
                <span>{scores.matematicas.percentage >= 70 ? 'Apto' : 'Requiere refuerzo'}</span>
              </div>
            </div>

            {/* Comprensión */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span>Comprensión Lectora</span>
                </div>
                <span className="text-amber-700 font-extrabold">{scores.comprension.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${scores.comprension.percentage}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{scores.comprension.correct} de {scores.comprension.total} aciertos</span>
                <span>{scores.comprension.percentage >= 70 ? 'Apto' : 'Requiere refuerzo'}</span>
              </div>
            </div>

            {/* Psicológico */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>
                  <span>Test Psicológico / Vocacional</span>
                </div>
                <span className="text-emerald-700 font-extrabold">{scores.psicologico.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${scores.psicologico.percentage}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{scores.psicologico.correct} de {scores.psicologico.total} aciertos</span>
                <span>{scores.psicologico.percentage >= 70 ? 'Perfil Idóneo' : 'Nivel aceptable'}</span>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Feedback */}
          {aiFeedback && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 space-y-1">
              <span className="font-bold block text-blue-950">
                Diagnóstico Técnico Automatizado:
              </span>
              <p className="leading-relaxed text-blue-800">
                {aiFeedback}
              </p>
            </div>
          )}

          {/* Automated Email Confirmation Card */}
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Notificación al Correo Electrónico
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Se ha enviado el certificado oficial con la calificación detallada a:
                  </p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {candidate.email}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {emailStatusMsg}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ver Correo Generado</span>
                </button>
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendEmail}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{isResending ? 'Enviando...' : 'Reenviar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Aviso Institucional: Examen Cerrado / Sin Repetición */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-800">
            <Lock className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-slate-900">
                Examen Cerrado y Consolidado · Intento Único
              </span>
              <p className="text-slate-600 leading-relaxed">
                Su prueba ha concluido y los resultados se encuentran debidamente guardados en la nube y despachados a su correo. Para salvaguardar la transparencia de la convocatoria Fase 2 ADSO, <strong>no está permitido repetir la prueba</strong>.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center pt-4 border-t border-gray-200">
            <button
              id="return-to-landing-btn"
              type="button"
              onClick={onRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>Finalizar y Regresar a la Página Principal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <EmailViewerModal
          result={result}
          onClose={() => setShowEmailModal(false)}
          onResend={handleResendEmail}
        />
      )}
    </div>
  );
};
