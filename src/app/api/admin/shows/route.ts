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

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("manual_shows")
    .select("*, show_schedules(*), show_ticket_prices(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const shows = (data || []).map((show: any) => ({
    ...show,
    show_schedules: [...(show.show_schedules || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    show_ticket_prices: [...(show.show_ticket_prices || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  return NextResponse.json({ shows });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.venue || !body?.period || !body?.agency_name) {
    return NextResponse.json({ error: "필수 항목이 비어 있습니다. (제목/장소/기간/기획사명)" }, { status: 400 });
  }

  const schedules = normalizeSchedules(body.schedules);
  const ticketPrices = normalizePrices(body.ticket_prices);

  const { data, error } = await admin
    .from("manual_shows")
    .insert({
      title: body.title,
      genre: body.genre || "기타",
      venue: body.venue,
      region: body.region || "",
      period: body.period,
      price_label: formatPriceLabel(ticketPrices) || body.price_label || "",
      booking_url: body.booking_url || "",
      poster_url: body.poster_url || "",
      agency_name: body.agency_name,
      agency_contact: body.agency_contact || "",
      agency_email: body.agency_email || "",
      submission_source: body.submission_source || "admin",
      status: body.status || "게시중",
      show_time: formatShowTime(schedules) || body.show_time || "",
      age_label: body.age_label || "",
      synopsis: body.synopsis || "",
      cast_info: body.cast_info || "",
      crew: body.crew || "",
      producer: body.producer || "",
      running_time: body.running_time || "",
      is_featured: Boolean(body.is_featured),
      poster_rights_confirmed: Boolean(body.poster_rights_confirmed),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (schedules.length) {
    const { error: scheduleError } = await admin.from("show_schedules").insert(
      schedules.map((s) => ({ ...s, show_id: data.id }))
    );
    if (scheduleError) {
      await admin.from("manual_shows").delete().eq("id", data.id);
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }
  }

  if (ticketPrices.length) {
    const { error: priceError } = await admin.from("show_ticket_prices").insert(
      ticketPrices.map((p) => ({ ...p, show_id: data.id }))
    );
    if (priceError) {
      await admin.from("manual_shows").delete().eq("id", data.id);
      return NextResponse.json({ error: priceError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ show: { ...data, show_schedules: schedules, show_ticket_prices: ticketPrices } });
}
