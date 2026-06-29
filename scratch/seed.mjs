import { createClient } from '@supabase/supabase-js';

// Usamos las credenciales públicas de la app
const supabaseUrl = 'https://lktxnkljwrzjdvuppxlp.supabase.co';
const supabaseKey = 'sb_publishable_Hav8HbpQvjzNBiObkR-ndw_cLdkKTUz';

// Importante: persistSession: false para no interferir
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runSeed() {
  console.log("🌱 Iniciando seeder nativo por API...");

  const usersToCreate = [
    { email: 'admin@eestn1.edu.ar', password: 'admin123', nombre: 'Agustin', apellido: 'Admin', role: 'admin', rol: 'Admin', telefono: '+54 11 4444-4444', legajo: 'ADM-001', area: 'Dirección' },
    { email: 'tecnico@eestn1.edu.ar', password: 'tecnico123', nombre: 'Juan', apellido: 'Soporte', role: 'tecnico', rol: 'Técnico', telefono: '+54 11 5555-5555', legajo: 'TEC-015', area: 'Soporte IT' },
    { email: 'docente@eestn1.edu.ar', password: 'docente123', nombre: 'María', apellido: 'Profesora', role: 'usuario', rol: 'Usuario', telefono: '+54 11 6666-6666', legajo: 'DOC-102', area: 'Aulas - Planta Baja' }
  ];

  const createdUsers = {};

  for (const u of usersToCreate) {
    console.log(`Creando usuario: ${u.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          nombre: u.nombre,
          apellido: u.apellido,
          role: u.role,
          rol: u.rol,
          telefono: u.telefono
        }
      }
    });

    if (error) {
      console.error(`❌ Error al crear ${u.email}:`, error.message);
      // Si el usuario ya existe, asumimos que fue creado pero la contraseña no funca. 
      // Te pediremos que lo borres manualmente antes.
    } else if (data.user) {
      console.log(`✅ Creado con ID: ${data.user.id}`);
      createdUsers[u.role] = data.user;
      
      // Actualizamos los campos extendidos en public.users
      await supabase.from('users').update({
        legajo: u.legajo,
        area: u.area
      }).eq('id', data.user.id);
    }
  }

  // Si logramos crear al docente y técnico, les asignamos un ticket
  if (createdUsers['usuario'] && createdUsers['tecnico']) {
    console.log("Generando ticket de prueba...");
    const { error } = await supabase.from('tickets').insert([{
      title: 'Falla en proyector Aula 5 (API Seed)',
      fullDescription: 'El proyector no enciende (Generado por API).',
      motivo: 'Soporte Técnico',
      area: 'Aulas - Planta Baja',
      status: 'asignado',
      priority: 'alta',
      userSnapshot: { name: 'María Profesora' },
      assignedTo: { id: createdUsers['tecnico'].id, name: 'Juan Soporte' },
      observations: [],
      history: [
        { id: `h1`, action: 'Ticket creado', actor: 'María Profesora', createdAt: new Date().toISOString() }
      ]
    }]);
    
    if (error) console.error("❌ Error al crear ticket:", error.message);
    else console.log("✅ Ticket de prueba creado.");
  }

  console.log("🎉 Seed completado.");
}

runSeed();
