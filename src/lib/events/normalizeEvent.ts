import type { ShowdayEvent, ShowdayEventCategory } from "./eventTypes";

const FREE_RE = /(무료|0\s*원|free)/i;

export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
}

export function firstText(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = cleanText(row[key]);
    if (v) return v;
  }
  return "";
}

export function firstNumber(row: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const n = Number(row[key]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function normalizeDateText(value: unknown): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  const compact = raw.replace(/[^0-9]/g, "");
  if (compact.length >= 8) {
    const y = compact.slice(0, 4), m = compact.slice(4, 6), d = compact.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function inferCategory(input: string): ShowdayEventCategory {
  const t = input.toLowerCase();
  if (/(전시|미술|박물관|갤러리)/.test(t)) return "전시";
  if (/(체험|교육|강좌|프로그램|숲해설|산림교육|청소년|워크숍|공방)/.test(t)) return "체험·교육";
  if (/(축제|페스티벌|행사|마켓|플리마켓|지역행사)/.test(t)) return "축제·지역행사";
  if (/(공연|콘서트|뮤지컬|연극|클래식|국악|무용|오페라)/.test(t)) return "공연";
  return "기타";
}

export function inferFree(priceText: string, explicit?: unknown): boolean {
  if (explicit === true || explicit === "Y" || explicit === "무료") return true;
  if (explicit === false || explicit === "N") return false;
  return FREE_RE.test(priceText);
}

export function makeEventId(source: string, sourceId: string, title: string, startDate?: string | null) {
  const base = `${source}:${sourceId || title}:${startDate || ""}`;
  return base.replace(/[^0-9A-Za-z가-힣:_-]+/g, "-").slice(0, 180);
}

export function isEnded(event: ShowdayEvent, today = new Date()): boolean {
  if (!event.endDate) return false;
  const end = new Date(`${event.endDate}T23:59:59+09:00`);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() < today.getTime();
}
