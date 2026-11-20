export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Tanpa kunci Supabase, aplikasi berjalan dalam "mode demo" (data contoh, tidak tersimpan). */
export const isDemoMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;
