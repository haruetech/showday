import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "showday_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

/**
 * 세션 토큰 형식: "<발급시각(ms)>.<서명>"
 * 서명 = HMAC-SHA256(key=ADMIN_PASSWORD, message=발급시각)
 * 쿠키에 비밀번호 원문 대신 서명된 토큰만 저장해, 쿠키가 노출되더라도
 * 실제 관리자 비밀번호 자체가 유출되지 않도록 한다. (발급시각을 함께 검증해
 * 서버 쪽에서도 만료를 강제할 수 있음)
 */
function sign(issuedAt: string, secret: string) {
  return createHmac("sha256", secret).update(issuedAt).digest("hex");
}

export function createAdminSessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export async function isAdminAuthed(): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) return false;

  const expected = sign(issuedAt, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
