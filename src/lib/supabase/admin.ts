import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 절대 "use client" 파일이나 클라이언트 컴포넌트에서 import하지 말 것.
// SUPABASE_SERVICE_ROLE_KEY는 NEXT_PUBLIC_이 아니므로 브라우저 번들에는 포함되지 않지만,
// 실수로 클라이언트 코드에서 import하면 빌드 시 undefined가 되어 에러가 나므로 안전장치는 있다.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
