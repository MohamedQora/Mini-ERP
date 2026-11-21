export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// استخدم مفتاح Supabase القابل للنشر، مع الإبقاء على مفتاح anon القديم كخيار احتياطي.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
