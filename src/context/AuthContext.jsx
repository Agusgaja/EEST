import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUsers } from "./UserContext.jsx";

const AuthContext = createContext(null);

const SESSION_KEY = "maintenance-session";

export function AuthProvider({ children }) {
  // AuthContext ya no gestiona su propia lista de usuarios.
  // Delega en UserContext, que es la única fuente de verdad.
  const { users } = useUsers();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sincroniza la sesión con localStorage cada vez que cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  /**
   * Sincronización automática: cuando los datos del usuario autenticado cambian
   * en UserContext (por edición de perfil, cambio de rol, etc.), la sesión se
   * actualiza automáticamente sin requerir una llamada explícita a updateSession.
   * Esto elimina el contrato implícito que existía antes.
   */
  useEffect(() => {
    if (!user) return;
    const freshUser = users.find((u) => u.id === user.id);
    if (!freshUser) return;
    const { password: _, ...safeUser } = freshUser;
    // Solo actualiza si hay un cambio real (comparación superficial por string)
    if (JSON.stringify(safeUser) !== JSON.stringify(user)) {
      setUser(safeUser);
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Autentica al usuario buscando en la lista de UserContext.
   * Valida credenciales y que la cuenta esté activa.
   */
  const login = useCallback(
    (identifier, password) => {
      const found = users.find(
        (u) =>
          (u.legajo === identifier || u.email === identifier) &&
          u.password === password,
      );

      if (!found) return { success: false, error: "Credenciales inválidas" };
      if (found.estado === "Inactivo") {
        return { success: false, error: "Esta cuenta está desactivada. Contacte al administrador." };
      }

      // Nunca guardamos la contraseña en la sesión
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      return { success: true, user: safeUser };
    },
    [users],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * @deprecated Mantenida por compatibilidad con componentes existentes.
   * La sincronización ahora es automática vía useEffect cuando cambia UserContext.
   * Puede eliminarse en la próxima limpieza de API.
   */
  const updateSession = useCallback((fields) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
