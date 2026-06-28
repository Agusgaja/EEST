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
