import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const initialSectors = [
  { id: 1, name: "Producción" },
  { id: 2, name: "Compras" },
  { id: 3, name: "Ventas" },
  { id: 4, name: "Calidad" },
];

const initialCategories = [
  { id: 1, name: "Infraestructura" },
  { id: 2, name: "Periféricos" },
  { id: 3, name: "PC / Monitor" },
];

const initialSubcategories = [
  { id: 1, name: "Mouse", category: "Periféricos" },
  { id: 2, name: "Teclado", category: "Periféricos" },
  { id: 3, name: "Monitor", category: "PC / Monitor" },
  { id: 4, name: "Portón", category: "Infraestructura" },
];

function SettingList({ title, description, items, onAdd }) {
  return (
    <div className="glass-card flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200/50 p-5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <button 
            onClick={onAdd}
            className="rounded-lg bg-violet-100 p-1.5 text-violet-600 transition-colors hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li 
              key={item.id} 
              className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5"
            >
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                {item.category && (
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                    ({item.category})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                <button 
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [sectors] = useState(initialSectors);
  const [categories] = useState(initialCategories);
  const [subcategories] = useState(initialSubcategories);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-8 sm:px-6 lg:px-8 h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Configuración del Sistema
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra las opciones disponibles en los formularios de tickets.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="grid flex-1 gap-6 md:grid-cols-3">
        <SettingList 
          title="Sectores" 
          description="Áreas operativas de la empresa."
          items={sectors}
          onAdd={() => console.log("Add Sector")}
        />
        
        <SettingList 
          title="Categorías" 
          description="Clasificación principal de tickets."
          items={categories}
          onAdd={() => console.log("Add Category")}
        />
        
        <SettingList 
          title="Subcategorías" 
          description="Tipos específicos de problemas."
          items={subcategories}
          onAdd={() => console.log("Add Subcategory")}
        />
      </div>
    </div>
  );
}
