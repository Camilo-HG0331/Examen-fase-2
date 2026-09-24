import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { AdminLoginModal } from './Admin/AdminLoginModal';
import { SenaLogo } from './SenaLogo';

interface NavbarProps {
  currentView: 'aspirant' | 'admin';
  onViewChange: (view: 'aspirant' | 'admin') => void;
  totalResultsCount: number;
  totalQuestionsCount: number;
  examInProgress?: boolean;
  isAdminAuthenticated: boolean;
  onAdminLoginSuccess: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  totalResultsCount,
  totalQuestionsCount,
  examInProgress = false,
  isAdminAuthenticated,
  onAdminLoginSuccess,
  onAdminLogout,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAdminClick = () => {
    if (examInProgress) {
      if (!confirm('Tiene un examen en progreso. ¿Desea pausar e intentar acceder al Panel de Administración?')) {
        return;
      }
    }

    if (isAdminAuthenticated) {
      onViewChange('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleStudentClick = () => {
    onViewChange('aspirant');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand and SENA ADSO badge */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center p-1.5 shadow-xs shrink-0 overflow-hidden">
                <SenaLogo className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                    Fase 2 ADSO
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                    SENA
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                    Grupos A · B · C
                  </span>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">
                  40 preguntas (10 por componente) · Lógica, Matemáticas, Lectura, Psicología · Cierre en 30 min
                </p>
              </div>
            </div>

            {/* Navigation View Switcher with Role Separation */}
            <div className="flex items-center space-x-2">
              <button
                id="nav-aspirante-btn"
                type="button"
                onClick={handleStudentClick}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  currentView === 'aspirant'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Modo Aspirante</span>
              </button>

              <button
                id="nav-admin-btn"
                type="button"
                onClick={handleAdminClick}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-600" />
                )}
                <span>Administración</span>
                {!isAdminAuthenticated && (
                  <span className="hidden sm:inline-block text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                    Clave
                  </span>
                )}
              </button>

              {isAdminAuthenticated && (
                <button
                  id="nav-admin-logout-btn"
                  type="button"
                  onClick={onAdminLogout}
                  title="Cerrar sesión de Administrador"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Login Modal with Special Password */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          onAdminLoginSuccess();
          onViewChange('admin');
        }}
      />
    </>
  );
};
