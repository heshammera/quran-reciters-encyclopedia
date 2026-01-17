import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client with automatic session management
// The proxy.ts file handles server-side session refresh
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
