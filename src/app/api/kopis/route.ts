import { NextRequest, NextResponse } from "next/server";
import { fetchBoxOffice, fetchPerformanceList } from "@/lib/kopis";
import { popularShows, todayShows } from "@/lib/dummy-data";

// GET /api/kopis?type=boxoffice|list&region=서울
// KOPIS_SERVICE_KEY가 .env.local에 없으면 dummy-data로 자동 폴백합니다.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "boxoffice";
  const region = searchParams.get("region") ?? undefined;

  const today = new Date();
  const stdate = toKopisDate(today);
  const eddate = toKopisDate(new Date(today.getTime() + 30 * 86400000));

  try {
    if (type === "list") {
      const list = await fetchPerformanceList({ stdate, eddate, signgucode: region });
      return NextResponse.json({ source: list.length ? "kopis" : "dummy", shows: list.length ? list : todayShows });
    }

    const list = await fetchBoxOffice({ stdate, eddate, area: region });
    return NextResponse.json({ source: list.length ? "kopis" : "dummy", shows: list.length ? list : popularShows });
  } catch (err) {
    console.error("KOPIS fetch failed, falling back to dummy data:", err);
    return NextResponse.json({ source: "dummy", shows: popularShows });
  }
}

function toKopisDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
