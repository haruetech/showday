import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SeoulRow = {
  CODENAME?: string; GUNAME?: string; TITLE?: string; DATE?: string; PLACE?: string; ORG_NAME?: string;
  USE_TRGT?: string; USE_FEE?: string; INQUIRY?: string; PLAYER?: string; PROGRAM?: string; ORG_LINK?: string;
  MAIN_IMG?: string; RGSTDATE?: string; TICKET?: string; STRTDATE?: string; END_DATE?: string; THEMECODE?: string;
  LOT?: string | number; LAT?: string | number; IS_FREE?: string; HMPG_ADDR?: string; PRO_TIME?: string;
};

const BLOCKED = ["교육", "체험", "전시", "미술", "강좌", "강의"];

function normalizeDate(value?: string) {
  if (!value) return null;
  const raw = value.slice(0, 10).replace(/\./g, "-");
  const d = new Date(`${raw}T23:59:59+09:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function sourceId(row: SeoulRow, index: number) {
  const match = row.HMPG_ADDR?.match(/[?&]cultcode=([^&]+)/);
  return match?.[1] ?? `seoul-${index}-${encodeURIComponent(row.TITLE ?? "event")}`;
}

export async function GET(req: NextRequest) {
  const key = process.env.SEOUL_OPEN_DATA_API_KEY;
  if (!key) return NextResponse.json({ events: [], configured: false, message: "SEOUL_OPEN_DATA_API_KEY가 설정되지 않았습니다." });

  const sp = req.nextUrl.searchParams;
  const rows = Math.min(Math.max(Number(sp.get("rows") || 500), 50), 1000);
  const page = Math.max(Number(sp.get("page") || 1), 1);
  const start = (page - 1) * rows + 1;
  const end = page * rows;
  const category = sp.get("category")?.trim() || " ";
  const title = sp.get("title")?.trim() || " ";
  const date = sp.get("date")?.trim() || " ";
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(key)}/json/culturalEventInfo/${start}/${end}/${encodeURIComponent(category)}/${encodeURIComponent(title)}/${encodeURIComponent(date)}/`;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Seoul API HTTP ${res.status}`);
    const json = await res.json();
    const root = json?.culturalEventInfo;
    const rawRows: SeoulRow[] = Array.isArray(root?.row) ? root.row : [];
    const now = new Date();
    const todayKst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    todayKst.setHours(0,0,0,0);

    const events = rawRows.map((row, index) => {
      const endDate = normalizeDate(row.END_DATE || row.DATE?.split("~")[1]);
      const startDate = normalizeDate(row.STRTDATE || row.DATE?.split("~")[0]);
      const lat = Number(row.LAT), lng = Number(row.LOT);
      return {
        id: sourceId(row,index), source:"SEOUL" as const, category:row.CODENAME?.trim()||"문화행사", district:row.GUNAME?.trim()||"",
        title:row.TITLE?.trim()||"제목 미정", dateText:row.DATE?.trim()||"일정 확인 중", startDate:startDate?.toISOString()??null,
        endDate:endDate?.toISOString()??null, venue:row.PLACE?.trim()||"장소 확인 중", organizer:row.ORG_NAME?.trim()||"", target:row.USE_TRGT?.trim()||"",
        priceText:row.USE_FEE?.trim()||(row.IS_FREE==="무료"?"무료":"가격 확인 중"), isFree:row.IS_FREE==="무료", inquiry:row.INQUIRY?.trim()||"",
        performer:row.PLAYER?.trim()||"", program:row.PROGRAM?.trim()||"", bookingUrl:row.ORG_LINK?.trim()||"", officialUrl:row.HMPG_ADDR?.trim()||"",
        imageUrl:row.MAIN_IMG?.replaceAll("&amp;","&").trim()||"", showTime:row.PRO_TIME?.trim()||"", lat:Number.isFinite(lat)?lat:null, lng:Number.isFinite(lng)?lng:null,
        ended:endDate?endDate<todayKst:false,
      };
    }).filter((e)=>!e.ended)
      .filter((e)=>!BLOCKED.some((word)=>e.category.includes(word)))
      .sort((a,b)=>(a.startDate||"9999").localeCompare(b.startDate||"9999"));

    return NextResponse.json({ configured:true, source:"서울특별시 문화행사 정보", total:root?.list_total_count??events.length, page, rows, events });
  } catch (error) {
    console.error("Seoul culturalEventInfo error", error);
    return NextResponse.json({ events:[], configured:true, message:"서울시 문화행사 정보를 불러오지 못했습니다." }, { status:502 });
  }
}
