import { Edit, Eye, KeyRound, Power, PowerOff, X, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useTickets } from "../context/TicketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UserFormModal from "../components/UserFormModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import PasswordModal from "../components/PasswordModal.jsx";
import { getShortDescription } from "../utils/ticketUtils.js";

function UserDetailModal({ user, onClose }) {
  const { tickets } = useTickets();
  // Filtro por userId (referencia segura al nuevo schema de tickets)
  const userTickets = tickets.filter((t) => t.userId === user.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-overlay">
      <div 
        className="glass-card animate-slide-up relative w-full max-w-lg overflow-hidden rounded-2xl bg-white/95 shadow-2xl dark:bg-slate-900/95"
        role="dialog"
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
              <ul className="max-h-32 overflow-y-auto space-y-2 pr-2">
                {userTickets.map(t => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/5">
                    <span className="font-medium text-violet-600 dark:text-violet-400">{t.id}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 truncate w-1/2 text-right">{getShortDescription(t.fullDescription)}</span>
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
  const { users, toggleUserStatus, resetUserPassword } = useUsers();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [selectedUser, setSelectedUser] = useState(null); // Para DetailModal
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordUserName, setPasswordUserName] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, ' ').trim() : "";
      const searchNormalized = normalizeStr(searchQuery);

      const fullName = normalizeStr(`${u.nombre} ${u.apellido}`);
      
      const matchSearch = 
        !searchNormalized ||
        fullName.includes(searchNormalized) ||
        normalizeStr(u.email).includes(searchNormalized) ||
        normalizeStr(u.legajo).includes(searchNormalized);
      
      const matchRole = roleFilter === "Todos" ? true : u.rol === roleFilter;
      const matchStatus = statusFilter === "Todos" ? true : u.estado === statusFilter;

      return Boolean(matchSearch && matchRole && matchStatus);
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("Todos");
    setStatusFilter("Todos");
  };

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "Todos" || statusFilter !== "Todos";

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    setConfirmConfig({
      title: user.estado === "Activo" ? "Desactivar Usuario" : "Activar Usuario",
      message: `¿Estás seguro que deseas ${user.estado === "Activo" ? "desactivar" : "activar"} la cuenta de ${user.nombre} ${user.apellido}?`,
      confirmText: user.estado === "Activo" ? "Desactivar" : "Activar",
      isDanger: user.estado === "Activo",
      onConfirm: () => {
        try {
          toggleUserStatus(user.id);
          showToast(`Usuario ${user.estado === "Activo" ? "desactivado" : "activado"} correctamente`);
        } catch (error) {
          showToast(error.message, "error");
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleResetPassword = (user) => {
    setConfirmConfig({
      title: "Restablecer Contraseña",
      message: `¿Estás seguro que deseas restablecer la contraseña de ${user.nombre} ${user.apellido}? Se generará una nueva contraseña temporal.`,
      confirmText: "Restablecer",
      isDanger: false,
      onConfirm: () => {
        const newPass = resetUserPassword(user.id);
        setGeneratedPassword(newPass);
        setPasswordUserName(`${user.nombre} ${user.apellido}`);
        setIsPasswordModalOpen(true);
      }
    });
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Administración de Usuarios
          </h1>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            Gestiona accesos, roles y perfiles de toda la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button 
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 transition-colors"
          >
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, legajo o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          />
        </div>
        <div className="flex w-full gap-4 sm:w-auto">
          <div className="relative w-full sm:w-40">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter size={16} className="text-slate-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-8 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <option value="Todos">Roles: Todos</option>
              <option value="Admin">Admin</option>
              <option value="Técnico">Técnico</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>
          <div className="relative w-full sm:w-40">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter size={16} className="text-slate-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-8 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              hasActiveFilters 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20" 
                : "bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-slate-500"
            }`}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mb-4 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
                          <Search size={24} className="text-slate-400" />
                        </div>
                      </div>
                      <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                        No se encontraron usuarios
                      </h3>
                      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        No existe ningún usuario que coincida con los filtros aplicados en este momento.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                        user.rol === 'Admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' :
                        user.rol === 'Técnico' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                        'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}>
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
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                          title="Editar usuario"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                          title="Restablecer contraseña"
                        >
                          <KeyRound size={18} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            user.estado === "Activo"
                              ? "text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              : "text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                          }`}
                          title={user.estado === "Activo" ? "Desactivar" : "Activar"}
                        >
                          {user.estado === "Activo" ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
      
      <UserFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        userToEdit={userToEdit}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        {...confirmConfig}
      />
      
      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        password={generatedPassword}
        userName={passwordUserName}
      />
    </div>
  );
}
