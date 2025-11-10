import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Crear una única instancia del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Agregar compatibilidad con getSupabase()
export function getSupabase() {
  return supabase;
}
