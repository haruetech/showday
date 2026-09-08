import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceList } from "@/lib/kopis";
import { popularShows, todayShows } from "@/lib/dummy-data";

// GET /api/kopis?type=today|upcoming&region=<KOPIS 지역코드>
// Vercel Secret: KOPIS_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "upcoming";
  const region = searchParams.get("region") ?? undefined;

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (type === "today") {
    // 오늘 날짜에 상연기간이 걸쳐 있는 공연을 조회
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
      rows: type === "today" ? 30 : 50,
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
