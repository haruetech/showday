import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." }, { status: 500 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "이미지 파일이 없습니다." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "이미지 용량은 5MB 이하여야 합니다." }, { status: 400 });

  const ext = file.name.split(".").pop() || "jpg";
  const folderRaw = String(form?.get("folder") || "manual-shows");
  const folder = /^[a-z0-9-]+$/i.test(folderRaw) ? folderRaw : "manual-shows";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage.from("posters").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: publicUrlData } = admin.storage.from("posters").getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
