import { Lock, Mail, Phone, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const inputClass =
  "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500";
const readonlyClass =
  "flex w-full items-center rounded-lg border border-slate-200/50 bg-slate-100/50 px-3 py-2.5 text-sm text-slate-700 dark:border-white/5 dark:bg-white/5 dark:text-slate-300";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
const readonlyLabelClass = "block text-sm font-medium text-slate-500 dark:text-slate-400";
const errorClass = "mt-1 text-xs font-medium text-red-500 dark:text-red-400";

export default function AdminProfile() {
  const { user, updateSession } = useAuth();
  const { users, updateUserProfile } = useUsers();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // ── Datos de contacto ──────────────────────────────────────────────
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");
  const [contactErrors, setContactErrors] = useState({});

  // ── Seguridad (contraseña) ─────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});

  // ── Handler: guardar datos de contacto ────────────────────────────
  function handleSaveContact(e) {
    e.preventDefault();
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errs.email = "El email es obligatorio.";
    else if (!emailRegex.test(email)) errs.email = "Ingresá un email válido.";

    const phoneRegex = /^[\+\d\s\-]{8,}$/;
    if (!telefono.trim()) errs.telefono = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(telefono)) errs.telefono = "Mín. 8 caracteres.";

    setContactErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      updateUserProfile(user.id, { email, telefono });
      updateSession({ email, telefono });
      showToast("Datos de contacto actualizados correctamente.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // ── Handler: cambiar contraseña ───────────────────────────────────
  function handleSavePassword(e) {
    e.preventDefault();
    const errs = {};

    const userRecord = users.find((u) => u.id === user.id);
    if (!currentPassword) {
      errs.currentPassword = "Ingresá tu contraseña actual.";
    } else if (userRecord?.password !== currentPassword) {
      errs.currentPassword = "La contraseña actual es incorrecta.";
    }

    if (!newPassword) errs.newPassword = "Ingresá una nueva contraseña.";
    else if (newPassword.length < 8) errs.newPassword = "Mínimo 8 caracteres.";

    if (!confirmPassword) errs.confirmPassword = "Confirmá la nueva contraseña.";
    else if (newPassword && newPassword !== confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden.";

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      updateUserProfile(user.id, { email: user.email, telefono: user.telefono, password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Contraseña actualizada correctamente.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Mi Perfil
          </h1>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            Administrá tu información personal y opciones de seguridad.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="space-y-6">

        {/* ── Información corporativa (solo lectura) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <UserIcon size={18} className="text-violet-500" />
              Información Corporativa
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Datos registrados por Recursos Humanos. No pueden ser modificados.
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className={readonlyLabelClass}>Nombre completo</label>
                <div className={`mt-1 ${readonlyClass}`}>
                  {user?.nombre} {user?.apellido}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Datos de contacto (editable) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Mail size={18} className="text-violet-500" />
              Datos de Contacto
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Actualizá tus vías de comunicación activa.
            </p>
          </div>
          <form onSubmit={handleSaveContact} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="admin-email" className={labelClass}>
                  Correo electrónico
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="admin-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
                {contactErrors.email && <p className={errorClass}>{contactErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="admin-phone" className={labelClass}>
                  Teléfono corporativo
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="admin-phone"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                    placeholder="+54 11 4000-0000"
                  />
                </div>
                {contactErrors.telefono && <p className={errorClass}>{contactErrors.telefono}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-violet-500"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        {/* ── Seguridad (contraseña) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Lock size={18} className="text-violet-500" />
              Seguridad
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cambiá tu contraseña de acceso al panel.
            </p>
          </div>
          <form onSubmit={handleSavePassword} className="px-6 py-5">
            <div className="max-w-md space-y-4">
              <div>
                <label className={labelClass}>Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`mt-1 ${inputClass}`}
                />
                {passwordErrors.currentPassword && <p className={errorClass}>{passwordErrors.currentPassword}</p>}
              </div>
              <div>
                <label className={labelClass}>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={`mt-1 ${inputClass}`}
                />
                {passwordErrors.newPassword && <p className={errorClass}>{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`mt-1 ${inputClass}`}
                />
                {passwordErrors.confirmPassword && <p className={errorClass}>{passwordErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>

        {/* ── Rol en el sistema ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Shield size={18} className="text-violet-500" />
              Rol en el Sistema
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                {user?.rol || "Admin"}
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tenés acceso completo al panel de administración.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
