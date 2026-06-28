import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function LoginPage() {
  const { login, completeTempLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isForcingPasswordChange, setIsForcingPasswordChange] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const result = login(identifier, password);
    if (!result.success) {
      setError(result.error);
      return;
    }
    
    if (result.requirePasswordChange) {
      setTempUserId(result.tempUserId);
      setIsForcingPasswordChange(true);
      return;
    }

    if (result.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }

  function handlePasswordChangeSubmit(event) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const safeUser = completeTempLogin(tempUserId, newPassword);
    if (!safeUser) {
      setError("Ocurrió un error al actualizar la contraseña.");
      return;
    }

    if (safeUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg relative flex min-h-screen items-center justify-center p-4 transition-colors">

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="absolute right-0 top-0 -translate-y-16">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
              <ClipboardList size={26} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Panel de mantenimiento
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Inicie sesion para continuar
            </p>
          </div>

          {isForcingPasswordChange ? (
            <form onSubmit={handlePasswordChangeSubmit} className="glass-card rounded-xl p-6">
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                Debes actualizar tu contraseña temporal antes de continuar.
              </div>
              
              {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nueva contraseña
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
              >
                Actualizar contraseña
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-xl p-6"
            >
              {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                    placeholder="admin@industria.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
              >
                Iniciar sesion
              </button>

              <div className="mt-4 flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center">
                <Link
                  to="/register"
                  className="font-medium text-slate-600 underline-offset-2 transition-colors hover:text-violet-600 hover:underline dark:text-slate-400 dark:hover:text-violet-400"
                >
                  Registrarse
                </Link>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Admin: admin@industria.com / admin123 &middot; Usuario: c.medina@industria.com / usuario123
          </p>
        </div>
      </div>
    </div>
  );
}
