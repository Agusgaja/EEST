import { BarChart3, CheckCircle2, Clock, FileWarning, Users } from "lucide-react";
import { useTickets } from "../context/TicketContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

function MetricCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="glass-card flex flex-col justify-between rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const { theme, toggleTheme } = useTheme();

  // Bug #2 corregido: el ID del estado "en proceso" es "en-proceso" (guión), no "en_proceso"
  const openCount    = tickets.filter((t) => t.status === "abierto").length;
  const processCount = tickets.filter((t) => t.status === "en-proceso").length;
  const resolvedCount = tickets.filter((t) => t.status === "resuelto").length;

  // Bug #1 corregido: usar UserContext como fuente de verdad (no mockUsers estático)
  const activeUsersCount = users.filter((u) => u.estado === "Activo").length;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard General
          </h1>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            Resumen operativo y métricas principales del sistema.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Abiertos"
          value={openCount}
          icon={FileWarning}
          colorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        />
        <MetricCard
          title="En Proceso"
          value={processCount}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <MetricCard
          title="Resueltos"
          value={resolvedCount}
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <MetricCard
          title="Usuarios activos"
          value={activeUsersCount}
          icon={Users}
          colorClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Rendimiento de Resolución
            </h3>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
                <BarChart3 size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Gráfico de rendimiento próximamente
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Tickets por Sector
            </h3>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
                <BarChart3 size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Distribución por sector próximamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
