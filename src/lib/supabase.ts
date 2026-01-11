
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client only if the keys are available
// Otherwise, we'll handle the missing keys gracefully in the UI
if (import.meta.env.DEV) {
  console.log("Supabase URL:", supabaseUrl?.substring(0, 20) + "...");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';
};
