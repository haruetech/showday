import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { data, error } = await admin.from("manual_shows").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shows: data });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.venue || !body?.period || !body?.agency_name) {
    return NextResponse.json({ error: "필수 항목이 비어 있습니다. (제목/장소/기간/기획사명)" }, { status: 400 });
  }

  const { data, error } = await admin.from("manual_shows").insert({
    title: body.title,
    genre: body.genre || "기타",
    venue: body.venue,
    region: body.region || "",
    period: body.period,
    price_label: body.price_label || "",
    booking_url: body.booking_url || "",
    poster_url: body.poster_url || "",
    agency_name: body.agency_name,
    agency_contact: body.agency_contact || "",
    status: body.status || "검토중",
    show_time: body.show_time || "",
    age_label: body.age_label || "",
    synopsis: body.synopsis || "",
    cast_info: body.cast_info || "",
    crew: body.crew || "",
    producer: body.producer || "",
    running_time: body.running_time || "",
    is_featured: Boolean(body.is_featured),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ show: data });
}
