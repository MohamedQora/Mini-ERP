import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

/** Browser client. Uses the anon key only; every query is subject to RLS. */
export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
