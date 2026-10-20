import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Faux si le fichier .env.local est absent ou incomplet. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// Seule la clé publique (anon) est utilisée ici. La clé service_role ne doit jamais apparaître dans le code.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing', {
  auth: { persistSession: true, autoRefreshToken: true },
})
