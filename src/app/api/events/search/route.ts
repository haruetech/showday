import { NextRequest, NextResponse } from "next/server";
import { fetchCulturePortalEvents } from "@/lib/external/culturePortal";
import { fetchForestEducation } from "@/lib/external/forestEdu";
import { fetchSeoulReservations } from "@/lib/external/seoulReservation";
import { fetchTourFestivalEvents } from "@/lib/external/tourApi";
import { fetchYouthPrograms } from "@/lib/external/youthProgram";
import { dedupeEvents } from "@/lib/events/dedupeEvents";
import { isEnded } from "@/lib/events/normalizeEvent";
import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";

function includesText(event: ShowdayEvent, q: string) {
  if (!q) return true;
  const hay = [event.title,event.venue,event.address,event.organizer,event.description,event.target,event.subcategory].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function matchesCategory(event: ShowdayEvent, category: string) {
  if (!category || category === "전체") return true;
  if (category === "무료") return Boolean(event.isFree);
  return event.category.includes(category) || (event.subcategory || "").includes(category);
}

function matchesRegion(event: ShowdayEvent, region: string) {
  if (!region || region === "전국" || region === "내 주변") return true;
  return [event.region,event.district,event.address,event.venue].filter(Boolean).some(v=>String(v).includes(region));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() || "";
  const category = sp.get("category")?.trim() || "전체";
  const region = sp.get("region")?.trim() || "전국";
  const rows = Math.min(Math.max(Number(sp.get("rows") || 100), 20), 300);
  const sourceFilter = new Set((sp.get("sources") || "culture,tour,youth,seoul,forest").split(",").map(s=>s.trim()).filter(Boolean));

  const jobs: Promise<EventSourceResult>[] = [];
  if (sourceFilter.has("culture")) jobs.push(fetchCulturePortalEvents({ rows }));
  if (sourceFilter.has("tour")) jobs.push(fetchTourFestivalEvents({ rows }));
  if (sourceFilter.has("youth")) jobs.push(fetchYouthPrograms({ rows }));
  if (sourceFilter.has("seoul")) jobs.push(fetchSeoulReservations({ rows }));
  if (sourceFilter.has("forest")) jobs.push(fetchForestEducation({ rows }));

  const results = await Promise.all(jobs);
  const all = results.flatMap(r=>r.events).filter(e=>!isEnded(e));
  const filtered = dedupeEvents(all)
    .filter(e=>includesText(e,q))
    .filter(e=>matchesCategory(e,category))
    .filter(e=>matchesRegion(e,region))
    .sort((a,b)=>(a.startDate || a.applyStartDate || "9999").localeCompare(b.startDate || b.applyStartDate || "9999"));

  return NextResponse.json({
    total: filtered.length,
    events: filtered.slice(0,rows),
    sources: results.map(r=>({ source:r.source, configured:r.configured, count:r.events.length, error:r.error || null })),
  },{ headers:{ "Cache-Control":"s-maxage=600, stale-while-revalidate=1200" } });
}
