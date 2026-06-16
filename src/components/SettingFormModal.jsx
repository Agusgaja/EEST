import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export default function SettingFormModal({ isOpen, onClose, type, initialData, onSave, categories = [] }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setCategory(initialData?.category || "");
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (type === "Subcategoría" && !category.trim()) {
      setError("Debe seleccionar una categoría padre.");
      return;
    }

    try {
      onSave(name.trim(), type === "Subcategoría" ? category.trim() : undefined);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-overlay">
      <div 
        className="glass-card animate-slide-up relative w-full max-w-md overflow-hidden rounded-2xl bg-white/95 shadow-2xl dark:bg-slate-900/95"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200/50 p-5 dark:border-white/10">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? `Editar ${type}` : `Nuevo ${type}`}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre</label>
              <input
                type="text"
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Ej: ${type === "Sector" ? "Mantenimiento" : type === "Categoría" ? "Eléctrico" : "Toma Corriente"}`}
              />
            </div>

            {type === "Subcategoría" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoría Padre</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-500/20 hover:bg-violet-500 transition-colors"
            >
              <Check size={16} />
              {isEdit ? "Guardar Cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
