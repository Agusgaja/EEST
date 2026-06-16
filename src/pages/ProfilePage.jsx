import { Lock, Mail, Phone, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50";
const readonlyClass =
  "w-full rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-400";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";
const readonlyLabelClass = "mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400";
const sectionHeaderClass =
  "border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5";
const errorClass =
  "mt-1 text-xs font-medium text-red-500 dark:text-red-400";

export default function ProfilePage() {
  const { user, updateSession } = useAuth();
  const { users, updateUserProfile } = useUsers();
  const { showToast } = useToast();

  // ── Datos de contacto ──────────────────────────────────────────────
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");
  const [contactErrors, setContactErrors] = useState({});
  const [savingContact, setSavingContact] = useState(false);

  // ── Seguridad (contraseña) ─────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Handler: guardar datos de contacto ────────────────────────────
  function handleSaveContact(e) {
    e.preventDefault();
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errs.email = "El email es obligatorio.";
    else if (!emailRegex.test(email)) errs.email = "Ingresá un email válido.";

    const phoneRegex = /^[\+\d\s\-]{8,}$/;
    if (!telefono.trim()) errs.telefono = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(telefono)) errs.telefono = "Ingresá un teléfono válido (mín. 8 caracteres).";

    setContactErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // 1. Actualiza en la lista persistida de UserContext
      updateUserProfile(user.id, { email, telefono });
      // 2. Actualiza reactivamente el objeto de sesión de AuthContext
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

    // Verificamos la contraseña actual contra el registro en UserContext
    const userRecord = users.find((u) => u.id === user.id);
    if (!currentPassword) {
      errs.currentPassword = "Ingresá tu contraseña actual.";
    } else if (userRecord?.password !== currentPassword) {
      errs.currentPassword = "La contraseña actual es incorrecta.";
    }

    if (!newPassword) errs.newPassword = "Ingresá una nueva contraseña.";
    else if (newPassword.length < 8) errs.newPassword = "La contraseña debe tener al menos 8 caracteres.";

    if (!confirmPassword) errs.confirmPassword = "Confirmá la nueva contraseña.";
    else if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden.";

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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="min-w-0 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consultá y editá tu información personal.
        </p>
      </div>

      <div className="space-y-6">

        {/* ── Información corporativa (solo lectura) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className={sectionHeaderClass}>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <UserIcon size={18} className="text-violet-500" />
              Información Corporativa
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Datos registrados por Recursos Humanos. No pueden ser modificados.
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className={readonlyLabelClass}>Nombre</p>
                <div className={readonlyClass}>{user?.nombre}</div>
              </div>
              <div>
                <p className={readonlyLabelClass}>Apellido</p>
                <div className={readonlyClass}>{user?.apellido}</div>
              </div>
              <div>
                <p className={readonlyLabelClass}>Legajo</p>
                <div className={readonlyClass}>{user?.legajo}</div>
              </div>
              <div>
                <p className={readonlyLabelClass}>Sector</p>
                <div className={readonlyClass}>{user?.sector}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Datos de contacto (editable) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className={sectionHeaderClass}>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Mail size={18} className="text-violet-500" />
              Datos de Contacto
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Actualizá tus vías de comunicación activa.
            </p>
          </div>
          <form onSubmit={handleSaveContact} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {contactErrors.email && <p className={errorClass}>{contactErrors.email}</p>}
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="text"
                  className={inputClass}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                />
                {contactErrors.telefono && <p className={errorClass}>{contactErrors.telefono}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingContact}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        {/* ── Seguridad (contraseña) ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className={sectionHeaderClass}>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Lock size={18} className="text-violet-500" />
              Seguridad
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cambiá tu contraseña de acceso.
            </p>
          </div>
          <form onSubmit={handleSavePassword} className="px-6 py-5">
            <div className="max-w-md space-y-4">
              <div>
                <label className={labelClass}>Contraseña actual</label>
                <input
                  type="password"
                  className={inputClass}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {passwordErrors.currentPassword && <p className={errorClass}>{passwordErrors.currentPassword}</p>}
              </div>
              <div>
                <label className={labelClass}>Nueva contraseña</label>
                <input
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                {passwordErrors.newPassword && <p className={errorClass}>{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {passwordErrors.confirmPassword && <p className={errorClass}>{passwordErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>

        {/* ── Rol del sistema ── */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className={sectionHeaderClass}>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Shield size={18} className="text-violet-500" />
              Rol en el Sistema
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300">
                {user?.rol || "Usuario"}
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Los cambios de rol deben ser gestionados por un administrador.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
