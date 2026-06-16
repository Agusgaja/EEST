import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockTickets } from "../data/mockTickets.js";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";

const TicketContext = createContext(null);

// Cambiamos la clave al introducir un schema incompatible con la versión anterior.
// Esto fuerza una recarga desde mockTickets y evita errores con datos viejos en localStorage.
const STORAGE_KEY = "maintenance-tickets-v2";

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
        status: "abierto",
        createdAt: now,
        assignedTo: null,              // reservado para futuro flujo de asignación de técnicos
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
          closedAt: newStatusId === "resuelto" ? now : t.closedAt,
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

  return (
    // setTickets NO se expone — los componentes deben usar las funciones encapsuladas
    <TicketContext.Provider value={{ tickets, addTicket, changeStatus, addObservation }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
