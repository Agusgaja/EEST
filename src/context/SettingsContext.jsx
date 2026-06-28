import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

const initialAreas = [
  { id: 1, name: "AULA 1", estado: "Activo" },
  { id: 2, name: "AULA 2", estado: "Activo" },
  { id: 3, name: "AULA 3", estado: "Activo" },
  { id: 4, name: "AULA 4", estado: "Activo" },
  { id: 5, name: "DIRECCION", estado: "Activo" },
  { id: 6, name: "VICEDIRECCION", estado: "Activo" },
  { id: 7, name: "PRECEPTORIA", estado: "Activo" }
];

const initialMotivos = [
  { id: 1, name: "PROGRAMAS O APLICACIONES", estado: "Activo" },
  { id: 2, name: "RED", estado: "Activo" },
  { id: 3, name: "CPU", estado: "Activo" },
  { id: 4, name: "MONITOR", estado: "Activo" },
  { id: 5, name: "IMPRESORAS", estado: "Activo" },
  { id: 6, name: "CORREO ELECTRONICO", estado: "Activo" },
  { id: 7, name: "MOUSE O TECLADO", estado: "Activo" },
  { id: 8, name: "TONER", estado: "Activo" },
  { id: 9, name: "USUARIOS Y CLAVES DEL SISTEMA", estado: "Activo" }
];

const SETTINGS_KEY = "maintenance-settings-v2";

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
  const [areas, setAreas] = useState(stored?.areas ?? initialAreas);
  const [motivos, setMotivos] = useState(stored?.motivos ?? initialMotivos);

  // Persiste automáticamente cualquier cambio en localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ areas, motivos }));
  }, [areas, motivos]);

  // --- Areas CRUD ---
  const addArea = (name) => {
    if (areas.find(a => a.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("El área ya existe.");
    }
    const newArea = { id: Date.now(), name, estado: "Activo" };
    setAreas([...areas, newArea]);
  };

  const updateArea = (id, name) => {
    if (areas.find(a => a.name.toLowerCase() === name.toLowerCase() && a.id !== id)) {
      throw new Error("El área ya existe.");
    }
    setAreas(areas.map(a => a.id === id ? { ...a, name } : a));
  };

  const toggleAreaStatus = (id) => {
    setAreas(areas.map(a => a.id === id ? { ...a, estado: a.estado === "Activo" ? "Inactivo" : "Activo" } : a));
  };

  // --- Motivos CRUD ---
  const addMotivo = (name) => {
    if (motivos.find(m => m.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("El motivo ya existe.");
    }
    const newMotivo = { id: Date.now(), name, estado: "Activo" };
    setMotivos([...motivos, newMotivo]);
  };

  const updateMotivo = (id, name) => {
    if (motivos.find(m => m.name.toLowerCase() === name.toLowerCase() && m.id !== id)) {
      throw new Error("El motivo ya existe.");
    }
    setMotivos(motivos.map(m => m.id === id ? { ...m, name } : m));
  };

  const toggleMotivoStatus = (id) => {
    setMotivos(motivos.map(m => m.id === id ? { ...m, estado: m.estado === "Activo" ? "Inactivo" : "Activo" } : m));
  };

  return (
    <SettingsContext.Provider
      value={{
        areas, addArea, updateArea, toggleAreaStatus,
        motivos, addMotivo, updateMotivo, toggleMotivoStatus
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
