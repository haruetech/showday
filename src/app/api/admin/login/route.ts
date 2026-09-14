import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, MAX_AGE_SECONDS, createAdminSessionToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ ok: false, message: "서버에 ADMIN_PASSWORD가 설정되어 있지 않습니다." }, { status: 500 });
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 로컬 개발(http)에서도 테스트할 수 있도록, 배포 환경에서만 Secure 적용
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS, // 7일 — 서버 쪽에서도 토큰에 담긴 발급시각으로 동일하게 만료를 검증함
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
