// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// For server-side operations (admin operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful!", data);
    return true;
  } catch (err) {
    console.error("❌ Supabase unexpected error:", err);
    return false;
  }
}
