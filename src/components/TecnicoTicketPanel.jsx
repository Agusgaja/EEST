import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Send,
  Tag,
  UserRound,
  Wrench,
  X,
  PlayCircle
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import DetailField from "./DetailField.jsx";
import HistoryTimeline from "./HistoryTimeline.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";
import { formatDate, getShortDescription, getStatus } from "../utils/ticketUtils.js";

export default function TecnicoTicketPanel({ ticket, onClose }) {
  const { user } = useAuth();
  const { changeStatus, addObservation } = useTickets();
  const [observation, setObservation] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const currentStatus = getStatus(TICKET_STATUSES, ticket.status);
  const isClosed = ticket.status === "cerrado";
  
  const displayName   = ticket.userSnapshot?.name   ?? ticket.user   ?? "—";
  const displaySector = ticket.userSnapshot?.sector ?? ticket.sector  ?? "—";
  const displayLegajo = ticket.userSnapshot?.legajo ?? "—";

  function handleAction(newStatus) {
    const actorName = `${user.nombre} ${user.apellido}`;
    changeStatus(ticket.id, newStatus, actorName, user.id);
  }

  function handleObservationSubmit(event) {
    event.preventDefault();
    const trimmed = observation.trim();
    if (!trimmed) return;
    const actorName = `${user.nombre} ${user.apellido}`;
    addObservation(ticket.id, trimmed, actorName, user.id);
    setObservation("");
  }

  function handleClose() {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  }

  return (
    <aside
      className={`fixed inset-0 z-30 flex justify-end bg-black/40 px-0 backdrop-blur-sm sm:px-4 ${
        isClosing ? "animate-fade-out-overlay" : "animate-fade-overlay"
      }`}
    >
      <div
        className={`glass-panel flex h-full w-full max-w-2xl flex-col overflow-hidden sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-xl ${
          isClosing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-5 dark:border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {ticket.id}
              </p>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {getShortDescription(ticket.fullDescription)}
            </p>
          </div>
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            onClick={handleClose}
            title="Cerrar detalle"
            type="button"
          >
            <X size={19} aria-hidden="true" />
            <span className="sr-only">Cerrar detalle</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Info del ticket */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Información del ticket
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <IconField icon={UserRound} label="Usuario" value={displayName} />
              <IconField icon={Building2} label="Sector" value={displaySector} />
              <IconField icon={Tag} label="Legajo" value={displayLegajo} />
              <IconField icon={CalendarDays} label="Fecha" value={formatDate(ticket.createdAt)} />
              <IconField icon={Wrench} label="Categoría" value={ticket.category} />
              <IconField icon={CheckCircle2} label="Subcategoría" value={ticket.subcategory} />
              {ticket.deviceTag && (
                <IconField icon={Tag} label="Etiqueta del equipo" value={ticket.deviceTag} />
              )}
            </dl>
            <DetailField label="Descripción completa" value={ticket.fullDescription} />
          </section>

          {/* Acciones */}
          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Acciones</h3>
            <div className="glass-card grid gap-4 rounded-xl p-4">
              
              {ticket.status === "asignado" && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Iniciá el trabajo para cambiar el estado del ticket y notificar al usuario.
                  </p>
                  <button
                    onClick={() => handleAction("en-proceso")}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-500 active:scale-[0.97]"
                  >
                    <PlayCircle size={17} aria-hidden="true" />
                    Iniciar trabajo
                  </button>
                </div>
              )}

              {ticket.status === "en-proceso" && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Marcá el trabajo como resuelto para solicitar la conformidad del usuario.
                  </p>
                  <button
                    onClick={() => handleAction("resuelto-pendiente")}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-500 active:scale-[0.97]"
                  >
                    <CheckCircle2 size={17} aria-hidden="true" />
                    Marcar como resuelto
                  </button>
                </div>
              )}

              {ticket.status === "resuelto-pendiente" && (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-400">
                  Esperando conformidad del usuario para cerrar el ticket de forma definitiva.
                </div>
              )}

              <form className="grid gap-3 pt-2" onSubmit={handleObservationSubmit}>
                <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Observaciones internas
                  <textarea
                    className="min-h-28 resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-teal-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={isClosed ? "El ticket está cerrado. No se pueden agregar observaciones." : "Agregar una observación sobre el trabajo realizado..."}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    disabled={isClosed}
                  />
                </label>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10 dark:hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                  disabled={isClosed}
                >
                  <Send size={17} aria-hidden="true" />
                  Agregar observación
                </button>
              </form>
            </div>
          </section>

          {/* Observaciones registradas */}
          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Observaciones registradas
            </h3>
            {ticket.observations.length > 0 ? (
              <div className="grid gap-3">
                {ticket.observations.map((item) => (
                  <article className="glass-card rounded-xl p-4" key={item.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.author}
                      </p>
                      <time className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt ?? item.date)}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300/60 bg-slate-50/50 p-4 text-sm text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400">
                Sin observaciones registradas.
              </p>
            )}
          </section>

          {/* Historial */}
          <section className="mt-8 space-y-4 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Historial</h3>
            <HistoryTimeline history={ticket.history} />
          </section>
        </div>
      </div>
    </aside>
  );
}

function IconField({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
        <Icon size={17} aria-hidden="true" />
      </div>
      <DetailField label={label} value={value} />
    </div>
  );
}
