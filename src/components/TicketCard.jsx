import {
  Building2,
  CalendarDays,
  ChevronUp,
  GripVertical,
  UserRound,
  Wrench,
} from "lucide-react";
import { forwardRef } from "react";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate, getShortDescription, getStatus } from "../utils/ticketUtils.js";

const TicketCard = forwardRef(function TicketCard(
  {
    ticket,
    statuses,
    isExpanded,
    isDragging,
    isOverlay,
    dragHandleProps,
    onActivate = () => {},
    onCollapse = () => {},
    style,
  },
  ref,
) {
  const status = getStatus(statuses, ticket.status);
  const dragAttributes = dragHandleProps?.attributes ?? {};
  const dragListeners = dragHandleProps?.listeners ?? {};


  function handleActivate() {
    onActivate(ticket.id);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  function handleCollapse(event) {
    event.preventDefault();
    event.stopPropagation();
    onCollapse(ticket.id);
  }

  function stopDragFromControl(event) {
    event.stopPropagation();
  }

  return (
    <article
      ref={ref}
      className={`group min-w-0 w-full cursor-pointer rounded-xl text-left border shadow-sm ${
        isOverlay 
          ? "bg-white/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-700 shadow-2xl" 
          : "glass-card"
      } ${
        isExpanded && !isOverlay
          ? "p-4 ring-1 ring-sky-500/20 dark:ring-sky-500/10"
          : "p-4"
      } ${isDragging ? "opacity-40" : "opacity-100"}`}
      {...dragAttributes}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-slate-900 dark:text-slate-50">
            {ticket.title ?? ticket.id}
          </p>
          <p className="truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
            {ticket.id} &middot; {ticket.userSnapshot?.name ?? ticket.user ?? "—"}
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1 flex-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <button
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10 dark:hover:text-sky-300"
            onClick={handleCollapse}
            onMouseDown={stopDragFromControl}
            onPointerDown={stopDragFromControl}
            onTouchStart={stopDragFromControl}
            title="Minimizar ticket"
            type="button"
            tabIndex={isExpanded ? 0 : -1}
          >
            <ChevronUp size={17} aria-hidden="true" />
            <span className="sr-only">Minimizar ticket</span>
          </button>
          <span
            className="mt-0.5 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-200 hover:border-sky-300 hover:text-sky-500 active:cursor-grabbing dark:border-white/10 dark:bg-white/5 dark:text-slate-500 dark:hover:border-sky-500/40 dark:hover:text-sky-300"
            {...dragListeners}
            title="Arrastrar ticket"
          >
            <GripVertical size={17} aria-hidden="true" />
            <span className="sr-only">Arrastrar ticket</span>
          </span>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {getShortDescription(ticket.fullDescription)}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <InfoRow icon={UserRound} value={ticket.userSnapshot?.name ?? ticket.user ?? "—"} />
            <InfoRow icon={Building2} value={ticket.area ?? ticket.userSnapshot?.sector ?? ticket.sector ?? "—"} />
            <InfoRow icon={CalendarDays} value={formatDate(ticket.createdAt)} />
            <InfoRow icon={Wrench} value={ticket.motivo || "—"} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-shrink truncate">
                <StatusBadge status={status} />
              </div>
              {ticket.assignedTo && (
                <div 
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 ring-2 ring-white dark:bg-white/10 dark:text-slate-200 dark:ring-slate-900" 
                  title={`Asignado a: ${ticket.assignedTo.name}`}
                >
                  {ticket.assignedTo.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="truncate text-right text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0 ml-1">
              Click para ver detalle
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

export default TicketCard;

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="shrink-0 text-sky-400 dark:text-sky-400" size={15} aria-hidden="true" />
      <span className="truncate">{value}</span>
    </div>
  );
}
