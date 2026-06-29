import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lktxnkljwrzjdvuppxlp.supabase.co';
const supabaseKey = 'sb_publishable_Hav8HbpQvjzNBiObkR-ndw_cLdkKTUz';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente secundario para realizar operaciones de Auth sin afectar la sesión principal
export const supabaseSecondary = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Cliente Admin (Service Role) - Exclusivo para reestablecer contraseñas desde el frontend (Solo para la demo)
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdHhua2xqd3J6amR2dXBweGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjY3Nzc0NywiZXhwIjoyMDk4MjUzNzQ3fQ.H6Fa9n_p53Vahx-LiAq8Hi0zp-0pPD-4y9MvpRUofAs';
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
