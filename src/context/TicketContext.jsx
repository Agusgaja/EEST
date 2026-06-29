import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .is('deleted_at', null)
      .order('createdAt', { ascending: false });
    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTicket = useCallback(async ({ title, area, motivo, fullDescription, attachments, userId, userSnapshot, source }) => {
    const now = new Date().toISOString();
    
    // 1. Subir archivos a Supabase Storage
    const uploadedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const fileObj of attachments) {
        if (fileObj.file) { // if we pass the actual File object
          const fileExt = fileObj.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `tickets/${userId}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, fileObj.file);
            
          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('ticket-attachments')
              .getPublicUrl(filePath);
              
            uploadedAttachments.push({
              name: fileObj.name,
              size: fileObj.size,
              type: fileObj.type,
              url: publicUrlData.publicUrl
            });
          }
        }
      }
    }

    const newTicket = {
      title: title?.trim() ?? "Sin título",
      "fullDescription": fullDescription.trim(),
      motivo,
      area,
      status: "pendiente",
      priority: "media",
      "createdAt": now,
      "userSnapshot": userSnapshot,
      "userId": userId,
      attachments: uploadedAttachments,
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
      // No incluimos ID para que Supabase lo autogenere
    };

    const { data: inserted, error } = await supabase
      .from('tickets')
      .insert([newTicket])
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Actualización optimista: agregar al estado local inmediatamente
    // sin esperar el evento realtime para que aparezca al instante en "Mis Tickets"
    setTickets((prev) => [inserted, ...prev]);
  }, []);

  const changeStatus = useCallback(async (ticketId, newStatusId, actor, actorId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const prevLabel = TICKET_STATUSES.find((s) => s.id === ticket.status)?.label ?? ticket.status;
    const newLabel  = TICKET_STATUSES.find((s) => s.id === newStatusId)?.label ?? newStatusId;
    const now = new Date().toISOString();

    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: "Estado actualizado",
      detail: `Cambio de ${prevLabel} a ${newLabel}.`,
      actor: actor ?? "Sistema",
      actorId: actorId ?? "system",
      createdAt: now,
    };

    const updates = {
      status: newStatusId,
      history: [...(ticket.history || []), newHistoryEntry]
    };

    if (newStatusId === "pendiente") updates.assignedTo = null;
    if (newStatusId === "resuelto-pendiente") updates.resolvedAt = now;
    if (newStatusId === "cerrado") updates.closedAt = now;

    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId);
    if (error) throw new Error(error.message);
    
    // Actualización optimista
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
  }, [tickets]);

  const addObservation = useCallback(async (ticketId, text, author, authorId, authorRole, attachments = []) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();

    // 1. Subir archivos a Supabase Storage
    const uploadedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const fileObj of attachments) {
        if (fileObj.file) { // if we pass the actual File object
          const fileExt = fileObj.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `comments/${ticketId}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, fileObj.file);
            
          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('ticket-attachments')
              .getPublicUrl(filePath);
              
            uploadedAttachments.push({
              name: fileObj.name,
              url: publicUrlData.publicUrl
            });
          }
        }
      }
    }

    const newObservation = {
      id: `obs-${Date.now()}`,
      author: author ?? "Sistema",
      authorId: authorId ?? "system",
      authorRole: authorRole ?? "usuario",
      text,
      attachments: uploadedAttachments,
      createdAt: now,
    };

    const newHistoryEntry = {
      id: `hist-${Date.now() + 1}`,
      action: "Observación agregada",
      detail: "Se registró una nueva observación interna.",
      actor: author ?? "Sistema",
      actorId: authorId ?? "system",
      createdAt: now,
    };

    const updates = {
      observations: [...(ticket.observations || []), newObservation],
      history: [...(ticket.history || []), newHistoryEntry]
    };

    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId);

    if (error) throw new Error(error.message);
    
    // Actualización optimista
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
  }, [tickets]);

  const assignTicket = useCallback(async (ticketId, technicianId, technicianName, actor, actorId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();
    const wasPendiente = ticket.status === "pendiente";
    const newStatus = wasPendiente ? "asignado" : ticket.status;
    
    let historyEntries = [...(ticket.history || [])];
    if (wasPendiente) {
      const prevLabel = TICKET_STATUSES.find((s) => s.id === ticket.status)?.label ?? ticket.status;
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
      action: "Asignación actualizada",
      detail: `Ticket asignado a ${technicianName}.`,
      actor: actor ?? "Sistema",
      actorId: actorId ?? "system",
      createdAt: now,
    });

    const updates = {
      "assignedTo": { id: technicianId, name: technicianName },
      status: newStatus,
      history: historyEntries
    };

    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId);
    if (error) throw new Error(error.message);
    
    // Actualización optimista
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
  }, [tickets]);

  const editTicket = useCallback(async (ticketId, { title, area, motivo, fullDescription, attachments }, actor, actorId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== "pendiente") return;

    const now = new Date().toISOString();
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: "Ticket editado",
      detail: "Se actualizaron los detalles de la solicitud.",
      actor: actor ?? "Sistema",
      actorId: actorId ?? "system",
      createdAt: now,
    };

    const { error } = await supabase.from('tickets').update({
      title: title?.trim() ?? "Sin título",
      area,
      motivo,
      "fullDescription": fullDescription.trim(),
      attachments: attachments || [],
      history: [...ticket.history, newHistoryEntry]
    }).eq('id', ticketId);

    if (error) throw new Error(error.message);
  }, [tickets]);

  const confirmTicket = useCallback(async (ticketId, actor, actorId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const prevLabel = TICKET_STATUSES.find((s) => s.id === ticket.status)?.label ?? ticket.status;
    const newLabel = TICKET_STATUSES.find((s) => s.id === "cerrado")?.label ?? "Cerrado";
    const now = new Date().toISOString();

    const { error } = await supabase.from('tickets').update({
      status: "cerrado",
      "closedAt": now,
      history: [
        ...ticket.history,
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
      ]
    }).eq('id', ticketId);

    if (error) throw new Error(error.message);
  }, [tickets]);

  const deleteTicket = useCallback(async (ticketId, actor, actorId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: "Ticket eliminado",
      detail: "El ticket ha sido eliminado del sistema.",
      actor: actor ?? "Sistema",
      actorId: actorId ?? "system",
      createdAt: now,
    };

    const { error } = await supabase
      .from('tickets')
      .update({
        deleted_at: now,
        history: [...ticket.history, newHistoryEntry]
      })
      .eq('id', ticketId);

    if (error) throw new Error(error.message);
  }, [tickets]);

  return (
    <TicketContext.Provider value={{ tickets, loading, addTicket, changeStatus, addObservation, assignTicket, editTicket, confirmTicket, deleteTicket }}>
      {!loading && children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
