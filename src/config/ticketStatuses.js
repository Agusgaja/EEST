/**
 * Configuración de los estados posibles de un ticket.
 * Fuente única de verdad para todos los componentes del sistema.
 * Separado de los datos mock para que pueda evolucionar independientemente.
 */
export const TICKET_STATUSES = [
  {
    id: "abierto",
    label: "Abierto",
    columnLabel: "Abiertos",
    tone: "blue",
  },
  {
    id: "en-proceso",
    label: "En proceso",
    columnLabel: "En proceso",
    tone: "amber",
  },
  {
    id: "resuelto",
    label: "Resuelto",
    columnLabel: "Resueltos",
    tone: "green",
  },
];
