import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

// Client dengan SUPABASE_SECRET_KEY untuk membaca data produk di server (pengunjung / publik)
export const supabaseServer = createClient(
  supabaseUrl || "",
  supabaseSecretKey || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client sesi admin dengan SUPABASE_PUBLISHABLE_KEY dan cookies (@supabase/ssr)
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl || "",
    supabasePublishableKey || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component atau konteks yang tidak mengizinkan modifikasi cookies
          }
        },
      },
    }
  );
}

