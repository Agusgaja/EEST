import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockTickets } from "../data/mockTickets.js";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";

const TicketContext = createContext(null);

// Cambiamos la clave al introducir un schema incompatible con la versión anterior.
// Esto fuerza una recarga desde mockTickets y evita errores con datos viejos en localStorage.
const STORAGE_KEY = "maintenance-tickets-v3";

function loadTickets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTickets;
  } catch {
    return mockTickets;
  }
}

/** Genera IDs en formato MT-NNN a partir del máximo existente. */
function generateTicketId(tickets) {
  const maxNum = tickets.reduce((max, t) => {
    const num = parseInt(String(t.id).replace("MT-", ""), 10);
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 1012);
  return `MT-${maxNum + 1}`;
}

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(loadTickets);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  /**
   * Crea un nuevo ticket con el schema completo.
   * La generación del ID, la construcción del objeto y la entrada de historial
   * son responsabilidad exclusiva del contexto.
   */
  const addTicket = useCallback(
    ({ category, subcategory, deviceTag, fullDescription, userId, userSnapshot, source }) => {
      const id = generateTicketId(tickets);
      const now = new Date().toISOString();

      const newTicket = {
        id,
        source: source ?? "web",
        userId,
        userSnapshot,                  // { name, sector, legajo }
        category,
        subcategory,
        deviceTag: deviceTag?.trim() ?? "",
        fullDescription: fullDescription.trim(),
        // shortDescription eliminado del schema — se deriva en render con getShortDescription()
        status: "pendiente",
        createdAt: now,
        assignedTo: null,              // { id, name } cuando se asigna técnico
        resolvedAt: null,
        closedAt: null,
        observations: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            action: "Ticket creado",
            detail: "Solicitud creada desde el portal de usuario.",
            actor: userSnapshot.name,
            actorId: userId,
            createdAt: now,
          },
        ],
      };

      setTickets((prev) => [...prev, newTicket]);
    },
    [tickets],
  );

  /**
   * Cambia el estado de un ticket.
   * Registra automáticamente la entrada de historial con el actor real.
   * Si el nuevo estado es "resuelto", establece closedAt.
   */
  const changeStatus = useCallback((ticketId, newStatusId, actor, actorId) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
        const newLabel  = TICKET_STATUSES.find((s) => s.id === newStatusId)?.label ?? newStatusId;
        const now = new Date().toISOString();
        return {
          ...t,
          status: newStatusId,
          resolvedAt: newStatusId === "resuelto-pendiente" ? now : t.resolvedAt,
          closedAt: newStatusId === "cerrado" ? now : t.closedAt,
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}`,
              action: "Estado actualizado",
              detail: `Cambio de ${prevLabel} a ${newLabel}.`,
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Agrega una observación interna a un ticket.
   * Registra la entrada de historial con el actor real.
   */
  const addObservation = useCallback((ticketId, text, author, authorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          observations: [
            ...t.observations,
            {
              id: `obs-${Date.now()}`,
              author: author ?? "Sistema",
              authorId: authorId ?? "system",
              text,
              createdAt: now,
            },
          ],
          history: [
            ...t.history,
            {
              id: `hist-${Date.now() + 1}`,
              action: "Observación agregada",
              detail: "Se registró una nueva observación interna.",
              actor: author ?? "Sistema",
              actorId: authorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Asigna un técnico a un ticket.
   */
  const assignTicket = useCallback((ticketId, technicianId, technicianName, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const wasPendiente = t.status === "pendiente";
        const newStatus = wasPendiente ? "asignado" : t.status;
        
        let historyEntries = [...t.history];
        if (wasPendiente) {
          const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
          const newLabel = TICKET_STATUSES.find((s) => s.id === "asignado")?.label ?? "Asignado";
          historyEntries.push({
            id: `hist-${Date.now()}-status`,
            action: "Estado actualizado",
            detail: `Cambio de ${prevLabel} a ${newLabel}.`,
            actor: actor ?? "Sistema",
            actorId: actorId ?? "system",
            createdAt: now,
          });
        }
        
        historyEntries.push({
          id: `hist-${Date.now()}-assign`,
          action: `Asignado a ${technicianName}`,
          detail: "Técnico asignado al ticket.",
          actor: actor ?? "Sistema",
          actorId: actorId ?? "system",
          createdAt: now,
        });

        return {
          ...t,
          status: newStatus,
          assignedTo: { id: technicianId, name: technicianName },
          history: historyEntries,
        };
      }),
    );
  }, []);

  /**
   * Edita campos de un ticket (solo mientras status === "pendiente").
   */
  const editTicket = useCallback((ticketId, { category, subcategory, deviceTag, fullDescription }, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId || t.status !== "pendiente") return t;
        return {
          ...t,
          category,
          subcategory,
          deviceTag: deviceTag?.trim() ?? "",
          fullDescription: fullDescription.trim(),
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}`,
              action: "Ticket editado",
              detail: "Se actualizaron los detalles de la solicitud.",
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Confirma la conformidad del usuario (cierra el ticket).
   */
  const confirmTicket = useCallback((ticketId, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
        const newLabel = TICKET_STATUSES.find((s) => s.id === "cerrado")?.label ?? "Cerrado";
        return {
          ...t,
          status: "cerrado",
          closedAt: now,
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}-status`,
              action: "Estado actualizado",
              detail: `Cambio de ${prevLabel} a ${newLabel}.`,
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
            {
              id: `hist-${Date.now()}-confirm`,
              action: "Conformidad confirmada",
              detail: "El usuario confirmó la resolución.",
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  return (
    // setTickets NO se expone — los componentes deben usar las funciones encapsuladas
    <TicketContext.Provider value={{ tickets, addTicket, changeStatus, addObservation, assignTicket, editTicket, confirmTicket }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
