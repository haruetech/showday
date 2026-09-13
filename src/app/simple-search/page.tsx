import Link from "next/link";
import { fetchPerformanceList } from "@/lib/kopis";
import type { Show } from "@/types/show";

export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
const regionCodes: Record<string,string> = { "전국":"", "서울":"11", "경기":"41", "인천":"28", "부산":"26" };

function one(v:string|string[]|undefined, fallback=""){ return Array.isArray(v)?(v[0]??fallback):(v??fallback); }
function ymd(d:Date){return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;}
function kstToday(){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).split("-").map(Number);
  return new Date(parts[0],parts[1]-1,parts[2]);
}
function rangeFor(v:string){
  const now=kstToday(), start=new Date(now), end=new Date(now);
  if(v==="오늘") return [start,end] as const;
  if(v==="이번 주말") { const add=(6-now.getDay()+7)%7; start.setDate(now.getDate()+add); end.setTime(start.getTime()); end.setDate(start.getDate()+1); return [start,end] as const; }
  if(v==="이번 달") { end.setMonth(now.getMonth()+1,0); return [start,end] as const; }
  end.setDate(now.getDate()+7); return [start,end] as const;
}
function minAge(label?:string){
  if(!label) return null; const t=label.replace(/\s+/g," ");
  if(/전체\s*관람|전체관람|전\s*연령/.test(t)) return 0;
  const m=t.match(/(?:만\s*)?(\d+)\s*세/); if(m) return Number(m[1]);
  if(/초등학생\s*이상|초등\s*이상/.test(t)) return 7;
  if(/중학생\s*이상|중등\s*이상/.test(t)) return 13;
  return null;
}
function childOk(show:Show,age:number){const m=minAge(show.ageLabel);return m!==null&&m<=age;}

export default async function SimpleSearchPage({searchParams}:{searchParams:Promise<Params>}){
  const sp=await searchParams;
  const timing=one(sp.timing,"이번 주말");
  const region=one(sp.region,"서울");
  const companion=one(sp.companion,"상관없음");
  const childAge=Number(one(sp.childAge,"7"));
  const q=one(sp.q,"").trim();
  const submitted=one(sp.search,"")==="1";
  let shows:Show[]=[];
  if(submitted){
    const [start,end]=rangeFor(timing);
    const title=await fetchPerformanceList({stdate:ymd(start),eddate:ymd(end),signgucode:regionCodes[region]||undefined,shprfnm:q||undefined,rows:40});
    const venue=q?await fetchPerformanceList({stdate:ymd(start),eddate:ymd(end),signgucode:regionCodes[region]||undefined,shprfnmfct:q,rows:40}):[];
    shows=Array.from(new Map([...title,...venue].map(x=>[x.id,x])).values());
    if(companion==="아이와") shows=shows.filter(s=>childOk(s,childAge));
  }
  return <main className="min-h-screen bg-surface px-4 py-6 text-paper">
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3"><Link href="/" className="font-display text-xl font-black">SHOWDAY</Link><Link href="/" className="text-xs font-bold text-muted">메인으로</Link></div>
      <section className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
        <p className="text-[11px] font-bold tracking-[.14em] text-gold">SIMPLE SEARCH</p>
        <h1 className="mt-2 text-xl font-black">구형 iPhone 간편검색</h1>
        <p className="mt-2 text-xs leading-5 text-muted">오래된 Safari에서도 사용할 수 있도록 기본 선택창과 일반 전송 버튼만 사용합니다.</p>
        <form method="get" action="/simple-search" className="mt-5 grid gap-4">
          <input type="hidden" name="search" value="1"/>
          <label className="grid gap-1.5 text-xs font-black">언제<select name="timing" defaultValue={timing} className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold"><option>오늘</option><option>이번 주말</option><option>이번 주</option><option>이번 달</option></select></label>
          <label className="grid gap-1.5 text-xs font-black">어디서<select name="region" defaultValue={region} className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold"><option>서울</option><option>경기</option><option>인천</option><option>부산</option><option>전국</option></select></label>
          <label className="grid gap-1.5 text-xs font-black">누구와<select name="companion" defaultValue={companion} className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold"><option>상관없음</option><option>아이와</option><option>연인과</option><option>친구·부부</option><option>부모님과</option><option>혼자</option></select></label>
          <label className="grid gap-1.5 text-xs font-black">아이 나이 <span className="font-normal text-muted">(아이와 선택할 때만 적용)</span><select name="childAge" defaultValue={String(childAge)} className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold">{Array.from({length:13},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}세</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-black">공연명·아티스트 <input name="q" defaultValue={q} placeholder="선택 입력" className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold"/></label>
          <button type="submit" className="min-h-12 rounded-xl bg-paper px-5 text-sm font-black text-white">이 조건으로 찾기</button>
        </form>
      </section>
      {submitted&&<section className="mt-6"><div className="mb-3 flex items-end justify-between"><h2 className="text-lg font-black">검색 결과</h2><span className="text-xs text-muted">{shows.length}건</span></div>{shows.length===0?<div className="rounded-xl border border-line bg-white/60 p-6 text-center text-sm text-muted">조건에 맞는 공연을 찾지 못했습니다.</div>:<div className="grid gap-3">{shows.slice(0,30).map(show=><Link key={show.id} href={`/show/${encodeURIComponent(show.id)}`} className="grid grid-cols-[76px_1fr] gap-3 rounded-xl border border-line bg-white p-3"><div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover"/>:null}</div><div className="min-w-0"><p className="text-[10px] font-bold text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm">{show.title}</b><p className="mt-1 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p>{show.ageLabel&&<p className="mt-1 text-[11px] text-muted">{show.ageLabel}</p>}</div></Link>)}</div>}</section>}
    </div>
  </main>;
}
