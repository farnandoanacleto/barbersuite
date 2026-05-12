import { createClient } from '@supabase/supabase-js';

// ─── Configuração Supabase ────────────────────────────────────
// Projeto: BarberFlow
// URL: https://zfcflcetvrbfoklnkxhj.supabase.co

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: true,
  },
});

// ─── Tipos helpers ────────────────────────────────────────────
export type SupabaseClient = typeof supabase;
