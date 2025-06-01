import { SUPABASE_PROJECT_URL, SUPABASE_SECRET } from '@/config/common';
import { createClient } from '@supabase/supabase-js';

if (!SUPABASE_PROJECT_URL || !SUPABASE_SECRET) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_SECRET);
