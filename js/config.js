export const DEV_MODE = true;

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || "YOUR_PROJECT_URL";
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "YOUR_ANON_KEY";