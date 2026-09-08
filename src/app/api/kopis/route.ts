import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceList, fetchPerformanceDetail } from "@/lib/kopis";
import { popularShows, todayShows } from "@/lib/dummy-data";

// GET /api/kopis?type=today|upcoming&region=<KOPIS 지역코드>
// Vercel Secret: KOPIS_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "upcoming";
  const id = searchParams.get("id") ?? undefined;
  if (type === "detail" && id) {
    const detail = await fetchPerformanceDetail(id);
    return NextResponse.json({ source: detail ? "kopis" : "none", detail });
  }
  const region = searchParams.get("region") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const rows = Number(searchParams.get("rows") ?? "40");
  const range = searchParams.get("range") ?? (type === "today" ? "today" : "30d");

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (range === "today") {
    // 오늘 하루
  } else if (range === "week") {
    const day = now.getDay(); // 0=일
    const daysToSunday = day === 0 ? 0 : 7 - day;
    end.setDate(now.getDate() + daysToSunday);
  } else if (range === "weekend") {
    const day = now.getDay();
    const daysToSaturday = (6 - day + 7) % 7;
    start.setDate(now.getDate() + daysToSaturday);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 1);
  } else {
    end.setDate(end.getDate() + 30); // KOPIS 공연목록 조회 최대 31일 범위
  }

  const stdate = toKopisDate(start);
  const eddate = toKopisDate(end);

  try {
    const list = await fetchPerformanceList({
      stdate,
      eddate,
      signgucode: region,
      shprfnm: q,
      rows: type === "today" ? 30 : Math.min(Math.max(rows, 1), 100),
    });
    const fallback = type === "today" ? todayShows : popularShows;
    return NextResponse.json(
      { source: list.length ? "kopis" : "dummy", shows: list.length ? list : fallback },
      { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    console.error("KOPIS fetch failed, falling back to dummy data:", err);
    return NextResponse.json({ source: "dummy", shows: type === "today" ? todayShows : popularShows });
  }
}

function toKopisDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
