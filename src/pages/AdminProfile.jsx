import { Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function AdminProfile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState(user?.email || "admin@industria.com");
  const [telefono, setTelefono] = useState(user?.telefono || "+54 11 4000-0000");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Mi Perfil
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra tu información personal y opciones de seguridad.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="space-y-6">
        {/* Información Personal (Sólo lectura) */}
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
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                  Nombre completo
                </label>
                <div className="mt-1 flex w-full items-center rounded-lg border border-slate-200/50 bg-slate-100/50 px-3 py-2.5 text-sm text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-100">
                  {user?.nombre} {user?.apellido}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                  Legajo
                </label>
                <div className="mt-1 flex w-full items-center rounded-lg border border-slate-200/50 bg-slate-100/50 px-3 py-2.5 text-sm text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-100">
                  EMP-9001 (Admin)
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                  Sector
                </label>
                <div className="mt-1 flex w-full items-center rounded-lg border border-slate-200/50 bg-slate-100/50 px-3 py-2.5 text-sm text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-100">
                  Sistemas e Infraestructura
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Datos de Contacto (Editables) */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Mail size={18} className="text-violet-500" />
              Datos de Contacto
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Actualiza tus vías de comunicación activa.
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Correo electrónico
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono corporativo
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-500 transition-colors">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>

        {/* Seguridad (Contraseña) */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Lock size={18} className="text-violet-500" />
              Seguridad
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cambia tu contraseña de acceso al panel.
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
                Actualizar contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
