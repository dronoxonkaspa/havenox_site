import { createClient } from "@supabase/supabase-js";

// These values are read from your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
