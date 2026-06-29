import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Send,
  Paperclip,
  Tag,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import DetailField from "../components/DetailField.jsx";
import HistoryTimeline from "../components/HistoryTimeline.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";
import { formatDate, getShortDescription, getStatus } from "../utils/ticketUtils.js";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { tickets, confirmTicket, changeStatus, addObservation } = useTickets();
  const [detailTicketId, setDetailTicketId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentAttachments, setCommentAttachments] = useState([]);

  function handleFileChange(e) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setCommentAttachments(prev => [...prev, ...newFiles]);
  }

  function handleSubmitComment(e) {
    e.preventDefault();
    if (!newComment.trim() && commentAttachments.length === 0) return;
    const actorName = `${user.nombre} ${user.apellido}`;
    addObservation(detailTicket.id, newComment.trim(), actorName, user.id, user.role, commentAttachments);
    setNewComment("");
    setCommentAttachments([]);
  }

  // Filtro por userId (referencia segura). Fallback: comparación por nombre para tickets legacy del seed.
  const myTickets = tickets.filter((t) =>
    t.userId ? t.userId === user.id : t.userSnapshot?.name === `${user.nombre} ${user.apellido}`,
  );

  const detailTicket = detailTicketId
    ? tickets.find((t) => t.id === detailTicketId)
    : null;

  function handleConfirm() {
    if (!detailTicket) return;
    confirmTicket(detailTicket.id, `${user.nombre} ${user.apellido}`, user.id);
  }

  function handleReportIssue() {
    if (!detailTicket) return;
    const actorName = `${user.nombre} ${user.apellido}`;
    addObservation(detailTicket.id, "El usuario reporta que el problema persiste y rechaza la resolución.", actorName, user.id);
    changeStatus(detailTicket.id, "en-proceso", actorName, user.id);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Mis tickets
        </h1>
        <p className="truncate mt-1 text-sm text-slate-500 dark:text-slate-400">
          {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} registrado
          {myTickets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {myTickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          No tiene tickets registrados.
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {myTickets.map((ticket) => {
            const status = getStatus(TICKET_STATUSES, ticket.status);
            return (
              <button
                key={ticket.id}
                onClick={() => setDetailTicketId(ticket.id)}
                className="glass-card flex w-full items-center gap-4 rounded-xl p-4 text-left"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {ticket.title ?? ticket.id}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <span className="text-xs text-slate-500">{ticket.id}</span>
                  <p className="line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
                    {getShortDescription(ticket.fullDescription)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{ticket.motivo}</span>
                    <span>&middot;</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detailTicket ? (
        <aside className="fixed inset-0 z-30 flex justify-end px-0 sm:px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/30 dark:bg-black/50"
            onClick={() => setDetailTicketId(null)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="animate-slide-in-right relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white dark:border-l dark:border-white/10 dark:bg-slate-950/95 dark:backdrop-blur-xl sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-lg">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-white/10">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {detailTicket.title ?? detailTicket.id}
                  </p>
                  <StatusBadge status={getStatus(TICKET_STATUSES, detailTicket.status)} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{detailTicket.id}</p>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {getShortDescription(detailTicket.fullDescription)}
                </p>
              </div>
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                onClick={() => setDetailTicketId(null)}
                type="button"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {detailTicket.status === "resuelto-pendiente" && (
                <section className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/30 dark:bg-teal-500/10">
                  <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">
                    Se requiere tu conformidad
                  </h3>
                  <p className="mt-1 text-sm text-teal-700 dark:text-teal-400">
                    El técnico ha marcado este ticket como resuelto. Por favor, confirmá que el problema fue solucionado o reportá si persiste.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={handleConfirm}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-all hover:bg-teal-500 active:scale-95"
                    >
                      <CheckCircle2 size={16} />
                      Confirmar resolución
                    </button>
                    <button
                      onClick={handleReportIssue}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-teal-600/30 bg-white px-4 text-sm font-semibold text-teal-700 transition-all hover:bg-teal-50 active:scale-95 dark:border-teal-400/30 dark:bg-transparent dark:text-teal-300 dark:hover:bg-teal-500/10"
                    >
                      Reportar problema
                    </button>
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Información del ticket
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <IconField
                    icon={UserRound}
                    label="Usuario"
                    value={detailTicket.userSnapshot?.name ?? detailTicket.user ?? "—"}
                  />
                  <IconField
                    icon={Building2}
                    label="Área"
                    value={detailTicket.area ?? detailTicket.userSnapshot?.sector ?? detailTicket.sector ?? "—"}
                  />
                  <IconField
                    icon={Tag}
                    label="Legajo"
                    value={detailTicket.userSnapshot?.legajo ?? "—"}
                  />
                  <IconField
                    icon={CalendarDays}
                    label="Fecha"
                    value={formatDate(detailTicket.createdAt)}
                  />
                  <IconField icon={Wrench} label="Motivo" value={detailTicket.motivo} />
                </dl>
                <DetailField label="Descripción completa" value={detailTicket.fullDescription} />
                {detailTicket.attachments?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Archivos adjuntos</p>
                    <div className="flex flex-wrap gap-2">
                      {detailTicket.attachments.map((file, idx) => (
                        <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20">
                          <Paperclip size={14} /> {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="mt-8 space-y-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Comentarios
                </h3>
                {detailTicket.observations.length > 0 ? (
                  <div className="grid gap-3">
                    {detailTicket.observations.map((item) => {
                      const isTech = item.authorRole === "tecnico" || item.authorRole === "admin";
                      return (
                      <article
                        className={`rounded-lg border p-4 ${isTech ? "border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}
                        key={item.id}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.author}
                            </p>
                            {isTech && <span className="rounded bg-sky-200 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-500/30 dark:text-sky-200">TÉCNICO</span>}
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
                              <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded bg-black/5 px-2 py-1 text-xs text-slate-600 hover:bg-black/10 transition-colors dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20">
                                <Paperclip size={12} /> {file.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </article>
                    )})}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Sin comentarios.
                  </p>
                )}
                
                <form onSubmit={handleSubmitComment} className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <textarea
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Escribe un comentario..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  {commentAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {commentAttachments.map((f, i) => (
                        <span key={i} className="flex items-center gap-1 rounded bg-sky-100 px-2 py-1 text-xs text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
                          <Paperclip size={12} /> {f.name}
                          <button type="button" onClick={() => setCommentAttachments(p => p.filter((_, idx) => idx !== i))} className="ml-1 text-sky-500 hover:text-red-500"><X size={12}/></button>
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
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
                      <Send size={16} />
                      Comentar
                    </button>
                  </div>
                </form>
              </section>

              <section className="mt-8 space-y-4 pb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Historial
                </h3>
                <HistoryTimeline history={detailTicket.history} />
              </section>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function IconField({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-600/20 dark:text-sky-400">
        <Icon size={17} aria-hidden="true" />
      </div>
      <DetailField label={label} value={value} />
    </div>
  );
}
