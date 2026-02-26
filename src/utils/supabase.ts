import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, logger } from '@/config/environment';

const { supabaseUrl, supabaseAnonKey } = env;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are missing. Check your .env files.');
}

logger.debug('Supabase initialized:', { url: supabaseUrl });

// Using generic client to avoid strict type errors until proper types are generated
// TODO: Generate proper types with `supabase gen types typescript`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseAnonKey);