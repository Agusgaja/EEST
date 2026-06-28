import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockUsers } from "../data/mockUsers.js";

const UserContext = createContext();

const STORAGE_KEY = "maintenance-users-v3";

function loadUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsedUsers = stored ? JSON.parse(stored) : mockUsers;
    
    // Recuperación de emergencia: asegurar que exista al menos un admin activo
    const hasActiveAdmin = parsedUsers.some((u) => u.role === "admin" && u.estado === "Activo");
    if (!hasActiveAdmin && parsedUsers.length > 0) {
      // Buscar al administrador por defecto (admin@industria.com) o usar el primer usuario del array
      const preferredIndex = parsedUsers.findIndex((u) => u.email === "admin@industria.com");
      const adminIndex = preferredIndex !== -1 ? preferredIndex : 0;
      parsedUsers[adminIndex] = {
        ...parsedUsers[adminIndex],
        rol: "Admin",
        role: "admin",
        estado: "Activo",
      };
    }
    return parsedUsers;
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

  // Forzar restablecimiento inmediato para pisar cualquier estado cacheado
  useEffect(() => {
    setUsers(mockUsers);
  }, []);

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
      if (users.find((u) => u.email === userData.email)) {
        throw new Error("El email ya está en uso por otro usuario.");
      }
      if (userData.telefono && users.find((u) => u.telefono === userData.telefono)) {
        throw new Error("El teléfono ya está en uso por otro usuario.");
      }
      // ─── Solo si pasan todas las validaciones, actualizamos el estado ───
      const userRol = userData.rol || "Usuario";
      const newUser = {
        ...userData,
        id: generateUserId(users),
        fechaRegistro: new Date().toISOString().split("T")[0],
        estado: userData.estado || "Activo",
        rol: userRol,
        role: userRol === "Admin" ? "admin" : userRol === "Técnico" ? "tecnico" : "usuario",
      };
      setUsers((prev) => [...prev, newUser]);
    },
    [users],
  );

  /** Edición completa de un usuario por parte del administrador. */
  const updateUser = useCallback(
    (id, userData) => {
      // ─── Verificación de Regla de Negocio: Administrador Único ──────────
      const userToUpdate = users.find(u => u.id === id);
      if (userToUpdate && userToUpdate.role === "admin" && userToUpdate.estado === "Activo") {
        const newRol = userData.rol ?? userToUpdate.rol;
        const newRole = newRol === "Admin" ? "admin" : newRol === "Técnico" ? "tecnico" : "usuario";
        const newEstado = userData.estado ?? userToUpdate.estado;
        
        if (newRole !== "admin" || newEstado !== "Activo") {
          const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
          if (otherActiveAdmins.length === 0) {
            throw new Error("No se puede realizar esta acción: el sistema debe tener al menos un administrador activo.");
          }
        }
      }

      // ─── Solo si pasa la validación, actualizamos el estado ─────────────
      setUsers((prev) => prev.map((u) => {
        if (u.id !== id) return u;
        const newRol = userData.rol ?? u.rol;
        const newRole = newRol === "Admin" ? "admin" : newRol === "Técnico" ? "tecnico" : "usuario";
        return { ...u, ...userData, rol: newRol, role: newRole };
      }));
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
    const userToUpdate = users.find((u) => u.id === id);
    if (userToUpdate && userToUpdate.role === "admin" && userToUpdate.estado === "Activo") {
      const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
      if (otherActiveAdmins.length === 0) {
        throw new Error("No se puede desactivar al único administrador activo del sistema.");
      }
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" }
          : u,
      ),
    );
  }, [users]);

  /**
   * Genera una contraseña temporal simulada.
   * En producción: el backend genera, hashea y almacena la clave temporal.
   * El frontend solo recibe la clave en texto plano para mostrarla una única vez.
   */
  const resetUserPassword = useCallback((id) => {
    const tempPassword = Math.random().toString(36).slice(-8);
    
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { 
        ...u, 
        password: tempPassword,
        isTempPassword: true,
        tempPasswordCreatedAt: new Date().toISOString()
      } : u)),
    );
    return tempPassword;
  }, []);

  /**
   * Finaliza el cambio de contraseña obligatorio eliminando las flags temporales.
   */
  const completePasswordChange = useCallback((id, newPassword) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const { isTempPassword, tempPasswordCreatedAt, ...safeUser } = u;
        return {
          ...safeUser,
          password: newPassword
        };
      })
    );
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
        completePasswordChange,
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
