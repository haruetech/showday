import ShowCard from "@/components/ShowCard";
import type { Show } from "@/types/show";

export default function ShowdayTrends({ shows }: { shows: Show[] }){
  const unique=(list:Show[])=>Array.from(new Map(list.map(s=>[s.id,s])).values()).slice(0,6);
  const groups=[
    {key:"TREND", title:"지금 관심이 가는 공연", desc:"현재·예정 공연 가운데 먼저 살펴볼 만한 공연", shows:unique(shows)},
    {key:"WEEKEND", title:"이번 주말 뭐 볼까?", desc:"주말에 바로 선택하기 좋은 공연", shows:unique(shows.filter(s=>s.tags?.includes("주말") || ["금","토","일"].includes(s.dayOfWeek)))},
    {key:"OPEN", title:"티켓 오픈 · 곧 시작", desc:"예매 시기를 놓치기 쉬운 공연", shows:unique(shows.filter(s=>s.tags?.includes("티켓오픈임박") || s.status?.includes("예정")))},
    {key:"REGION", title:"지역으로 발견하기", desc:"서울·경기·인천 등 가까운 공연부터", shows:unique(shows.filter(s=>s.region==="서울"))},
  ];
  return <section id="discover" className="mx-auto max-w-6xl px-6 py-12">
    <div className="mb-7"><p className="text-xs font-bold tracking-[.18em] text-gold">DISCOVER BY CONCEPT</p><h2 className="mt-2 text-3xl font-black text-paper">취향대로 공연 발견하기</h2><p className="mt-2 text-sm text-muted">전체 공연을 한꺼번에 보여주지 않고, 지금 선택하기 쉬운 기준으로 나눴습니다.</p></div>
    <div className="space-y-10">{groups.map(g=><div key={g.key}><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.14em] text-gold">{g.key}</p><h3 className="mt-1 text-xl font-black text-paper">{g.title}</h3><p className="mt-1 text-xs text-muted">{g.desc}</p></div></div>{g.shows.length?<div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">{g.shows.map(s=><ShowCard key={s.id} show={s}/>)}</div>:<div className="rounded-xl border border-line bg-surface p-5 text-sm text-muted">현재 조건에 맞는 공연을 불러오는 중입니다.</div>}</div>)}</div>
  </section>
}
