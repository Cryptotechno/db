import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

// Enable debugging only in development environment
const DEBUG = process.env.NODE_ENV !== 'production';

// Create a singleton Supabase client for client-side rendering
let browserClient: ReturnType<typeof createClient> | null = null;

export const createBrowserClient = () => {
  if (browserClient) return browserClient;
  
  if (DEBUG) console.log('Creating new Supabase browser client');
  
  try {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: 'personal-account-auth-key',
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: DEBUG // Only enable debug in development
        },
        global: {
          fetch: fetch.bind(globalThis)
        }
      }
    );
    return browserClient;
  } catch (error) {
    // Only log error details in development
    if (DEBUG) {
      console.error('Error creating Supabase client:', error);
    } else {
      console.error('Error creating authentication client');
    }
    throw error;
  }
};

// Create a server-side Supabase client with cookie support
export async function createServerSupabaseClient() {
  // Dynamically import cookies to avoid issues with client components
  const { cookies } = await import('next/headers');
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // This is a server component, we only read cookies here
        },
        remove(name, options) {
          // This is a server component, we only read cookies here
        },
      },
    }
  );
} 