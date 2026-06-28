import { SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

export default function CreateTicketPage() {
  const { user } = useAuth();
  const { addTicket } = useTickets();
  const { areas, motivos } = useSettings();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [motivo, setMotivo] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAreas = areas.filter((a) => a.estado === "Activo");
  const activeMotivos = motivos.filter((m) => m.estado === "Activo");

  function handleFileChange(e) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f)
    }));
    setAttachments(prev => [...prev, ...newFiles]);
  }

  function removeAttachment(index) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!title.trim() || !area.trim() || !motivo.trim() || !description.trim()) {
      setError("Título, área, motivo y descripción son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    // El contexto se encarga de construir el objeto completo y generar el ID.
    addTicket({
      title: title.trim(),
      area: area.trim(),
      motivo: motivo.trim(),
      fullDescription: description.trim(),
      attachments,
      userId: user.id,
      userSnapshot: {
        name: `${user.nombre} ${user.apellido}`
      },
      source: "web",
    });

    navigate("/dashboard/my-tickets");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Crear ticket
        </h1>
        <p className="truncate mt-1 text-sm text-slate-500 dark:text-slate-400">
          Complete el formulario para registrar una nueva solicitud de mantenimiento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card mt-6 rounded-xl p-6">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Título del problema
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Ej: Problema con luminaria..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Área
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Seleccione un área</option>
              {activeAreas.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Motivo
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            >
              <option value="">Seleccione un motivo</option>
              {activeMotivos.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descripción
            </label>
            <textarea
              className="min-h-32 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Describa el problema o solicitud..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Archivos adjuntos
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100 dark:text-slate-400 dark:file:bg-violet-500/10 dark:file:text-violet-400 dark:hover:file:bg-violet-500/20"
            />
            {attachments.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendHorizonal size={17} aria-hidden="true" />
            Crear ticket
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
