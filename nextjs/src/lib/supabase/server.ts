// =============================================================================
// SUPABASE SERVER CLIENT
// =============================================================================
// Server-side Supabase client for API routes and Server Components
// Uses service role for admin operations (be careful!)

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

/**
 * Create Supabase server client with cookie handling
 * Use this in Server Components and API routes
 * 
 * @example
 * import { createClient } from '@/lib/supabase/server';
 * 
 * const supabase = createClient();
 * const { data } = await supabase.from('listings').select('*');
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Called from Server Component
          }
        },
      },
    }
  );
}

/**
 * Create admin client with service role (bypasses RLS)
 * ONLY use this in trusted server-side code
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
