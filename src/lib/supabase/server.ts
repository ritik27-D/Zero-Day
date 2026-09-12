import { createClient } from "@supabase/supabase-js";

function config() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export function isSupabaseConfigured() { return config() !== null; }

export function createSupabaseServerClient() {
  const value = config();
  if (!value) throw new Error("Supabase environment variables are not configured.");
  return createClient(value.url, value.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured for admin access.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
