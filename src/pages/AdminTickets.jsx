import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import KanbanColumn from "../components/KanbanColumn.jsx";
import MetricsPanel from "../components/MetricsPanel.jsx";
import TicketCard from "../components/TicketCard.jsx";
import TicketDetailPanel from "../components/TicketDetailPanel.jsx";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";
import { getStatus } from "../utils/ticketUtils.js";

const statusIds = TICKET_STATUSES.map((s) => s.id);

const defaultExpandedTicketIds = TICKET_STATUSES.reduce((acc, s) => {
  acc[s.id] = null;
  return acc;
}, {});

function buildColumns(tickets) {
  return TICKET_STATUSES.reduce((acc, status) => {
    acc[status.id] = tickets
      .filter((t) => t.status === status.id)
      .map((t) => t.id);
    return acc;
  }, {});
}

function ticketMatchesQuery(ticket, normalizedQuery) {
  if (!normalizedQuery) return true;
  return [
    ticket.id,
    ticket.userSnapshot?.name ?? ticket.user ?? "",
    ticket.userSnapshot?.sector ?? ticket.sector ?? "",
    ticket.area,
    ticket.motivo,
    ticket.fullDescription,
    ticket.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function moveTicketToColumn(columns, ticketId, targetStatusId) {
  const nextColumns = statusIds.reduce((acc, statusId) => {
    acc[statusId] = (columns[statusId] ?? []).filter((id) => id !== ticketId);
    return acc;
  }, {});
  nextColumns[targetStatusId] = [...(nextColumns[targetStatusId] ?? []), ticketId];
  return nextColumns;
}

export default function AdminTickets() {
  const { user } = useAuth();
  const { tickets, changeStatus, addObservation, assignTicket } = useTickets();
  const { theme, toggleTheme } = useTheme();

  const [columns, setColumns] = useState(() => buildColumns(tickets));
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [expandedTicketIds, setExpandedTicketIds] = useState(defaultExpandedTicketIds);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [query, setQuery] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);
  const columnsBeforeDragRef = useRef(null);
  const sourceContainerBeforeDragRef = useRef(null);

  useEffect(() => {
    setColumns(buildColumns(tickets));
  }, [tickets]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ticketsById = useMemo(
    () => new Map(tickets.map((t) => [t.id, t])),
    [tickets],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const ticketsByStatus = useMemo(() => {
    return TICKET_STATUSES.reduce((acc, status) => {
      acc[status.id] = (columns[status.id] ?? [])
        .map((ticketId) => ticketsById.get(ticketId))
        .filter(Boolean)
        .filter((t) => ticketMatchesQuery(t, normalizedQuery));
      return acc;
    }, {});
  }, [columns, normalizedQuery, ticketsById]);

  const selectedTicket = selectedTicketId ? ticketsById.get(selectedTicketId) : null;
  const activeTicket = activeTicketId ? ticketsById.get(activeTicketId) : null;

  function findContainer(itemId, sourceColumns = columns) {
    if (statusIds.includes(itemId)) return itemId;
    return statusIds.find((statusId) => sourceColumns[statusId]?.includes(itemId));
  }

  function handleTicketActivation(ticketId) {
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer) return;
    if (expandedTicketIds[ticketContainer] === ticketId) {
      setSelectedTicketId(ticketId);
      return;
    }
    setExpandedTicketIds((prev) => ({ ...prev, [ticketContainer]: ticketId }));
  }

  function handleTicketCollapse(ticketId) {
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer) return;
    setExpandedTicketIds((prev) => ({ ...prev, [ticketContainer]: null }));
  }

  // Usa changeStatus del contexto — el contexto genera la entrada de historial con el actor real.
  function handleUpdateStatus(ticketId, newStatusId) {
    changeStatus(
      ticketId,
      newStatusId,
      `${user.nombre} ${user.apellido}`,
      user.id,
    );
    // Sincronizar columnas visualmente
    setColumns((prev) => moveTicketToColumn(prev, ticketId, newStatusId));
  }

  function handleAddObservation(ticketId, text, attachments) {
    addObservation(
      ticketId,
      text,
      `${user.nombre} ${user.apellido}`,
      user.id,
      user.role,
      attachments
    );
  }

  function handleAssignTicket(ticketId, techId, techName) {
    assignTicket(
      ticketId,
      techId,
      techName,
      `${user.nombre} ${user.apellido}`,
      user.id
    );
  }

  function commitDroppedStatus(ticketId, nextStatusId) {
    const ticket = ticketsById.get(ticketId);
    if (!ticket || ticket.status === nextStatusId) return;
    changeStatus(
      ticketId,
      nextStatusId,
      `${user.nombre} ${user.apellido}`,
      user.id,
    );
  }

  function handleDragStart(event) {
    const ticketId = event.active.id;
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer || expandedTicketIds[ticketContainer] !== ticketId) return;
    columnsBeforeDragRef.current = columns;
    sourceContainerBeforeDragRef.current = ticketContainer;
    setActiveTicketId(ticketId);
  }

  function handleDragOver(event) {
    if (!activeTicketId) return;
    const activeId = event.active.id;
    const overId = event.over?.id;
    if (!overId || activeId === overId) return;
    setColumns((currentColumns) => {
      const activeContainer = findContainer(activeId, currentColumns);
      const overContainer = findContainer(overId, currentColumns);
      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return currentColumns;
      }
      const activeItems = currentColumns[activeContainer] ?? [];
      const overItems = currentColumns[overContainer] ?? [];
      const overIndex = overItems.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;
      return {
        ...currentColumns,
        [activeContainer]: activeItems.filter((id) => id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeId,
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event) {
    if (!activeTicketId) return;
    const activeId = event.active.id;
    const overId = event.over?.id;
    const activeContainer = findContainer(activeId);
    const overContainer = overId ? findContainer(overId) : null;
    const sourceContainer = sourceContainerBeforeDragRef.current;

    setActiveTicketId(null);
    const prevColumns = columnsBeforeDragRef.current;
    columnsBeforeDragRef.current = null;
    sourceContainerBeforeDragRef.current = null;

    if (!overId || !activeContainer || !overContainer) return;

    const ticket = ticketsById.get(activeId);
    if (ticket && activeContainer === "asignado" && !ticket.assignedTo) {
      alert("Debes abrir el ticket y asignarle un técnico antes de moverlo a esta columna.");
      if (prevColumns) setColumns(prevColumns);
      return;
    }

    if (activeContainer === overContainer && activeId !== overId && !statusIds.includes(overId)) {
      setColumns((currentColumns) => {
        const items = currentColumns[activeContainer] ?? [];
        const activeIndex = items.indexOf(activeId);
        const overIndex = items.indexOf(overId);
        if (activeIndex === -1 || overIndex === -1) return currentColumns;
        return { ...currentColumns, [activeContainer]: arrayMove(items, activeIndex, overIndex) };
      });
    }

    commitDroppedStatus(activeId, activeContainer);

    if (sourceContainer && sourceContainer !== activeContainer) {
      setExpandedTicketIds((prev) => ({
        ...prev,
        [sourceContainer]: null,
        [activeContainer]: activeId,
      }));
    }
  }

  function handleDragCancel() {
    if (columnsBeforeDragRef.current) {
      setColumns(columnsBeforeDragRef.current);
    }
    setActiveTicketId(null);
    columnsBeforeDragRef.current = null;
    sourceContainerBeforeDragRef.current = null;
  }

  return (
    <div className="absolute inset-0 flex w-full flex-col overflow-hidden">
      <DashboardHeader
        ticketCount={tickets.filter((t) => t.source === "whatsapp").length}
        query={query}
        theme={theme}
        onQueryChange={setQuery}
        onToggleTheme={toggleTheme}
        onOpenMetrics={() => setShowMetrics(true)}
      />

      <main className="mx-auto flex w-full max-w-[1480px] flex-col px-4 py-6 sm:px-6 lg:px-8 flex-1 min-h-0">
        <section className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 transition-colors dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">Tablero operativo</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              Solicitudes recibidas y seguimiento
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {TICKET_STATUSES.map((status) => (
              <span
                className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                key={status.id}
              >
                {status.columnLabel}: {ticketsByStatus[status.id]?.length ?? 0}
              </span>
            ))}
          </div>
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <section className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory flex-1 min-h-0">
            {TICKET_STATUSES.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                tickets={ticketsByStatus[status.id] ?? []}
                statuses={TICKET_STATUSES}
                expandedTicketId={expandedTicketIds[status.id]}
                onActivateTicket={handleTicketActivation}
                onCollapseTicket={handleTicketCollapse}
              />
            ))}
          </section>

          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
            {activeTicket ? (
              <TicketCard
                ticket={activeTicket}
                statuses={TICKET_STATUSES}
                isExpanded
                isOverlay
                onActivate={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {selectedTicket ? (
        <TicketDetailPanel
          ticket={selectedTicket}
          statuses={TICKET_STATUSES}
          onClose={() => setSelectedTicketId(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddObservation={handleAddObservation}
          onAssignTicket={handleAssignTicket}
        />
      ) : null}

      {showMetrics ? (
        <MetricsPanel
          tickets={tickets}
          statuses={TICKET_STATUSES}
          onClose={() => setShowMetrics(false)}
        />
      ) : null}
    </div>
  );
}
