import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Send,
  Paperclip,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DetailField from "./DetailField.jsx";
import HistoryTimeline from "./HistoryTimeline.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate, getShortDescription, getStatus } from "../utils/ticketUtils.js";
import { useUsers } from "../context/UserContext.jsx";

export default function TicketDetailPanel({
  ticket,
  statuses,
  onClose,
  onUpdateStatus,
  onAddObservation,
  onAssignTicket,
}) {
  const { users } = useUsers();
  const tecnicos = useMemo(() => users.filter((u) => u.role === "tecnico"), [users]);
  
  const [draftStatus, setDraftStatus] = useState(ticket.status);
  const [selectedTechId, setSelectedTechId] = useState(ticket.assignedTo?.id || "");
  const [observation, setObservation] = useState("");
  const [commentAttachments, setCommentAttachments] = useState([]);

  function handleFileChange(e) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setCommentAttachments(prev => [...prev, ...newFiles]);
  }
  const [isClosing, setIsClosing] = useState(false);
  const currentStatus = getStatus(statuses, ticket.status);
  const statusChanged = draftStatus !== ticket.status;
  const selectedStatus = useMemo(() => getStatus(statuses, draftStatus), [draftStatus, statuses]);

  // Compatibilidad: el ticket puede tener userSnapshot (nuevo schema) o user/sector (legacy)
  const displayName   = ticket.userSnapshot?.name   ?? ticket.user   ?? "—";
  const displaySector = ticket.userSnapshot?.sector ?? ticket.sector  ?? "—";
  const displayLegajo = ticket.userSnapshot?.legajo ?? "—";

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (!statusChanged) return;
    // El actor real se pasa desde AdminTickets — aquí solo notificamos el nuevo estado.
    onUpdateStatus(ticket.id, draftStatus);
  }

  function handleObservationSubmit(event) {
    event.preventDefault();
    const trimmed = observation.trim();
    if (!trimmed && commentAttachments.length === 0) return;
    onAddObservation(ticket.id, trimmed, commentAttachments);
    setObservation("");
    setCommentAttachments([]);
  }

  function handleAssign(event) {
    event.preventDefault();
    if (!selectedTechId) return;
    if (selectedTechId === ticket.assignedTo?.id) return;
    const tech = tecnicos.find(t => t.id === selectedTechId);
    if (!tech) return;
    onAssignTicket(ticket.id, tech.id, `${tech.nombre} ${tech.apellido}`);
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
                {ticket.title ?? ticket.id}
              </p>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">{ticket.id}</p>
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
              <IconField icon={Building2} label="Área" value={ticket.area ?? displaySector} />
              <IconField icon={CalendarDays} label="Fecha" value={formatDate(ticket.createdAt)} />
              <IconField icon={Wrench} label="Motivo" value={ticket.motivo} />
            </dl>
            <DetailField label="Descripción completa" value={ticket.fullDescription} />
            {ticket.attachments?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Archivos adjuntos</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((file, idx) => (
                    <span key={idx} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      <Paperclip size={14} /> {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Gestión */}
          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Gestión</h3>
            
            {/* Asignación */}
            {["pendiente", "asignado", "en-proceso"].includes(ticket.status) && (
              <form className="glass-card grid gap-3 rounded-xl p-4" onSubmit={handleAssign}>
                <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Técnico asignado
                  <select
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 transition-colors focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500/50"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                  >
                    <option value="" className="dark:bg-slate-900 dark:text-slate-100">Sin asignar</option>
                    {tecnicos.map((t) => (
                      <option className="dark:bg-slate-900 dark:text-slate-100" key={t.id} value={t.id}>
                        {t.nombre} {t.apellido} ({t.legajo})
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/20"
                  disabled={selectedTechId === (ticket.assignedTo?.id || "")}
                  type="submit"
                >
                  <UserRound size={17} aria-hidden="true" />
                  Asignar técnico
                </button>
              </form>
            )}

            {/* Cambio de Estado */}
            <form className="glass-card grid gap-3 rounded-xl p-4" onSubmit={handleStatusSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Estado
                <select
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 transition-colors focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500/50"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                >
                  {statuses.map((s) => (
                    <option className="dark:bg-slate-900 dark:text-slate-100" key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!statusChanged}
                type="submit"
              >
                <CheckCircle2 size={17} aria-hidden="true" />
                Actualizar estado
              </button>
            </form>

            <form className="grid gap-3" onSubmit={handleObservationSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Agregar Comentario
                <textarea
                  className="min-h-28 resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  placeholder="Agregar un comentario..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </label>
              
              {commentAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commentAttachments.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 rounded bg-violet-100 px-2 py-1 text-xs text-violet-800 dark:bg-violet-500/20 dark:text-violet-300">
                      <Paperclip size={12} /> {f.name}
                      <button type="button" onClick={() => setCommentAttachments(p => p.filter((_, idx) => idx !== i))} className="ml-1 text-violet-500 hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/10">
                  <Paperclip size={16} />
                  <span>Adjuntar</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
                  type="submit"
                >
                  <Send size={17} aria-hidden="true" />
                  Comentar
                </button>
              </div>
            </form>
          </section>

          {/* Comentarios */}
          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Comentarios
            </h3>
            {ticket.observations.length > 0 ? (
              <div className="grid gap-3">
                {ticket.observations.map((item) => {
                  const isTech = item.authorRole === "tecnico" || item.authorRole === "admin";
                  return (
                  <article className={`glass-card rounded-xl p-4 ${isTech ? "border-violet-200 bg-violet-50/50 dark:border-violet-500/30 dark:bg-violet-500/10" : ""}`} key={item.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {item.author}
                        </p>
                        {isTech && <span className="rounded bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-500/30 dark:text-violet-200">STAFF</span>}
                      </div>
                      <time className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt ?? item.date)}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.text}
                    </p>
                    {item.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.attachments.map((file, idx) => (
                          <span key={idx} className="flex items-center gap-1 rounded bg-black/5 px-2 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            <Paperclip size={12} /> {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )})}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300/60 bg-slate-50/50 p-4 text-sm text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400">
                Sin comentarios.
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
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400">
        <Icon size={17} aria-hidden="true" />
      </div>
      <DetailField label={label} value={value} />
    </div>
  );
}
