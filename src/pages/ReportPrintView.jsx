import { useEffect } from "react";
import { useTickets } from "../context/TicketContext.jsx";
import { formatDate, diffMinutes } from "../utils/ticketUtils.js";

function formatDuration(minutes) {
  if (minutes == null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export default function ReportPrintView() {
  const { tickets } = useTickets();

  // Calcular métricas RF11
  const countTotal = tickets.length;
  const countResueltos = tickets.filter((t) => t.status === "resuelto-pendiente" || t.status === "cerrado").length;
  const countPendientes = tickets.filter((t) => t.status !== "resuelto-pendiente" && t.status !== "cerrado").length;

  const averageResolutionTime = (() => {
    const resolvedTickets = tickets.filter((t) => t.resolvedAt);
    if (resolvedTickets.length === 0) return null;

    const times = resolvedTickets
      .map((t) => diffMinutes(t.createdAt, t.resolvedAt))
      .filter((m) => m !== null && m >= 0);

    if (times.length === 0) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  })();

  useEffect(() => {
    // Damos un pequeño timeout para asegurar que React termine de renderizar
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto min-h-screen">
      <header className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reporte de Mantenimiento Informático</h1>
          <p className="text-slate-600 mt-1">Escuela Industrial - Sistema de Tickets</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">Fecha de emisión:</p>
          <p className="text-sm text-slate-600">{new Date().toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-300 pb-2">Métricas Generales (RF11)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-center">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Tickets Creados</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{countTotal}</p>
          </div>
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-center">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Resueltos</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{countResueltos}</p>
          </div>
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-center">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{countPendientes}</p>
          </div>
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-center">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">T. Promedio Resolución</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{formatDuration(averageResolutionTime)}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-300 pb-2">Detalle de Tickets</h2>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="py-2 px-3 font-semibold text-slate-700">ID</th>
              <th className="py-2 px-3 font-semibold text-slate-700">Fecha</th>
              <th className="py-2 px-3 font-semibold text-slate-700">Área</th>
              <th className="py-2 px-3 font-semibold text-slate-700">Motivo</th>
              <th className="py-2 px-3 font-semibold text-slate-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((t) => {
                const area = t.area ?? t.userSnapshot?.sector ?? t.sector ?? "—";
                
                // Formateo simple de estado para lectura
                let statusLabel = t.status;
                if (t.status === "resuelto-pendiente") statusLabel = "Resuelto";
                else if (t.status === "en-proceso") statusLabel = "En Proceso";
                else statusLabel = t.status.charAt(0).toUpperCase() + t.status.slice(1);

                return (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="py-2 px-3 font-medium text-slate-800">{t.id}</td>
                    <td className="py-2 px-3 text-slate-600">{formatDate(t.createdAt)}</td>
                    <td className="py-2 px-3 text-slate-600">{area}</td>
                    <td className="py-2 px-3 text-slate-600">{t.motivo}</td>
                    <td className="py-2 px-3 text-slate-800 font-medium">{statusLabel}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-slate-500 italic">No hay tickets registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      
      {/* Estilos específicos para impresión para ocultar la UI del navegador y asegurar un A4 limpio */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1.5cm; size: A4 portrait; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Ocultar scrollbars */
          ::-webkit-scrollbar { display: none; }
        }
      `}} />
    </div>
  );
}
