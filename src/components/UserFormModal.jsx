import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUsers } from "../context/UserContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  sector: "Producción",
  rol: "Usuario",
  legajo: "",
  estado: "Activo"
};
export default function UserFormModal({ isOpen, onClose, userToEdit }) {
  const { addUser, updateUser } = useUsers();
  const { showToast } = useToast();
  const { sectors } = useSettings();
  const activeSectors = sectors.filter(s => s.estado === "Activo");
  
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userToEdit) {
      setFormData({ ...userToEdit });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!formData.legajo.trim()) newErrors.legajo = "El legajo es obligatorio.";
    
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de correo electrónico inválido.";
    }

    // Phone validation (at least 8 chars, allows + and digits)
    const phoneRegex = /^[\+\d\s\-]{8,}$/;
    if (!formData.telefono.trim() || !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido (mín. 8 caracteres).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (userToEdit) {
        updateUser(userToEdit.id, formData);
        showToast("Usuario actualizado correctamente", "success");
      } else {
        addUser(formData);
        showToast("Usuario creado correctamente", "success");
      }
      onClose();
    } catch (error) {
      // The context will throw an error if the legajo already exists
      setErrors({ legajo: error.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-overlay">
      <div 
        className="glass-card animate-slide-up relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white/95 shadow-2xl dark:bg-slate-900/95"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200/50 p-5 dark:border-white/10">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`mt-1 block w-full rounded-lg border ${errors.nombre ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:bg-white/5 dark:text-slate-100`}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className={`mt-1 block w-full rounded-lg border ${errors.apellido ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:bg-white/5 dark:text-slate-100`}
              />
              {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:bg-white/5 dark:text-slate-100`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className={`mt-1 block w-full rounded-lg border ${errors.telefono ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:bg-white/5 dark:text-slate-100`}
              />
              {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Legajo</label>
              <input
                type="text"
                value={formData.legajo}
                onChange={(e) => setFormData({ ...formData, legajo: e.target.value })}
                className={`mt-1 block w-full rounded-lg border ${errors.legajo ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:bg-white/5 dark:text-slate-100`}
              />
              {errors.legajo && <p className="mt-1 text-xs text-red-500">{errors.legajo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <option value="Admin">Admin</option>
                <option value="Usuario">Usuario</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sector</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <option value="">Seleccione un sector</option>
                {activeSectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200/50 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-violet-500"
            >
              {userToEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
