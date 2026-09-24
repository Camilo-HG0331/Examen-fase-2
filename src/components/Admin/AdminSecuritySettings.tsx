import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ShieldAlert, UserCheck, BookOpen } from 'lucide-react';

interface AdminSecuritySettingsProps {
  onLogout: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword.trim() || !newPassword.trim()) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al cambiar la contraseña.');
      }

      setSuccessMessage('¡Contraseña de administrador actualizada con éxito en la nube!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Seguridad y Control de Acceso</h2>
            <p className="text-xs text-gray-500">
              Gestión de la contraseña especial de administrador y separación de privilegios entre Aspirantes y Docentes/Administradores.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Cambiar Contraseña Especial de Administrador</span>
          </h3>
          <p className="text-xs text-gray-500">
            Actualice la credencial maestra requerida para entrar al panel administrativo.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs sm:text-sm">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingrese contraseña actual (por defecto: ADSO2025*)"
                  className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              id="submit-change-password-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Actualizando en la nube...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Guardar Nueva Contraseña</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Roles Policy Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-700" />
              <span>Políticas de Separación de Roles</span>
            </h3>

            {/* Aspirante role */}
            <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Rol: Aspirante / Estudiante</span>
              </div>
              <ul className="text-[11px] text-blue-800 list-disc list-inside space-y-0.5">
                <li>Solo puede registrar sus datos y realizar la prueba una sola vez.</li>
                <li>Examen sujeto a <strong>tiempo estricto de 30 minutos</strong> con cierre automático.</li>
                <li>Visualiza banco de preguntas barajado aleatoriamente para evitar copias.</li>
                <li>Recibe informe certificado por correo al terminar.</li>
                <li><strong>No tiene acceso</strong> al panel de preguntas ni a resultados de otros aspirantes.</li>
              </ul>
            </div>

            {/* Admin role */}
            <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Rol: Administrador / Evaluador</span>
              </div>
              <ul className="text-[11px] text-emerald-800 list-disc list-inside space-y-0.5">
                <li>Requiere autenticación mediante la contraseña especial de seguridad.</li>
                <li>Capacidad de añadir, editar y eliminar preguntas (opción múltiple y libres).</li>
                <li>Carga masiva mediante archivos JSON y PDF con extracción inteligente.</li>
                <li>Consulta en tiempo real de aspirantes clasificados en Grupos A, B y C.</li>
                <li>Reenvío manual de correos y auditoría de respuestas.</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
            >
              Cerrar Sesión de Administrador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
