import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
  { to: "/admin/users", label: "Usuarios", icon: Users },
  { to: "/admin/settings", label: "Configuración", icon: Settings },
  { to: "/admin/profile", label: "Mi perfil", icon: UserCircle },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg flex h-screen w-screen overflow-hidden transition-colors">
        
        {/* Sidebar */}
        <aside
          className={`relative z-40 flex shrink-0 flex-col border-r border-slate-200/50 bg-white/40 transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl ${
            isCollapsed ? "w-[76px]" : "w-64"
          } backdrop-blur-md overflow-hidden`}
        >
          {/* Logo area */}
          <div 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex h-[77px] w-full cursor-pointer items-center border-b border-slate-200/50 px-4 transition-colors hover:bg-slate-50/50 dark:border-white/10 dark:hover:bg-white/5`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <ClipboardList size={22} aria-hidden="true" />
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3'}`}>
              <p className="whitespace-nowrap text-[15px] font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Mantenimiento
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-100/50 text-violet-700 dark:border dark:border-violet-500/20 dark:bg-violet-600/20 dark:text-violet-300"
                      : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                  }`
                }
              >
                <item.icon size={18} aria-hidden="true" className="shrink-0" />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3'}`}>
                  <span className="truncate">{item.label}</span>
                </div>
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 invisible rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User area */}
          <div className="border-t border-slate-200/50 p-3 dark:border-white/10">
              <div className={`flex items-center px-3 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-9 opacity-100 mb-3'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-semibold text-white shadow-md shadow-violet-500/20">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    Admin
                  </p>
                </div>
              </div>
            <button
              onClick={handleLogout}
              className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50/80 hover:text-red-700 active:scale-[0.97] dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300`}
            >
              <LogOut size={18} aria-hidden="true" className="shrink-0" />
              <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3'}`}>
                <span className="whitespace-nowrap">Cerrar sesión</span>
              </div>
              {isCollapsed && (
                  <div className="absolute left-full ml-4 invisible rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900 z-50 whitespace-nowrap">
                    Cerrar sesión
                  </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main content wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto h-full w-full">
            <Outlet />
          </main>
        </div>
        
      </div>
    </div>
  );
}
