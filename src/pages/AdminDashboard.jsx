import { BarChart3, CheckCircle2, Clock, FileWarning, Users, PieChart as PieChartIcon, Printer } from "lucide-react";
import { useTickets } from "../context/TicketContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { diffMinutes } from "../utils/ticketUtils.js";

function formatDuration(minutes) {
  if (minutes == null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

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

  const countPendiente = tickets.filter((t) => t.status === "pendiente").length;
  const countAsignado = tickets.filter((t) => t.status === "asignado").length;
  const countEnProceso = tickets.filter((t) => t.status === "en-proceso").length;
  const countResueltoPend = tickets.filter((t) => t.status === "resuelto-pendiente").length;
  const countCerrado = tickets.filter((t) => t.status === "cerrado").length;

  // Bug #1 corregido: usar UserContext como fuente de verdad (no mockUsers estático)
  const activeUsersCount = users.filter((u) => u.estado === "Activo").length;

  // Datos para gráfico de rendimiento (Barras)
  const statusData = [
    { name: "Pendientes", tickets: countPendiente },
    { name: "Asignados", tickets: countAsignado },
    { name: "En Proceso", tickets: countEnProceso },
    { name: "Por Cerrar", tickets: countResueltoPend },
    { name: "Cerrados", tickets: countCerrado },
  ];

  // Datos para gráfico por área (Torta)
  const areaCounts = tickets.reduce((acc, ticket) => {
    // Intentar sacar el area considerando datos legacy
    const area = ticket.area ?? ticket.userSnapshot?.sector ?? ticket.sector ?? "Otro";
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});
  
  const areaData = Object.entries(areaCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Usa createdAt (ISO 8601) y resolvedAt para calcular el tiempo real de resolución.
  const averageResolutionTime = (() => {
    const resolvedTickets = tickets.filter((t) => t.resolvedAt);
    if (resolvedTickets.length === 0) return null;

    const times = resolvedTickets
      .map((t) => diffMinutes(t.createdAt, t.resolvedAt))
      .filter((m) => m !== null && m >= 0);

    if (times.length === 0) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  })();

  const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4"];

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
    borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
    color: theme === "dark" ? "#f8fafc" : "#0f172a",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  };

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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.open("/admin/report", "_blank")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-500 active:scale-[0.97]"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Generar Reporte</span>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        <MetricCard
          title="Pendientes"
          value={countPendiente}
          icon={FileWarning}
          colorClass="bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400"
        />
        <MetricCard
          title="Asignados"
          value={countAsignado}
          icon={Clock}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <MetricCard
          title="En Proceso"
          value={countEnProceso}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <MetricCard
          title="Por Cerrar"
          value={countResueltoPend}
          icon={CheckCircle2}
          colorClass="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
        />
        <MetricCard
          title="Rend. Resolución"
          value={formatDuration(averageResolutionTime)}
          icon={Clock}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <MetricCard
          title="Usuarios"
          value={activeUsersCount}
          icon={Users}
          colorClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Tickets por Estado
            </h3>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 items-center justify-center pt-6">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: theme === "dark" ? "#334155" : "#f1f5f9" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="tickets" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 italic">No hay tickets registrados.</div>
            )}
          </div>
        </div>

        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Tickets por Área
            </h3>
            <PieChartIcon className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 items-center justify-center pt-6">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {areaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 italic">No hay tickets registrados.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
