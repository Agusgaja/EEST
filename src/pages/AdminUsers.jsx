import { Edit, Eye, KeyRound, MoreVertical, Power, PowerOff, X } from "lucide-react";
import { useState } from "react";
import { mockUsers } from "../data/mockUsers.js";
import { useTickets } from "../context/TicketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

function UserDetailModal({ user, onClose }) {
  const { tickets } = useTickets();
  const userTickets = tickets.filter((t) => t.user.includes(user.nombre) || t.user.includes(user.apellido));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div 
        className="glass-card relative w-full max-w-lg overflow-hidden rounded-2xl bg-white/90 shadow-2xl dark:bg-slate-900/90"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200/50 p-5 dark:border-white/10">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Detalle de Usuario</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
              {user.nombre[0]}{user.apellido[0]}
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">{user.nombre} {user.apellido}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.rol} • {user.legajo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="font-medium text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{user.email}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500 dark:text-slate-400">Teléfono</p>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{user.telefono}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500 dark:text-slate-400">Sector</p>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{user.sector}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500 dark:text-slate-400">Estado</p>
              <p className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  user.estado === "Activo" 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                }`}>
                  {user.estado}
                </span>
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-500 dark:text-slate-400">Fecha de registro</p>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{user.fechaRegistro}</p>
            </div>
          </div>

          <div className="mt-8">
            <h5 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 border-b border-slate-200/50 pb-2 dark:border-white/10">Tickets creados por este usuario</h5>
            {userTickets.length > 0 ? (
              <ul className="space-y-2">
                {userTickets.map(t => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/5">
                    <span className="font-medium text-violet-600 dark:text-violet-400">{t.id}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 truncate w-1/2 text-right">{t.shortDescription}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic dark:text-slate-400">No hay tickets creados por este usuario.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Administración de Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestiona accesos, roles y perfiles de toda la plataforma.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-4 sm:mt-0">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 transition-colors">
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/50 bg-slate-50/50 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Usuario</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Contacto</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Sector</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Rol</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {mockUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        {user.nombre[0]}{user.apellido[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.legajo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-slate-100">{user.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.telefono}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.sector}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.estado === "Activo" 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        title="Editar usuario"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        title="Restablecer contraseña"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button 
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        title={user.estado === "Activo" ? "Desactivar" : "Activar"}
                      >
                        {user.estado === "Activo" ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
