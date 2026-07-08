import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseUrl =
  rawUrl && rawUrl.trim() !== ""
    ? rawUrl
    : "https://abcdefghijklmnopqrst.supabase.co";
const supabaseAnonKey =
  rawKey && rawKey.trim() !== ""
    ? rawKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholderKey";
const supabaseServiceKey =
  rawServiceKey && rawServiceKey.trim() !== ""
    ? rawServiceKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholderServiceKey";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
