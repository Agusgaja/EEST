import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockUsers } from "../data/mockUsers.js";

const UserContext = createContext();

const STORAGE_KEY = "maintenance-users";

function loadUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  } catch {
    return mockUsers;
  }
}

/** Genera un ID en formato U-XXX, compatible con futura migración a UUIDs de backend. */
function generateUserId(users) {
  const maxNum = users.reduce((max, u) => {
    const match = String(u.id).match(/^U-(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 100);
  return `U-${maxNum + 1}`;
}

export function UserProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);

  // Persiste todos los cambios en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  /**
   * REGLA CRÍTICA: Las validaciones de negocio SIEMPRE deben ejecutarse
   * ANTES de llamar a setUsers, usando el estado `users` del closure.
   * Lanzar un Error dentro del callback de setUsers hace que React lo trate
   * como un error irrecuperable del árbol de componentes, colapsando la UI.
   * Al validar antes del setState, el throw es síncrono y capturable con try/catch.
   */

  /** Crea un nuevo usuario. Valida unicidad de legajo, email y teléfono. */
  const addUser = useCallback(
    (userData) => {
      // ─── Validaciones ANTES del setState ────────────────────────────────
      if (users.find((u) => u.legajo === userData.legajo)) {
        throw new Error("El legajo ya está en uso por otro usuario.");
      }
      if (users.find((u) => u.email === userData.email)) {
        throw new Error("El email ya está en uso por otro usuario.");
      }
      if (userData.telefono && users.find((u) => u.telefono === userData.telefono)) {
        throw new Error("El teléfono ya está en uso por otro usuario.");
      }
      // ─── Solo si pasan todas las validaciones, actualizamos el estado ───
      const newUser = {
        ...userData,
        id: generateUserId(users),
        fechaRegistro: new Date().toISOString().split("T")[0],
        estado: userData.estado || "Activo",
        // El rol de display en español se mantiene para la UI del admin
        rol: userData.rol || "Usuario",
        // El role en inglés se usa para el sistema de autenticación y rutas
        role: "usuario", // Siempre "usuario" — los admins son creados manualmente
      };
      setUsers((prev) => [...prev, newUser]);
    },
    [users],
  );

  /** Edición completa de un usuario por parte del administrador. */
  const updateUser = useCallback(
    (id, userData) => {
      // ─── Validación ANTES del setState ──────────────────────────────────
      if (users.find((u) => u.legajo === userData.legajo && u.id !== id)) {
        throw new Error("El legajo ya está en uso por otro usuario.");
      }
      // ─── Solo si pasa la validación, actualizamos el estado ─────────────
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    },
    [users],
  );

  /**
   * Actualización del perfil propio del usuario (email, teléfono, contraseña).
   * Diferenciada de updateUser para que en el futuro tenga sus propias reglas
   * de autorización: un usuario solo puede editar su propio perfil.
   */
  const updateUserProfile = useCallback(
    (id, { email, telefono, password }) => {
      // ─── Validación ANTES del setState ──────────────────────────────────
      if (users.find((u) => u.email === email && u.id !== id)) {
        throw new Error("El email ya está en uso por otro usuario.");
      }
      // ─── Solo si pasa la validación, actualizamos el estado ─────────────
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          return {
            ...u,
            email,
            telefono,
            // Solo actualiza la contraseña si se proporcionó una nueva
            ...(password ? { password } : {}),
          };
        }),
      );
    },
    [users],
  );

  const toggleUserStatus = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" }
          : u,
      ),
    );
  }, []);

  /**
   * Genera una contraseña temporal simulada.
   * En producción: el backend genera, hashea y almacena la clave temporal.
   * El frontend solo recibe la clave en texto plano para mostrarla una única vez.
   */
  const resetUserPassword = useCallback((id) => {
    const tempPassword = Math.random().toString(36).slice(-8);
    // Actualizamos el estado para que el login con la nueva clave funcione en la demo
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: tempPassword } : u)),
    );
    return tempPassword;
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        updateUserProfile,
        toggleUserStatus,
        resetUserPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsers debe ser usado dentro de un UserProvider");
  return ctx;
}
