import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!error && data) {
      setUser(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Obtener sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const email = identifier.trim().toLowerCase();
    
    // Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: "Credenciales inválidas" };
    }

    // Cargar el perfil desde la tabla users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { success: false, error: "Error al cargar el perfil del usuario" };
    }

    if (profile.estado === "Inactivo") {
      await supabase.auth.signOut();
      return { success: false, error: "Esta cuenta está desactivada. Contacte al administrador." };
    }

    if (profile.isTempPassword) {
      const createdAt = new Date(profile.tempPasswordCreatedAt).getTime();
      const now = Date.now();
      const hoursPassed = (now - createdAt) / (1000 * 60 * 60);

      if (hoursPassed > 24) {
        await supabase.auth.signOut();
        return { success: false, error: "La contraseña temporal ha expirado. Solicite una nueva al administrador." };
      }
      
      return { success: true, requirePasswordChange: true, tempUserId: data.user.id };
    }

    setUser(profile);
    return { success: true, user: profile };
  }, []);

  const completeTempLogin = useCallback(async (tempUserId, newPassword) => {
    // 1. Actualizar contraseña en Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (authError) return null;

    // 2. Limpiar flags temporales en la tabla users
    const { data: updatedProfile, error: dbError } = await supabase
      .from('users')
      .update({ isTempPassword: false, tempPasswordCreatedAt: null })
      .eq('id', tempUserId)
      .select()
      .single();

    if (dbError || !updatedProfile) return null;

    setUser(updatedProfile);
    return updatedProfile;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateSession = useCallback((fields) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSession, completeTempLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
