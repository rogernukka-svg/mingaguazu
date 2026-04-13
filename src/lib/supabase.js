import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación crítica
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env"
  );
}

// Cliente Supabase (FIX LOGIN + SESIÓN)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,          // 🔥 GUARDA sesión
    autoRefreshToken: true,        // 🔥 renueva token automáticamente
    detectSessionInUrl: true,      // 🔥 necesario para login correcto
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Debug solo en desarrollo
if (import.meta.env.DEV) {
  console.log("✅ Supabase conectado:", supabaseUrl);
}

export default supabase;