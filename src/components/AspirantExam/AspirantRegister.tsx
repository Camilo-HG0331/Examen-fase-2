import React, { useState, useEffect } from 'react';
import { Candidate, EvaluationGroup, CohortGroupStatus } from '../../types';
import { User, Mail, FileText, Users, ArrowRight, CheckCircle2, AlertCircle, Info, Lock, Loader2 } from 'lucide-react';
import { SenaLogo } from '../SenaLogo';

interface AspirantRegisterProps {
  onRegister: (candidate: Candidate) => void;
  availableQuestionsCount: number;
}

export const AspirantRegister: React.FC<AspirantRegisterProps> = ({
  onRegister,
  availableQuestionsCount,
}) => {
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'CC' | 'TI' | 'CE' | 'PASAPORTE'>('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [assignedGroup, setAssignedGroup] = useState<EvaluationGroup>('A');
  const [cohortStatus, setCohortStatus] = useState<Record<EvaluationGroup, CohortGroupStatus> | null>(null);
  const [totalEnrolled, setTotalEnrolled] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [checkingDoc, setCheckingDoc] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<{
    completed: boolean;
    completedAt?: string;
    fullName?: string;
    status?: string;
    overallScore?: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/cohorts/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const cohorts = data.cohorts || {};
          setCohortStatus(cohorts);
          if (typeof data.totalEnrolled === 'number') {
            setTotalEnrolled(data.totalEnrolled);
          }
          if (data.currentActiveGroup && cohorts[data.currentActiveGroup] && !cohorts[data.currentActiveGroup].isFull) {
            setAssignedGroup(data.currentActiveGroup);
          } else {
            const availableGroup = (['A', 'B', 'C'] as EvaluationGroup[]).find(
              (g) => cohorts[g] && !cohorts[g].isFull
            );
            if (availableGroup) {
              setAssignedGroup(availableGroup);
            }
          }
        }
      })
      .catch((err) => console.warn('No se pudo cargar estado de cohortes:', err));
  }, []);

  // Check if student already completed exam when document number changes
  useEffect(() => {
    const cleanDoc = documentNumber.trim();
    if (cleanDoc.length < 5) {
      setCompletedAttempt(null);
      return;
    }

    const timer = setTimeout(() => {
      setCheckingDoc(true);
      fetch(`/api/aspirants/check-completed/${encodeURIComponent(cleanDoc)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.completed) {
            setCompletedAttempt(data);
            if (data.fullName && !fullName) {
              setFullName(data.fullName);
            }
          } else {
            setCompletedAttempt(null);
          }
        })
        .catch((err) => console.warn('Error checking aspirant completion:', err))
        .finally(() => setCheckingDoc(false));
    }, 450);

    return () => clearTimeout(timer);
  }, [documentNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (completedAttempt?.completed) {
      setError('Este aspirante ya ha concluido su examen Fase 2 ADSO. No está permitido repetirlo.');
      return;
    }

    if (!fullName.trim()) {
      setError('Por favor ingrese sus nombres y apellidos completos.');
      return;
    }
    if (!documentNumber.trim()) {
      setError('Por favor ingrese su número de documento de identidad.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Por favor ingrese un correo electrónico válido para recibir los resultados.');
      return;
    }

    const currentCohort = cohortStatus ? cohortStatus[assignedGroup] : null;
    if (currentCohort && (currentCohort.isFull || currentCohort.enrolledCount >= 30)) {
      setError(`El Grupo ${assignedGroup} se encuentra completamente lleno (30/30 estudiantes inscritos). No se permite el ingreso a este grupo. Por favor seleccione otro grupo.`);
      return;
    }

    onRegister({
      fullName: fullName.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      email: email.trim(),
      assignedGroup,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 mb-3">
                Convocatoria Nacional SENA · ADSO Fase 2
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Examen de Selección Automatizado
              </h1>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-md shrink-0 flex items-center justify-center">
              <SenaLogo className="w-10 h-10 object-contain" />
            </div>
          </div>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed max-w-2xl">
            Tecnología en Análisis y Desarrollo de Software. Esta prueba evalúa cuatro áreas fundamentales: 
            <strong> Lógica de Programación</strong>, <strong>Análisis Matemático</strong>, 
            <strong> Comprensión Lectora</strong> y <strong>Test Psicológico/Vocacional</strong>.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Nombre Completo */}
            <div>
              <label htmlFor="fullname-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Nombres y Apellidos del Aspirante *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullname-input"
                  type="text"
                  required
                  placeholder="Ej. Andrés Felipe Gómez Castro"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tipo y Número de Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="doc-type-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tipo Doc. *
                </label>
                <select
                  id="doc-type-select"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="CC">Cédula Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta Identidad (TI)</option>
                  <option value="CE">Cédula Extranjería (CE)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="doc-number-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Número de Documento *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    id="doc-number-input"
                    type="text"
                    required
                    placeholder="Ej. 1020304050"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                {checkingDoc && (
                  <p className="text-[11px] text-gray-500 mt-1 flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                    <span>Verificando habilitación institucional del documento...</span>
                  </p>
                )}

                {completedAttempt?.completed && (
                  <div className="mt-2.5 p-3.5 bg-red-50 border border-red-300 rounded-lg flex items-start space-x-3 text-xs text-red-900 shadow-2xs">
                    <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-950 text-sm">
                        Examen Ya Finalizado · Intento Único Institucional
                      </p>
                      <p className="text-red-800 leading-relaxed">
                        El aspirante <strong>{completedAttempt.fullName || fullName}</strong> ya completó y envió su examen de selección Fase 2 el{' '}
                        {completedAttempt.completedAt ? new Date(completedAttempt.completedAt).toLocaleString() : 'previamente'}.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            completedAttempt.status === 'APROBADO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          Calificación: {completedAttempt.overallScore}% ({completedAttempt.status})
                        </span>
                        <span className="text-red-700 text-[11px] italic">
                          Por normatividad de la convocatoria, no está habilitada la repetición de la prueba.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Correo Electrónico (Notificación) */}
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Correo Electrónico para Envío de Resultados *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Al terminar el examen, el sistema generará y enviará inmediatamente a este buzón su certificado y calificación detallada.
              </p>
            </div>

            {/* Grupo de Convocatoria (Cohortes de máx. 30 alumnos) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Grupo de Convocatoria (Cohorte de máx. 30 estudiantes) *
                </label>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Total Inscritos: <strong>{totalEnrolled} estudiantes</strong>
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2.5">
                Cada cohorte cuenta con un cupo estricto de máximo 30 estudiantes. Si un grupo se encuentra lleno, queda automáticamente bloqueado y se debe seleccionar otro grupo disponible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['A', 'B', 'C'] as EvaluationGroup[]).map((grp) => {
                  const info = cohortStatus ? cohortStatus[grp] : null;
                  const enrolled = info ? (info.enrolledCount ?? info.enrolled ?? 0) : 0;
                  const max = 30;
                  const isFull = enrolled >= max;
                  const available = Math.max(0, max - enrolled);
                  const isSelected = assignedGroup === grp;

                  return (
                    <button
                      key={grp}
                      type="button"
                      disabled={isFull}
                      onClick={() => !isFull && setAssignedGroup(grp)}
                      className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between relative ${
                        isFull
                          ? 'border-red-200 bg-red-50/50 text-gray-400 cursor-not-allowed select-none'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-base font-black ${isFull ? 'text-gray-500' : 'text-gray-900'}`}>
                          Grupo {grp}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                            isFull
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isFull ? 'LLENO (30/30)' : `${available} cupos libres`}
                        </span>
                      </div>

                      <div className="w-full text-xs space-y-1 mt-1">
                        <div className="flex justify-between text-[11px] font-medium text-gray-600">
                          <span>Estudiantes inscritos:</span>
                          <strong className={isFull ? 'text-red-700 font-bold' : 'text-gray-900'}>
                            {enrolled} / {max}
                          </strong>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isFull ? 'bg-red-500' : isSelected ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((enrolled / max) * 100))}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-500 pt-0.5">
                          {isFull ? (
                            <span className="text-red-600 font-semibold">Grupo lleno. No permite ingreso.</span>
                          ) : (
                            <span>{enrolled === 0 ? 'Sin inscritos aún' : `${enrolled} aspirantes registrados`}</span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Garantías y Resumen */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 space-y-1.5 text-xs text-emerald-900">
            <div className="flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Garantías de Automatización Fase 2 ADSO:</span>
            </div>
            <ul className="list-disc list-inside pl-1 text-gray-600 space-y-0.5">
              <li>{availableQuestionsCount} preguntas activas de evaluación técnica y psicotécnica.</li>
              <li>Calificación automática instantánea en grupos A, B y C.</li>
              <li>Despacho automatizado del informe psicotécnico a su correo electrónico.</li>
            </ul>
          </div>

          {/* Botón Comenzar */}
          <button
            id="start-registration-btn"
            type="submit"
            disabled={Boolean(completedAttempt?.completed) || checkingDoc}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-lg text-white font-medium text-sm sm:text-base shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
              completedAttempt?.completed
                ? 'bg-gray-400 cursor-not-allowed opacity-90'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {completedAttempt?.completed ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Examen Ya Presentado (Intento Único Bloqueado)</span>
              </>
            ) : checkingDoc ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando Habilitación...</span>
              </>
            ) : (
              <>
                <span>Continuar a las Instrucciones del Examen</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
