import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

const initialSectors = [
  { id: 1, name: "Producción", estado: "Activo" },
  { id: 2, name: "Compras", estado: "Activo" },
  { id: 3, name: "Ventas", estado: "Activo" },
  { id: 4, name: "Calidad", estado: "Activo" },
  { id: 5, name: "Logística", estado: "Activo" },
  { id: 6, name: "Administración", estado: "Activo" },
  { id: 7, name: "Recursos Humanos", estado: "Activo" },
  { id: 8, name: "Sistemas e Infraestructura", estado: "Activo" },
  { id: 9, name: "Mantenimiento", estado: "Activo" },
];

const initialCategories = [
  { id: 1, name: "Infraestructura", estado: "Activo" },
  { id: 2, name: "Periféricos", estado: "Activo" },
  { id: 3, name: "PC / Monitor", estado: "Activo" },
  { id: 4, name: "Eléctrico", estado: "Activo" },
  { id: 5, name: "Mecánico", estado: "Activo" },
  { id: 6, name: "Climatización", estado: "Activo" },
  { id: 7, name: "Sanitario", estado: "Activo" },
  { id: 8, name: "Equipo", estado: "Activo" },
  { id: 9, name: "Mobiliario", estado: "Activo" },
  { id: 10, name: "Herramientas", estado: "Activo" },
  { id: 11, name: "Iluminación", estado: "Activo" },
  { id: 12, name: "Seguridad", estado: "Activo" },
  { id: 13, name: "Otro", estado: "Activo" }
];

const initialSubcategories = [
  { id: 1, name: "Mouse", category: "Periféricos", estado: "Activo" },
  { id: 2, name: "Teclado", category: "Periféricos", estado: "Activo" },
  { id: 3, name: "Monitor", category: "PC / Monitor", estado: "Activo" },
  { id: 4, name: "Portón", category: "Infraestructura", estado: "Activo" },
  { id: 5, name: "Toma corriente", category: "Eléctrico", estado: "Activo" },
  { id: 6, name: "Cinta transportadora", category: "Mecánico", estado: "Activo" },
  { id: 7, name: "Aire Acondicionado", category: "Climatización", estado: "Activo" }
];

const SETTINGS_KEY = "maintenance-settings";

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function SettingsProvider({ children }) {
  const stored = loadSettings();
  const [sectors, setSectors] = useState(stored?.sectors ?? initialSectors);
  const [categories, setCategories] = useState(stored?.categories ?? initialCategories);
  const [subcategories, setSubcategories] = useState(stored?.subcategories ?? initialSubcategories);

  // Persiste automáticamente cualquier cambio en localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sectors, categories, subcategories }));
  }, [sectors, categories, subcategories]);

  // --- Sectors CRUD ---
  const addSector = (name) => {
    if (sectors.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("El sector ya existe.");
    }
    const newSector = { id: Date.now(), name, estado: "Activo" };
    setSectors([...sectors, newSector]);
  };

  const updateSector = (id, name) => {
    if (sectors.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== id)) {
      throw new Error("El sector ya existe.");
    }
    setSectors(sectors.map(s => s.id === id ? { ...s, name } : s));
  };

  const toggleSectorStatus = (id) => {
    setSectors(sectors.map(s => s.id === id ? { ...s, estado: s.estado === "Activo" ? "Inactivo" : "Activo" } : s));
  };

  // --- Categories CRUD ---
  const addCategory = (name) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("La categoría ya existe.");
    }
    const newCategory = { id: Date.now(), name, estado: "Activo" };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id, name) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== id)) {
      throw new Error("La categoría ya existe.");
    }
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
    
    // Si actualizamos el nombre de una categoría, también actualizamos el string de referencia en las subcategorías.
    // (En una BD real usaríamos el category_id como FK, pero acá guardamos el string).
    const categoryNameBefore = categories.find(c => c.id === id)?.name;
    if (categoryNameBefore && categoryNameBefore !== name) {
      setSubcategories(prev => prev.map(sub => 
        sub.category === categoryNameBefore ? { ...sub, category: name } : sub
      ));
    }
  };

  const toggleCategoryStatus = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, estado: c.estado === "Activo" ? "Inactivo" : "Activo" } : c));
  };

  // --- Subcategories CRUD ---
  const addSubcategory = (name, categoryName) => {
    if (subcategories.find(s => s.name.toLowerCase() === name.toLowerCase() && s.category === categoryName)) {
      throw new Error("La subcategoría ya existe en esta categoría.");
    }
    const newSubcat = { id: Date.now(), name, category: categoryName, estado: "Activo" };
    setSubcategories([...subcategories, newSubcat]);
  };

  const updateSubcategory = (id, name, categoryName) => {
    if (subcategories.find(s => s.name.toLowerCase() === name.toLowerCase() && s.category === categoryName && s.id !== id)) {
      throw new Error("La subcategoría ya existe en esta categoría.");
    }
    setSubcategories(subcategories.map(s => s.id === id ? { ...s, name, category: categoryName } : s));
  };

  const toggleSubcategoryStatus = (id) => {
    setSubcategories(subcategories.map(s => s.id === id ? { ...s, estado: s.estado === "Activo" ? "Inactivo" : "Activo" } : s));
  };

  return (
    <SettingsContext.Provider
      value={{
        sectors, addSector, updateSector, toggleSectorStatus,
        categories, addCategory, updateCategory, toggleCategoryStatus,
        subcategories, addSubcategory, updateSubcategory, toggleSubcategoryStatus
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe ser usado dentro de un SettingsProvider");
  }
  return context;
}
