import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

type ScheduleInput = { performance_date?: string; start_time?: string };
type PriceInput = { seat_grade?: string; price?: number | string; price_note?: string };

function normalizeSchedules(value: unknown) {
  if (!Array.isArray(value)) return [];
  return (value as ScheduleInput[])
    .slice(0, 100)
    .map((row, index) => ({
      performance_date: String(row?.performance_date || "").trim(),
      start_time: String(row?.start_time || "").trim(),
      sort_order: index,
    }))
    .filter((row) => row.performance_date && row.start_time);
}

function normalizePrices(value: unknown) {
  if (!Array.isArray(value)) return [];
  return (value as PriceInput[])
    .slice(0, 50)
    .map((row, index) => {
      const num = Number(String(row?.price ?? "").replaceAll(",", ""));
      return {
        seat_grade: String(row?.seat_grade || "").trim(),
        price: Number.isFinite(num) && num >= 0 ? Math.round(num) : null,
        price_note: String(row?.price_note || "").trim(),
        sort_order: index,
      };
    })
    .filter((row) => row.seat_grade && row.price !== null);
}

function formatShowTime(schedules: ReturnType<typeof normalizeSchedules>) {
  return schedules.map((s) => `${s.performance_date.replaceAll("-", ".")} ${s.start_time.slice(0, 5)}`).join(" / ");
}

function formatPriceLabel(prices: ReturnType<typeof normalizePrices>) {
  return prices.map((p) => `${p.seat_grade} ${Number(p.price).toLocaleString("ko-KR")}원${p.price_note ? ` (${p.price_note})` : ""}`).join(" / ");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of [
    "title","genre","venue","region","period","booking_url","poster_url","agency_name","agency_contact","agency_email",
    "status","age_label","synopsis","cast_info","crew","producer","running_time","is_featured","poster_rights_confirmed"
  ]) {
    if (key in body) patch[key] = body[key];
  }

  if ("schedules" in body) {
    const schedules = normalizeSchedules(body.schedules);
    patch.show_time = formatShowTime(schedules);
  } else if ("show_time" in body) {
    patch.show_time = body.show_time;
  }

  if ("ticket_prices" in body) {
    const prices = normalizePrices(body.ticket_prices);
    patch.price_label = formatPriceLabel(prices);
  } else if ("price_label" in body) {
    patch.price_label = body.price_label;
  }

  const { data, error } = await admin.from("manual_shows").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if ("schedules" in body) {
    const schedules = normalizeSchedules(body.schedules);
    const { error: deleteError } = await admin.from("show_schedules").delete().eq("show_id", id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    if (schedules.length) {
      const { error: insertError } = await admin.from("show_schedules").insert(schedules.map((s) => ({ ...s, show_id: id })));
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  if ("ticket_prices" in body) {
    const prices = normalizePrices(body.ticket_prices);
    const { error: deleteError } = await admin.from("show_ticket_prices").delete().eq("show_id", id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    if (prices.length) {
      const { error: insertError } = await admin.from("show_ticket_prices").insert(prices.map((p) => ({ ...p, show_id: id })));
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ show: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { id } = await params;
  const { error } = await admin.from("manual_shows").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
