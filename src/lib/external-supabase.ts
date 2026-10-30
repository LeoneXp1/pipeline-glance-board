import { createClient } from "@supabase/supabase-js";

// User's own project holding the `leads` table. Publishable key is safe in client code.
const URL = "https://afsfltqyzhypsdcydzkq.supabase.co";
const KEY = "sb_publishable_gpjJGz0h5EXq_r3vUCBesg_-F6BBijt";

export const leadsDb = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false, storageKey: "leads-db" },
});
