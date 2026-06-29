import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase, supabaseSecondary } from "../lib/supabase.js";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('fecharegistro', { ascending: false }); // Supabase guarda columnas en minúsculas
      
    console.log("[DEBUG fetchUsers] Data:", data);
    console.log("[DEBUG fetchUsers] Error:", error);

    if (!error && data) {
      setUsers(data);
    } else {
      console.error("[DEBUG fetchUsers] Falló la carga:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addUser = useCallback(async (userData) => {
    const userRol = userData.rol || "Usuario";
    const roleEnum = userRol === "Admin" ? "admin" : userRol === "Técnico" ? "tecnico" : "usuario";

    // Verificamos unicidad de forma manual rápida (opcional, la BD también lo hará)
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', userData.email.trim()).single();
    if (existingUser) throw new Error("El email ya está en uso por otro usuario.");

    // Usamos el cliente secundario para no desloguear al admin actual
    const { data, error } = await supabaseSecondary.auth.signUp({
      email: userData.email.trim(),
      password: userData.password,
      options: {
        data: {
          nombre: userData.nombre.trim(),
          apellido: userData.apellido.trim(),
          telefono: userData.telefono?.trim(),
          role: roleEnum,
          rol: userRol
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered")) {
         throw new Error("El email ya está en uso por otro usuario.");
      }
      throw new Error(error.message);
    }
    
    // Si queremos actualizar el legajo/area u otro campo que no va en raw_meta_data, 
    // lo hacemos con un update a la tabla users después de que el trigger la haya creado.
    if (userData.legajo || userData.area || userData.estado) {
      // Pequeña espera para que el trigger on_auth_user_created haya insertado la fila
      await new Promise(resolve => setTimeout(resolve, 800));
      await supabase.from('users').update({
        legajo: userData.legajo,
        area: userData.area,
        estado: userData.estado || 'Activo'
      }).eq('id', data.user.id);
    }
    
    await fetchUsers();
  }, []);

  const updateUser = useCallback(async (id, userData) => {
    // Validaciones de negocio similares
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

    const newRol = userData.rol;
    const newRole = newRol ? (newRol === "Admin" ? "admin" : newRol === "Técnico" ? "tecnico" : "usuario") : undefined;

    const { error } = await supabase.from('users').update({
      ...userData,
      ...(newRole ? { role: newRole, rol: newRol } : {})
    }).eq('id', id);

    if (error) throw new Error(error.message);
    fetchUsers();
  }, [users]);

  const updateUserProfile = useCallback(async (id, { email, telefono, password }) => {
    // Para actualizar el email/password propio en Supabase Auth
    const authUpdates = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw new Error(authError.message);
    }

    // Actualizar datos públicos
    const { error: dbError } = await supabase.from('users').update({ telefono }).eq('id', id);
    if (dbError) throw new Error(dbError.message);
    
    fetchUsers();
  }, []);

  const toggleUserStatus = useCallback(async (id) => {
    const userToUpdate = users.find((u) => u.id === id);
    if (!userToUpdate) return;

    if (userToUpdate.role === "admin" && userToUpdate.estado === "Activo") {
      const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
      if (otherActiveAdmins.length === 0) {
        throw new Error("No se puede desactivar al único administrador activo del sistema.");
      }
    }

    const newEstado = userToUpdate.estado === "Activo" ? "Inactivo" : "Activo";
    const { error } = await supabase.from('users').update({ estado: newEstado }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchUsers();
  }, [users]);

  const resetUserPassword = useCallback(async (id, email) => {
    // Usamos Supabase native reset password flow
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    if (error) throw new Error(error.message);
    
    // Solo como indicador visual en la UI
    return "Revise su correo electrónico";
  }, []);

  const completePasswordChange = useCallback(async (id, newPassword) => {
    // Ya manejado internamente por AuthContext en la nueva arquitectura
  }, []);

  const deleteUser = useCallback(async (id) => {
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.role === "admin" && userToDelete.estado === "Activo") {
      const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
      if (otherActiveAdmins.length === 0) {
        throw new Error("No se puede eliminar al único administrador activo del sistema.");
      }
    }

    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString(), estado: "Inactivo" })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }, [users]);

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
        deleteUser,
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsers debe ser usado dentro de un UserProvider");
  return ctx;
}
