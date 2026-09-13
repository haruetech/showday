import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTS = [
  "ticket.interpark.com",
  "tickets.interpark.com",
  "nol.interpark.com",
  "ticketlink.co.kr",
  "www.ticketlink.co.kr",
  "yes24.com",
  "ticket.yes24.com",
  "melonticket.com",
  "ticket.melon.com",
  "yeyak.seoul.go.kr",
];

type TicketKind = "fan" | "general" | "accessible" | "application" | "unknown";
type TicketWindow = {
  kind: TicketKind;
  label: string;
  startText: string;
  sourceText: string;
};

function isAllowedUrl(value: string) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"');
}

function cleanHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/li>|<\/tr>|<\/dd>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function classify(label: string): TicketKind {
  if (/팬클럽|선예매|presale/i.test(label)) return "fan";
  if (/휠체어|장애/i.test(label)) return "accessible";
  if (/일반예매|일반 예매|티켓오픈|티켓 오픈|일반판매|일반 판매/i.test(label)) return "general";
  if (/신청|접수|예약/i.test(label)) return "application";
  return "unknown";
}

function normalizeMeridiem(hour: number, meridiem?: string) {
  const token = (meridiem || "").toLowerCase();
  if ((token === "오후" || token === "pm") && hour < 12) return hour + 12;
  if ((token === "오전" || token === "am") && hour === 12) return 0;
  return hour;
}

function normalizedDateText(match: RegExpMatchArray) {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const before = match[4] || "";
  let hour = Number(match[5]);
  const minute = Number(match[6] || 0);
  const after = match[7] || "";
  hour = normalizeMeridiem(hour, before || after);
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${hh}:${mm}`;
}

function extract(text: string) {
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  const out: TicketWindow[] = [];
  const dateTime = /(20\d{2})\s*[년.\/-]\s*(\d{1,2})\s*[월.\/-]\s*(\d{1,2})\s*일?[^\n]{0,36}?(?:(오전|오후)\s*)?(\d{1,2})(?::(\d{2})(?::\d{2})?)?\s*(AM|PM|am|pm|시)?/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/(예매|티켓|신청|접수|예약|오픈|휠체어)/.test(line)) continue;
    const joined = [line, lines[i + 1] || "", lines[i + 2] || ""].join(" ");
    const match = joined.match(dateTime);
    if (!match) continue;
    const label = (line.split(/[▶:：]/)[0] || line).trim().slice(0, 70);
    const sourceText = joined.slice(0, 260);
    const startText = normalizedDateText(match);
    const key = `${classify(label)}|${startText}|${label}`;
    if (out.some((item) => `${item.kind}|${item.startText}|${item.label}` === key)) continue;
    out.push({ kind: classify(label), label, startText, sourceText });
  }

  return out.slice(0, 16);
}

async function fetchAllowedHtml(initialUrl: string) {
  let currentUrl = initialUrl;
  for (let hop = 0; hop < 4; hop++) {
    if (!isAllowedUrl(currentUrl)) throw new Error("지원하지 않는 예매처로 이동했습니다.");
    const res = await fetch(currentUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; SHOWDAY/1.0; +https://showday.kr)",
        "accept-language": "ko-KR,ko;q=0.9",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      redirect: "manual",
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("예매처 이동 주소를 확인할 수 없습니다.");
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    if (!res.ok) throw new Error(`예매처 응답 ${res.status}`);
    return { html: await res.text(), finalUrl: currentUrl };
  }
  throw new Error("예매처 이동이 너무 많습니다.");
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ ok: false, windows: [], reason: "지원 예매처가 아니거나 URL이 없습니다." }, { status: 400 });
  }

  try {
    const { html, finalUrl } = await fetchAllowedHtml(url);
    const windows = extract(cleanHtml(html));
    return NextResponse.json({
      ok: true,
      windows,
      sourceUrl: finalUrl,
      verifiedAt: new Date().toISOString(),
      noticeFound: windows.length > 0,
      reason: windows.length ? null : "공식 예매처는 연결되어 있지만 페이지에서 예매 날짜·시간을 자동 추출하지 못했습니다.",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      windows: [],
      reason: error instanceof Error ? error.message : "예매일정 확인 실패",
    });
  }
}
