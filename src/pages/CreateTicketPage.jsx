import { SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

export default function CreateTicketPage() {
  const { user } = useAuth();
  const { addTicket } = useTickets();
  const { categories, subcategories } = useSettings();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [deviceTag, setDeviceTag] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCategories = categories.filter((c) => c.estado === "Activo");
  const availableSubcategories = subcategories.filter(
    (s) => s.estado === "Activo" && s.category === category,
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!category.trim() || !subcategory.trim() || !description.trim()) {
      setError("Categoría, subcategoría y descripción son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    // El contexto se encarga de construir el objeto completo y generar el ID.
    addTicket({
      category: category.trim(),
      subcategory: subcategory.trim(),
      deviceTag: deviceTag.trim(),
      fullDescription: description.trim(),
      userId: user.id,
      userSnapshot: {
        name: `${user.nombre} ${user.apellido}`,
        sector: user.sector,
        legajo: user.legajo,
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
              Categoría
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
            >
              <option value="">Seleccione una categoría</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Subcategoría
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 disabled:opacity-50"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
            >
              <option value="">
                {!category ? "Seleccione primero una categoría" : "Seleccione una subcategoría"}
              </option>
              {availableSubcategories.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Etiqueta del equipo
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Ej: LUM-A12, CT-P05 (opcional)"
              value={deviceTag}
              onChange={(e) => setDeviceTag(e.target.value)}
            />
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
