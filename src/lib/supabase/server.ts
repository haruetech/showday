import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버(라우트 핸들러, 서버 컴포넌트)에서 쓰는 Supabase 클라이언트.
 * OAuth 콜백에서 code ↔ 세션 교환에 사용합니다.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
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
          // 서버 컴포넌트에서 호출된 경우 무시 (미들웨어에서 세션 갱신됨)
        }
      },
    },
  });
}
