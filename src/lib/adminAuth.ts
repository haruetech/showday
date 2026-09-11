import { cookies } from "next/headers";

const COOKIE_NAME = "showday_admin";

export async function isAdminAuthed(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expected;
}
