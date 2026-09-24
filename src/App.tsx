/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AspirantRegister } from './components/AspirantExam/AspirantRegister';
import { ExamInstructions } from './components/AspirantExam/ExamInstructions';
import { ExamRunner } from './components/AspirantExam/ExamRunner';
import { ExamResultView } from './components/AspirantExam/ExamResultView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Candidate, Question, ExamResult, SystemStats, AdmissionDecision } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'aspirant' | 'admin'>('aspirant');
  const [aspirantStep, setAspirantStep] = useState<'register' | 'instructions' | 'exam' | 'result'>('register');
  
  // Administrator authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('adso_admin_auth') === 'true';
  });

  // Domain state
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [activeResult, setActiveResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initial load from cloud database
  const loadInitialData = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const [qRes, rRes, sRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/results'),
        fetch('/api/stats'),
      ]);

      if (!qRes.ok || !rRes.ok || !sRes.ok) {
        throw new Error('Error al conectar con el servidor de la nube.');
      }

      const qData = await qRes.json();
      const rData = await rRes.json();
      const sData = await sRes.json();

      setQuestions(qData);
      setResults(rData);
      setStats(sData);
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Step 1 -> Step 2: Aspirant Registration
  const handleRegisterCandidate = (newCandidate: Candidate) => {
    setCandidate(newCandidate);
    setAspirantStep('instructions');
  };

  // Step 2 -> Step 3: Start Exam with randomized 40-question bank (10 per category)
  const handleStartExam = async () => {
    if (!candidate) return;
    setIsLoadingExam(true);

    try {
      const res = await fetch(`/api/exams/generate?group=${candidate.assignedGroup}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setExamQuestions(data.questions);
      } else {
        // Fallback to locally filtered questions
        const fallback = questions.filter(
          (q) => !q.targetGroup || q.targetGroup === 'ALL' || q.targetGroup === candidate.assignedGroup
        );
        setExamQuestions(fallback.length > 0 ? fallback : questions);
      }
      setAspirantStep('exam');
    } catch (err) {
      console.error('Error fetching randomized exam questions:', err);
      // Fallback
      const fallback = questions.filter(
        (q) => !q.targetGroup || q.targetGroup === 'ALL' || q.targetGroup === candidate.assignedGroup
      );
      setExamQuestions(fallback.length > 0 ? fallback : questions);
      setAspirantStep('exam');
    } finally {
      setIsLoadingExam(false);
    }
  };

  // Step 3 -> Step 4: Submit Exam (Evaluates both multiple choice & free response)
  const handleSubmitExam = async (
    answers: { questionId: string; selectedOption?: number; selectedOptionText?: string; textAnswer?: string }[]
  ) => {
    if (!candidate) return;
    setIsSubmittingExam(true);
    setGlobalError(null);

    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la evaluación.');
      }

      // Server returns examResult object
      setActiveResult(data);
      setAspirantStep('result');
      // Refresh stats and results in background
      loadInitialData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al enviar el examen: ${err.message}`);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Reset aspirant flow
  const handleRestartAspirant = () => {
    setCandidate(null);
    setActiveResult(null);
    setExamQuestions([]);
    setAspirantStep('register');
  };

  // Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('adso_admin_auth');
    setIsAdminAuthenticated(false);
    setCurrentView('aspirant');
  };

  // Admin: Save Question (create or update)
  const handleSaveQuestion = async (q: Partial<Question>) => {
    const isUpdate = !!q.id;
    const url = isUpdate ? `/api/questions/${q.id}` : '/api/questions';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar la pregunta');
    }

    await loadInitialData();
  };

  // Admin: Delete Question
  const handleDeleteQuestion = async (id: string) => {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
      return;
    }
    await loadInitialData();
  };

  // Admin: Reset Question Bank to 40 official questions
  const handleResetBank = async () => {
    const res = await fetch('/api/questions/reset-bank', { method: 'POST' });
    if (!res.ok) {
      alert('Error al restablecer el banco');
      return;
    }
    await loadInitialData();
  };

  // Admin: Delete Result
  const handleDeleteResult = async (id: string) => {
    const res = await fetch(`/api/results/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Error al eliminar resultado');
      return;
    }
    await loadInitialData();
  };

  // Admin: Resend Email
  const handleResendEmail = async (id: string) => {
    try {
      const res = await fetch(`/api/results/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Correo reenviado exitosamente.');
        await loadInitialData();
      } else {
        alert(`Fallo en el reenvío: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error de red: ${err.message}`);
    }
  };

  // Admin: Update Student Admission Decision (Admitido / En Espera / No Admitido)
  const handleUpdateAdmission = async (id: string, decision: AdmissionDecision) => {
    try {
      const res = await fetch(`/api/results/${id}/admission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionDecision: decision }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar el estado de admisión');
      }
      await loadInitialData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar la decisión de admisión: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Main Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'admin' && !isAdminAuthenticated) {
            // Protected by AdminLoginModal inside Navbar
            return;
          }
          setCurrentView(view);
        }}
        totalResultsCount={results.length}
        totalQuestionsCount={questions.length}
        examInProgress={aspirantStep === 'exam'}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setCurrentView('admin');
        }}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pb-16">
        {isLoading && !stats ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">
              Cargando Sistema de Examen Fase 2 ADSO desde la nube...
            </p>
          </div>
        ) : globalError ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h2 className="text-sm font-bold text-red-900">Error de conexión con la Nube</h2>
            <p className="text-xs text-red-700">{globalError}</p>
            <button
              type="button"
              onClick={loadInitialData}
              className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : currentView === 'aspirant' ? (
          /* Aspirant Flow Views */
          <div>
            {aspirantStep === 'register' && (
              <AspirantRegister onRegister={handleRegisterCandidate} />
            )}

            {aspirantStep === 'instructions' && candidate && (
              <div className="relative">
                {isLoadingExam && (
                  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold text-gray-800">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                      <span>Generando examen anti-copia (10 preguntas por componente)...</span>
                    </div>
                  </div>
                )}
                <ExamInstructions
                  candidate={candidate}
                  totalQuestions={40}
                  onStartExam={handleStartExam}
                  onBack={() => setAspirantStep('register')}
                />
              </div>
            )}

            {aspirantStep === 'exam' && candidate && (
              <ExamRunner
                candidate={candidate}
                questions={examQuestions.length > 0 ? examQuestions : questions}
                onSubmit={handleSubmitExam}
                isSubmitting={isSubmittingExam}
              />
            )}

            {aspirantStep === 'result' && activeResult && (
              <ExamResultView
                result={activeResult}
                onRestart={handleRestartAspirant}
                onGoToAdmin={() => {
                  if (isAdminAuthenticated) {
                    setCurrentView('admin');
                  } else {
                    alert('Para acceder al Panel de Administración debe autenticarse desde la barra superior con la contraseña especial.');
                  }
                }}
              />
            )}
          </div>
        ) : (
          /* Admin Dashboard (Protected by password) */
          <AdminDashboard
            results={results}
            questions={questions}
            stats={
              stats || {
                totalExams: results.length,
                averageScore: 0,
                passingRate: 0,
                tierCounts: { A: 0, B: 0, C: 0 },
                groupCounts: { A: 0, B: 0, C: 0 },
                categoryAverages: { logica: 0, matematicas: 0, comprension: 0, psicologico: 0 },
              }
            }
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onResetBank={handleResetBank}
            onDeleteResult={handleDeleteResult}
            onUpdateAdmission={handleUpdateAdmission}
            onResendEmail={handleResendEmail}
            onRefreshData={loadInitialData}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sistema Automatizado de Examen Fase 2 ADSO · Análisis y Desarrollo de Software
          </span>
          <span className="text-[11px] text-gray-400">
            40 Preguntas · Lógica, Matemáticas, Lectura y Psicología · Evaluación Grupos A, B, C · Límite 30 min
          </span>
        </div>
      </footer>
    </div>
  );
}
