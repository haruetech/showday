import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "이미지 업로드 시스템이 아직 설정되지 않았습니다." }, { status: 500 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "이미지 파일을 선택해주세요." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "이미지 용량은 5MB 이하여야 합니다." }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `public-register/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("posters").upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "포스터 업로드에 실패했습니다." }, { status: 500 });

  const { data } = admin.storage.from("posters").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
