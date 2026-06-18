/**
 * Configuración de los estados posibles de un ticket.
 * Fuente única de verdad para todos los componentes del sistema.
 * Separado de los datos mock para que pueda evolucionar independientemente.
 */
export const TICKET_STATUSES = [
  {
    id: "pendiente",
    label: "Pendiente",
    columnLabel: "Pendientes",
    tone: "blue",
    pulse: true,
  },
  {
    id: "asignado",
    label: "Asignado",
    columnLabel: "Asignados",
    tone: "indigo",
    pulse: false,
  },
  {
    id: "en-proceso",
    label: "En proceso",
    columnLabel: "En proceso",
    tone: "amber",
    pulse: false,
  },
  {
    id: "resuelto-pendiente",
    label: "Resuelto — pend. conformidad",
    columnLabel: "Por cerrar",
    tone: "teal",
    pulse: true,
  },
  {
    id: "cerrado",
    label: "Cerrado",
    columnLabel: "Cerrados",
    tone: "green",
    pulse: false,
  },
];
