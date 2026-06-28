import { Edit, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import SettingFormModal from "../components/SettingFormModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

function SettingList({ title, description, items, type, onAdd, onEdit, onToggleStatus }) {
  return (
    <div className="glass-card flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200/50 p-5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <button 
            onClick={() => onAdd(type)}
            className="rounded-lg bg-sky-100 p-1.5 text-sky-600 transition-colors hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.estado === "Activo";
            return (
              <li 
                key={item.id} 
                className={`flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5 ${!isActive ? "opacity-60 grayscale-[50%]" : ""}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isActive ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-500 line-through"}`}>
                      {item.name}
                    </span>
                    {!isActive && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-400">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {item.category && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Categoría: {item.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  <button 
                    onClick={() => onEdit(type, item)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onToggleStatus(type, item)}
                    className={`rounded-md p-1.5 transition-colors ${
                      isActive 
                        ? "text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400" 
                        : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                    }`}
                    title={isActive ? "Desactivar" : "Activar"}
                  >
                    {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();
  const {
    areas, addArea, updateArea, toggleAreaStatus,
    motivos, addMotivo, updateMotivo, toggleMotivoStatus
  } = useSettings();

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formType, setFormType] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  const handleAdd = (type) => {
    setFormType(type);
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (type, item) => {
    setFormType(type);
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = (type, item) => {
    const isActivating = item.estado === "Inactivo";
    
    setConfirmConfig({
      title: `${isActivating ? "Activar" : "Desactivar"} ${type}`,
      message: isActivating 
        ? `¿Estás seguro que deseas reactivar "${item.name}"? Volverá a estar disponible en el sistema.`
        : `¿Estás seguro que deseas desactivar "${item.name}"? Dejará de estar disponible como opción en el sistema, pero se mantendrá para el historial.`,
      confirmText: isActivating ? "Activar" : "Desactivar",
      isDanger: !isActivating,
      onConfirm: () => {
        if (type === "Área") toggleAreaStatus(item.id);
        else if (type === "Motivo") toggleMotivoStatus(item.id);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleSaveForm = (name) => {
    if (formType === "Área") {
      itemToEdit ? updateArea(itemToEdit.id, name) : addArea(name);
    } else if (formType === "Motivo") {
      itemToEdit ? updateMotivo(itemToEdit.id, name) : addMotivo(name);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-8 sm:px-6 lg:px-8 h-full">
      <div className="mb-6 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Configuración del Sistema
          </h1>
          <p className="truncate mt-1 text-sm text-slate-500 dark:text-slate-400">
          Administra las áreas y motivos disponibles en el sistema.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="grid flex-1 gap-6 md:grid-cols-2">
        <SettingList 
          title="Áreas" 
          description="Aulas, oficinas o sectores de la escuela."
          items={areas}
          type="Área"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
        
        <SettingList 
          title="Motivos" 
          description="Motivos o categorías de los problemas."
          items={motivos}
          type="Motivo"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <SettingFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        type={formType}
        initialData={itemToEdit}
        onSave={handleSaveForm}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        {...confirmConfig}
      />
    </div>
  );
}
