import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceList, fetchPerformanceDetail, fetchArtistShows, fetchBoxOffice } from "@/lib/kopis";

// GET /api/kopis?type=today|upcoming|artist|search&region=<KOPIS 지역코드>
// Vercel Secret: KOPIS_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "upcoming";
  const id = searchParams.get("id") ?? undefined;
  if (type === "detail" && id) {
    const detail = await fetchPerformanceDetail(id);
    const ended = Boolean(detail && (
      detail.status.includes("완료") || detail.status.includes("종료") || detail.status === "03" ||
      (detail.endDate && /^\d{8}$/.test(detail.endDate) && detail.endDate < toKopisDate(new Date()))
    ));
    return NextResponse.json({ source: detail && !ended ? "kopis" : "none", detail: ended ? null : detail, ended });
  }

  const q = searchParams.get("q") ?? undefined;
  const rows = Number(searchParams.get("rows") ?? "40");

  if (type === "popular") {
    try {
      const end = new Date();
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const list = (await fetchBoxOffice({ stdate: toKopisDate(start), eddate: toKopisDate(end) }))
        .filter(show => !(show.status?.includes("완료") || show.status?.includes("종료")));
      return NextResponse.json(
        { source: list.length ? "kopis-boxoffice" : "none", shows: list.slice(0, Math.min(rows, 30)) },
        { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } }
      );
    } catch (err) {
      console.error("KOPIS boxoffice fetch failed:", err);
      return NextResponse.json({ source: "none", shows: [] });
    }
  }

  // 아티스트/특정 검색어 검색: 이번 주 같은 좁은 기간이 아니라 공연중+예정을
  // 폭넓게(최대 6개월치) 찾는다. 결과가 없으면 무관한 인기공연을 대신 보여주지
  // 않고 정직하게 "없음"으로 응답한다 — 특정 아티스트를 찾는 사람에게 엉뚱한
  // 더미 공연을 보여주면 검색이 그냥 고장난 것처럼 느껴지기 때문.
  if (type === "artist") {
    if (!q?.trim()) return NextResponse.json({ source: "none", shows: [] });
    try {
      const list = await fetchArtistShows(q, Math.min(Math.max(rows, 1), 60));
      return NextResponse.json(
        { source: list.length ? "kopis" : "none", shows: list },
        { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" } }
      );
    } catch (err) {
      console.error("KOPIS artist search failed:", err);
      return NextResponse.json({ source: "none", shows: [] });
    }
  }

  const region = searchParams.get("region") ?? undefined;
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
  } else if (range === "nextmonth") {
    start.setFullYear(now.getFullYear(), now.getMonth() + 1, 1);
    start.setHours(0,0,0,0);
    end.setFullYear(now.getFullYear(), now.getMonth() + 2, 0);
    end.setHours(23,59,59,999);
  } else {
    end.setDate(end.getDate() + 30); // KOPIS 공연목록 조회 최대 31일 범위
  }

  const stdate = toKopisDate(start);
  const eddate = toKopisDate(end);

  try {
    const limit = type === "today" ? 30 : Math.min(Math.max(rows, 1), 100);
    const titleList = await fetchPerformanceList({
      stdate,
      eddate,
      signgucode: region,
      shprfnm: q,
      rows: limit,
    });
    // 통합검색은 공연명뿐 아니라 공연장명도 찾는다. KOPIS 시설명 검색 결과를 합치고 중복 제거.
    const venueList = q?.trim() ? await fetchPerformanceList({
      stdate,
      eddate,
      signgucode: region,
      shprfnmfct: q,
      rows: limit,
    }) : [];
    const merged = new Map([...titleList, ...venueList].map(show => [show.id, show]));
    const list = Array.from(merged.values()).filter(show =>
      !(show.status?.includes("완료") || show.status?.includes("종료"))
    );

    // 검색어(q)가 있는 조회는 "그 검색어에 대한 결과"이므로, 0건이면 무관한
    // 더미 인기공연으로 채우지 않고 정직하게 빈 배열로 응답한다.
    // 검색어 없는 일반 브라우징(오늘의 공연 등)만 더미로 폴백한다.
    if (!list.length && q?.trim()) {
      return NextResponse.json({ source: "none", shows: [] });
    }

    return NextResponse.json(
      { source: list.length ? "kopis" : "none", shows: list },
      { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    console.error("KOPIS fetch failed, falling back to dummy data:", err);
    if (q?.trim()) return NextResponse.json({ source: "none", shows: [] });
    return NextResponse.json({ source: "none", shows: [] });
  }
}

function toKopisDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
