import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User Supabase credentials with fallback to direct config
const DEFAULT_SUPABASE_URL = 'https://zuqukykninqoskfetlaq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cXVreWtuaW5xb3NrZmV0bGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjE2NjAsImV4cCI6MjEwNDE5NzY2MH0.7KodYMszDzfjoCSwx5qnHwX9E72j8pwejyMJ3SZ0DLs';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.includes('supabase.co')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;
