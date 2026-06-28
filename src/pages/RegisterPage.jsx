import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-sky-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500/50";

export default function RegisterPage() {
  // RegisterPage usa UserContext (fuente de verdad) + AuthContext (para auto-login)
  const { addUser } = useUsers();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();


  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpia el error del campo al empezar a corregirlo
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) errs.apellido = "El apellido es obligatorio.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) errs.email = "El email es obligatorio.";
    else if (!emailRegex.test(form.email)) errs.email = "Ingresá un email válido.";

    const phoneRegex = /^[\+\d\s\-]{8,}$/;
    if (!form.telefono.trim()) errs.telefono = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(form.telefono)) errs.telefono = "Mín. 8 caracteres.";

    if (!form.password) errs.password = "La contraseña es obligatoria.";
    else if (form.password.length < 8) errs.password = "Mínimo 8 caracteres.";

    if (!form.confirmPassword) errs.confirmPassword = "Confirmá la contraseña.";
    else if (form.password && form.password !== form.confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden.";

    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      // 1. Crear usuario en UserContext (fuente de verdad)
      // El rol siempre es "usuario" — nunca "admin" desde el registro público
      addUser({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
        rol: "Usuario",
        role: "usuario",
      });

      // 2. Auto-login con las credenciales recién creadas
      const result = login(form.email.trim(), form.password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        // Fallback improbable: si el login falla, redirigir al login manual
        navigate("/login");
      }
    } catch (err) {
      // El addUser lanza errores con mensajes específicos (legajo/email/teléfono duplicado)
      // Intentamos identificar cuál campo causó el error
      const msg = err.message || "Ocurrió un error al crear la cuenta.";
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
      else if (msg.toLowerCase().includes("teléfono")) setErrors({ telefono: msg });
      else setErrors({ _form: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg relative flex min-h-screen items-center justify-center p-4 transition-colors">
        <div className="relative w-full max-w-lg animate-fade-in">
          <div className="absolute right-0 top-0 -translate-y-16">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-600 text-white shadow-lg shadow-red-600/20">
              <ClipboardList size={26} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registrate para crear solicitudes de mantenimiento
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6" noValidate>

            {errors._form && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {errors._form}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  className={inputClass}
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Ej: Juan"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
              </div>

              {/* Apellido */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Apellido
                </label>
                <input
                  className={inputClass}
                  value={form.apellido}
                  onChange={(e) => setField("apellido", e.target.value)}
                  placeholder="Ej: García"
                />
                {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="nombre@industria.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <input
                  className={inputClass}
                  value={form.telefono}
                  onChange={(e) => setField("telefono", e.target.value)}
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <input
                  className={inputClass}
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar contraseña
                </label>
                <input
                  className={inputClass}
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-sky-600 underline-offset-2 transition-colors hover:underline dark:text-sky-400"
              >
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
