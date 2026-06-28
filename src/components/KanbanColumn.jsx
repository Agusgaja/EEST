import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTicketCard from "./SortableTicketCard.jsx";

const COLUMN_ACCENTS = {
  pendiente: "border-slate-500/30 dark:border-slate-500/20",
  asignado: "border-blue-500/30 dark:border-blue-500/20",
  "en-proceso": "border-amber-500/30 dark:border-amber-500/20",
  "resuelto-pendiente": "border-teal-500/30 dark:border-teal-500/20",
  cerrado: "border-emerald-500/30 dark:border-emerald-500/20",
};

const COLUMN_HEADER_ACCENTS = {
  pendiente: "text-slate-600 dark:text-slate-400",
  asignado: "text-blue-600 dark:text-blue-400",
  "en-proceso": "text-amber-600 dark:text-amber-400",
  "resuelto-pendiente": "text-teal-600 dark:text-teal-400",
  cerrado: "text-emerald-600 dark:text-emerald-400",
};

const COLUMN_COUNT_ACCENTS = {
  pendiente: "bg-slate-500/10 text-slate-600 ring-slate-400/20 dark:text-slate-300 dark:ring-slate-500/20",
  asignado: "bg-blue-500/10 text-blue-600 ring-blue-400/20 dark:text-blue-300 dark:ring-blue-500/20",
  "en-proceso": "bg-amber-500/10 text-amber-600 ring-amber-400/20 dark:text-amber-300 dark:ring-amber-500/20",
  "resuelto-pendiente": "bg-teal-500/10 text-teal-600 ring-teal-400/20 dark:text-teal-300 dark:ring-teal-500/20",
  cerrado: "bg-emerald-500/10 text-emerald-600 ring-emerald-400/20 dark:text-emerald-300 dark:ring-emerald-500/20",
};

export default function KanbanColumn({
  status,
  tickets,
  statuses,
  expandedTicketId,
  onActivateTicket,
  onCollapseTicket,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status.id,
    data: {
      type: "column",
      statusId: status.id,
    },
  });

  return (
    <section
      className={`flex h-full min-w-[320px] max-w-[360px] shrink-0 snap-center flex-col rounded-xl border transition-all duration-200 ${
        COLUMN_ACCENTS[status.id] ?? "border-slate-200 dark:border-white/10"
      } ${
        isOver
          ? "bg-violet-50/80 dark:bg-violet-500/5 shadow-[0_0_20px_rgba(124,58,237,0.12)]"
          : "bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl"
      }`}
    >
      <div className={`flex min-h-14 items-center justify-between border-b px-4 ${
        isOver
          ? "border-violet-200 dark:border-violet-500/20"
          : "border-slate-200/80 dark:border-white/[0.07]"
      }`}>
        <div className="min-w-0">
          <h2 className={`truncate text-sm font-semibold ${COLUMN_HEADER_ACCENTS[status.id] ?? "text-slate-900 dark:text-slate-100"}`}>
            {status.columnLabel}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-500">Tickets de mantenimiento</p>
        </div>
        {/* key triggers count-pop animation on every change */}
        <span
          key={tickets.length}
          className={`animate-count-pop flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold ring-1 ${
            COLUMN_COUNT_ACCENTS[status.id] ?? "bg-slate-100 text-slate-700 ring-slate-200"
          }`}
        >
          {tickets.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <SortableContext
          id={status.id}
          items={tickets.map((ticket) => ticket.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="grid content-start gap-2.5 p-3">
          {tickets.map((ticket) => (
            <SortableTicketCard
              key={ticket.id}
              ticket={ticket}
              statuses={statuses}
              isExpanded={expandedTicketId === ticket.id}
              onActivate={onActivateTicket}
              onCollapse={onCollapseTicket}
            />
          ))}

          {tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300/60 bg-transparent px-3 py-8 text-center text-sm text-slate-400 dark:border-white/[0.07] dark:text-slate-600">
              Sin tickets visibles
            </div>
          ) : null}
        </div>
        </SortableContext>
      </div>
    </section>
  );
}
