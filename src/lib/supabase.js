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
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheHNuemt0dnh5c2JsZ2t4eWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc5MDMwMCwiZXhwIjoyMDk2MzY2MzAwfQ.IpcI-C7PHe56s96Z57z6D3qS3Unp6m9vqCf0CtMWdPE';
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
