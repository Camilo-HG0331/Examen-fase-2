import React, { useState } from 'react';
import { ExamResult } from '../../types';
import { X, Mail, Send, CheckCircle2, Clock, User, Copy, Check } from 'lucide-react';

interface EmailViewerModalProps {
  result: ExamResult;
  onClose: () => void;
  onResend?: () => Promise<void> | void;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({
  result,
  onClose,
  onResend,
}) => {
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(result.emailNotification.statusMessage);

  const { candidate, emailNotification, overallScore, performanceTier } = result;

  const handleCopyHtml = () => {
    if (emailNotification.previewHtml) {
      navigator.clipboard.writeText(emailNotification.previewHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setResending(true);
    try {
      await onResend();
      setStatusMessage(`Correo reenviado exitosamente a ${candidate.email}`);
    } catch (err) {
      setStatusMessage('Error al intentar reenviar el correo.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Notificación Enviada por Correo Electrónico
              </h3>
              <p className="text-xs text-gray-500">
                Automatización de Despacho Inmediato · Fase 2 ADSO
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

        {/* Email Metadata Bar */}
        <div className="px-5 py-3 bg-gray-100/70 border-b border-gray-200 text-xs space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 font-medium">Destinatario:</span>
              <strong className="text-gray-900">{candidate.email}</strong>
              <span className="text-gray-400">({candidate.fullName})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Estado: {statusMessage || 'Enviado exitosamente'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-gray-500 pt-0.5">
            <div className="flex items-center space-x-2">
              <span>Asunto:</span>
              <span className="text-gray-800 font-medium">
                {emailNotification.subject || `Resultados Examen Fase 2 ADSO - ${candidate.fullName}`}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(emailNotification.sentAt || result.completedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Email HTML Preview Window */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden max-w-2xl mx-auto">
            {emailNotification.previewHtml ? (
              <div
                className="email-rendered-container"
                dangerouslySetInnerHTML={{ __html: emailNotification.previewHtml }}
              />
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No hay vista previa generada para esta notificación.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyHtml}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'HTML Copiado' : 'Copiar Código HTML'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {onResend && (
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{resending ? 'Reenviando...' : 'Reenviar Notificación'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
