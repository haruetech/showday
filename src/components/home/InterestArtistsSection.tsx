"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signInWithKakao } from "@/lib/auth";
import { getFollowedArtistIds, toggleArtistFollow } from "@/lib/favorites";
import type { Show } from "@/types/show";

type ViewMode = "guest" | "member";
type ExtendedShow = Show & {
  ticketOpenAt?: string | null;
  bookingOpenAt?: string | null;
  bookingUrl?: string | null;
  ticketUrl?: string | null;
  startDate?: string | null;
  showTime?: string | null;
};
type AlertPrefs = {
  artistNewShow: boolean;
  ticketOpen: boolean;
  freeNearby: boolean;
  savedSearch: boolean;
  ticketLead?: "7d" | "1d" | "1h" | "10m";
  ticketLeadTimes: Array<"7d" | "3d" | "1d" | "3h" | "1h" | "10m">;
  ticketAnnouncement?: boolean;
  ticketAtOpen?: boolean;
};

const ALERT_PREFS_KEY = "showday:alert-prefs:v1";
const DEFAULT_PREFS: AlertPrefs = { artistNewShow:true, ticketOpen:true, freeNearby:false, savedSearch:false, ticketLeadTimes:["7d","1d","1h","10m"], ticketAnnouncement:true, ticketAtOpen:true };

function safePrefs(): AlertPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = JSON.parse(localStorage.getItem(ALERT_PREFS_KEY) || "{}");
    const legacy = raw?.ticketLead ? [raw.ticketLead] : [];
    const leadTimes = Array.isArray(raw?.ticketLeadTimes) ? raw.ticketLeadTimes : legacy;
    return { ...DEFAULT_PREFS, ...raw, ticketLeadTimes: leadTimes.length ? leadTimes : DEFAULT_PREFS.ticketLeadTimes };
  } catch { return DEFAULT_PREFS; }
}
function cleanArtistName(value?: string) {
  if (!value) return "";
  return value.split(/,|·|\/|\n/)[0]?.trim().slice(0, 40) || "";
}
function artistId(name: string) { return `artist-name:${encodeURIComponent(name.trim())}`; }
function artistNameFromId(id: string) {
  if (!id.startsWith("artist-name:")) return "";
  try { return decodeURIComponent(id.slice("artist-name:".length)); } catch { return ""; }
}
function ticketOpenValue(show: Show) {
  const s = show as ExtendedShow;
  return s.ticketOpenAt || s.bookingOpenAt || "";
}
function bookingUrl(show: Show) {
  const s = show as ExtendedShow;
  return s.bookingUrl || s.ticketUrl || "";
}
function showDateText(show: Show) {
  const s = show as ExtendedShow;
  return show.dateLabel || s.startDate || "일정 확인 중";
}
function toTime(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false }).format(d);
}
function showLink(show: Show) { return `/show/${encodeURIComponent(show.id)}`; }

export default function InterestArtistsSection({ shows, mode, popularShows=[] }: { shows: Show[]; mode: ViewMode; popularShows?: Show[] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [selectedArtist, setSelectedArtist] = useState("");
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [notice, setNotice] = useState("");
  const [ticketInfo,setTicketInfo]=useState<Record<string,{loading:boolean;windows:Array<{kind:string;label:string;startText:string;sourceText:string}>;checked:boolean}>>({});

  useEffect(() => {
    getFollowedArtistIds().then(setFollows);
    setPrefs(safePrefs());
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("artist")?.trim() || "";
      if (fromUrl) { setQuery(fromUrl); setSearched(fromUrl); setSelectedArtist(fromUrl); }
    } catch {}
  }, [mode]);
  useEffect(() => { if (!notice) return; const t=setTimeout(()=>setNotice(""),2200); return()=>clearTimeout(t); }, [notice]);

  const allShows = useMemo(() => Array.from(new Map([...shows,...popularShows].map(s=>[s.id,s])).values()), [shows,popularShows]);
  const knownArtists = useMemo(() => {
    const names = new Set<string>();
    for (const show of allShows) { const name=cleanArtistName(show.artist); if (name.length>=2) names.add(name); }
    return Array.from(names).sort((a,b)=>a.localeCompare(b,"ko"));
  }, [allShows]);
  const rankings = useMemo(() => {
    const map=new Map<string,{name:string;total:number;popular:number;next?:Show}>();
    for (const show of allShows) {
      const name=cleanArtistName(show.artist); if(!name) continue;
      const row=map.get(name)||{name,total:0,popular:0,next:undefined}; row.total+=1;
      if(popularShows.some(p=>p.id===show.id)) row.popular+=1;
      if(!row.next) row.next=show;
      map.set(name,row);
    }
    return Array.from(map.values()).sort((a,b)=>b.popular-a.popular || b.total-a.total || a.name.localeCompare(b.name,"ko")).slice(0,10);
  }, [allShows,popularShows]);
  const matches = useMemo(() => {
    const q=searched.trim().toLowerCase(); if(!q) return [];
    return knownArtists.filter(name=>name.toLowerCase().includes(q)).slice(0,10);
  }, [knownArtists,searched]);
  const savedNames = useMemo(() => Array.from(follows).map(artistNameFromId).filter(Boolean), [follows]);
  const activeArtist = selectedArtist || searched || savedNames[0] || rankings[0]?.name || "";
  const activeShows = useMemo(() => activeArtist ? allShows.filter(s=>cleanArtistName(s.artist)===activeArtist).slice(0,12) : [], [allShows,activeArtist]);

  useEffect(()=>{
    const targets=activeShows.filter(s=>bookingUrl(s)).slice(0,6);
    let cancelled=false;
    for(const show of targets){
      const url=bookingUrl(show); if(!url||ticketInfo[show.id]?.checked||ticketInfo[show.id]?.loading)continue;
      setTicketInfo(prev=>({...prev,[show.id]:{loading:true,windows:prev[show.id]?.windows||[],checked:false}}));
      fetch(`/api/ticket-info?url=${encodeURIComponent(url)}`,{cache:"no-store"}).then(r=>r.json()).then(data=>{if(cancelled)return;setTicketInfo(prev=>({...prev,[show.id]:{loading:false,windows:Array.isArray(data?.windows)?data.windows:[],checked:true}}))}).catch(()=>{if(!cancelled)setTicketInfo(prev=>({...prev,[show.id]:{loading:false,windows:[],checked:true}}))});
    }
    return()=>{cancelled=true};
  },[activeShows]);

  function submit(e: FormEvent) { e.preventDefault(); const q=query.trim(); if(q){setSearched(q);setSelectedArtist(q);} }
  async function toggle(name: string) {
    if (mode === "guest") { await signInWithKakao(); return; }
    const id=artistId(name); const next=await toggleArtistFollow(id);
    setFollows(prev=>{const copy=new Set(prev);next?copy.add(id):copy.delete(id);return copy;});
    setSelectedArtist(name);
    setNotice(next ? `${name} 관심 아티스트로 등록했습니다.` : `${name} 관심 등록을 해제했습니다.`);
  }
  function saveAlertPrefs(patch: Partial<AlertPrefs>) {
    if(mode==="guest"){void signInWithKakao();return;}
    const next={...prefs,...patch};setPrefs(next);localStorage.setItem(ALERT_PREFS_KEY,JSON.stringify(next));setNotice("알림 설정을 MY SHOWDAY에 저장했습니다.");
  }
  function toggleLeadTime(value: AlertPrefs["ticketLeadTimes"][number]) {
    const has=prefs.ticketLeadTimes.includes(value);
    const next=has?prefs.ticketLeadTimes.filter(v=>v!==value):[...prefs.ticketLeadTimes,value];
    saveAlertPrefs({ticketLeadTimes:next});
  }

  return <section id="interest-artists" className="scroll-mt-24 border-t border-line px-4 py-10 sm:px-6 sm:py-14">
    <div className="mx-auto w-full max-w-[1180px]">
      {notice&&<div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-paper px-4 py-2 text-xs font-black text-white shadow-xl">{notice}</div>}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div><p className="text-[11px] font-black tracking-[.18em] text-gold">MY ARTIST</p><h1 className="mt-2 text-2xl font-black tracking-tight text-paper sm:text-4xl">좋아하는 아티스트, 공연과 예매 소식을 한 번에</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">관심 아티스트를 등록하면 현재 확인 가능한 공연예정, 티켓 오픈 정보와 예매 바로가기를 한곳에서 확인할 수 있습니다. 공식 오픈 시간이 확인되지 않은 공연은 임의로 시간을 만들지 않고 ‘미확인’으로 표시합니다.</p></div>
        {mode==="guest" ? (
          <div className="rounded-2xl border border-line bg-white/[.04] p-4">
            <b className="text-sm text-paper">관심 아티스트를 저장해두세요</b>
            <p className="mt-1 text-xs leading-5 text-muted">로그인하면 관심 아티스트의 새 공연과 티켓 오픈 소식을 MY SHOWDAY에서 관리할 수 있어요.</p>
            <button type="button" onClick={()=>signInWithKakao()} className="mt-3 inline-flex rounded-full bg-[#FEE500] px-4 py-2 text-xs font-black text-[#191600]">카카오로 간편 시작</button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <b className="text-sm text-paper">내 알림 설정</b>
            <p className="mt-1 text-xs leading-5 text-muted">새 공연과 티켓 오픈 알림을 MY SHOWDAY에서 관리할 수 있습니다.</p>
            <a href="/my?tab=alerts" className="mt-3 inline-flex rounded-full border border-gold/50 px-3 py-2 text-xs font-black text-gold">MY 알림설정 →</a>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-7 flex max-w-3xl gap-2 rounded-2xl border border-line bg-white/5 p-2"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="가수·배우·연주자 이름을 입력하세요" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-paper outline-none placeholder:text-muted"/><button className="shrink-0 rounded-xl bg-paper px-5 py-3 text-sm font-black text-white">아티스트 찾기</button></form>

      {savedNames.length>0&&<div className="mt-4 flex flex-wrap gap-2"><span className="py-2 text-[11px] font-black text-muted">내 관심</span>{savedNames.map(name=><button key={name} onClick={()=>{setSelectedArtist(name);setSearched(name);setQuery(name)}} className={`rounded-full border px-3 py-2 text-xs font-bold ${activeArtist===name?"border-gold bg-gold/10 text-gold":"border-line text-paper"}`}>♥ {name}</button>)}</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">ARTIST TOP 10</p><h2 className="mt-1 text-lg font-black text-paper">지금 SHOWDAY에서 공연이 확인되는 아티스트</h2></div><span className="text-[10px] text-muted">공연·박스오피스 데이터 기준</span></div><div className="mt-4 space-y-2">{rankings.length?rankings.map((row,i)=><button key={row.name} onClick={()=>{setSelectedArtist(row.name);setSearched(row.name);setQuery(row.name)}} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${activeArtist===row.name?"border-gold bg-gold/10":"border-line hover:border-gold/50"}`}><span className="w-7 text-center text-sm font-black text-gold">{i+1}</span><div className="min-w-0 flex-1"><b className="block truncate text-sm text-paper">{row.name}</b><span className="mt-1 block text-[10px] text-muted">확인 공연 {row.total}건{row.popular?` · 박스오피스 연관 ${row.popular}건`:""}</span></div><span className="text-xs text-muted">보기 →</span></button>):<p className="py-6 text-center text-sm text-muted">아티스트 데이터를 불러오는 중입니다.</p>}</div></div>

        <div className="rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">UPCOMING & TICKET</p><h2 className="mt-1 text-xl font-black text-paper">{activeArtist?`${activeArtist} 공연·예매 일정`:"아티스트를 선택하세요"}</h2></div>{activeArtist&&<button type="button" onClick={()=>toggle(activeArtist)} className={`rounded-full px-4 py-2 text-xs font-black ${mode!=="guest"&&follows.has(artistId(activeArtist))?"border border-gold text-gold":"bg-paper text-white"}`}>{mode==="guest"?"♡ 로그인 후 관심 등록":follows.has(artistId(activeArtist))?"♥ 관심 등록됨":"♡ 관심 아티스트 등록"}</button>}</div>
          {searched&&matches.length>0&&<div className="mt-4 flex flex-wrap gap-2">{matches.map(name=><button key={name} onClick={()=>setSelectedArtist(name)} className="rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-paper hover:border-gold">{name}</button>)}</div>}
          {activeArtist&&<div className="mt-5 grid gap-3">{activeShows.length?activeShows.map(show=>{
            const open=ticketOpenValue(show); const book=bookingUrl(show); const info=ticketInfo[show.id]; const windows=info?.windows||[];
            const fan=windows.filter(w=>w.kind==="fan"); const general=windows.filter(w=>w.kind==="general"); const accessible=windows.filter(w=>w.kind==="accessible");
            const hasNotice=windows.length>0;
            return <article key={show.id} className="rounded-2xl border border-line bg-ink/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><span className="text-[10px] font-black text-gold">공연예정</span><h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-paper">{show.title}</h3><p className="mt-2 text-xs text-muted">공연 일정 · <b className="text-paper">{showDateText(show)}</b></p></div><div className="flex shrink-0 flex-col gap-2"><a href={showLink(show)} className="rounded-full border border-line px-3 py-2 text-center text-[11px] font-black text-paper">공연 상세</a>{book?<a href={book} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gold px-3 py-2 text-center text-[11px] font-black text-ink">{hasNotice?"예매처 바로가기 ↗":"예매일정 확인 ↗"}</a>:<span className="rounded-full border border-line px-3 py-2 text-center text-[10px] font-bold text-muted">예매처 확인 중</span>}</div></div>
              <div className="mt-3 rounded-xl border border-line bg-white/[.03] p-3"><div className="flex items-center justify-between gap-2"><b className="text-[11px] text-paper">티켓 오픈 일정</b>{info?.loading&&<span className="text-[10px] text-muted">예매처 공지 확인 중…</span>}</div>
                {hasNotice?<div className="mt-2 space-y-2">{fan.map((w,i)=><TicketLine key={`f${i}`} badge="선예매" text={w.startText}/>) }{general.map((w,i)=><TicketLine key={`g${i}`} badge="일반예매" text={w.startText}/>) }{accessible.map((w,i)=><TicketLine key={`a${i}`} badge="휠체어석" text={w.startText}/>) }{!fan.length&&!general.length&&!accessible.length&&windows.slice(0,3).map((w,i)=><TicketLine key={i} badge="예매안내" text={w.startText}/>)}</div>:open?<p className="mt-2 text-xs font-black text-gold">{toTime(open)}</p>:info?.checked?<p className="mt-2 text-xs leading-5 text-muted">예매 일정은 공식 예매처에서 확인해 주세요. 일정이 확인되면 SHOWDAY에도 반영됩니다.</p>:<p className="mt-2 text-xs text-muted">예매 오픈 일정을 확인하고 있어요.</p>}
              </div>
            </article>
          }):<div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center"><p className="text-sm font-black text-paper">현재 확인된 예정 공연이 없습니다.</p><p className="mt-2 text-xs leading-5 text-muted">관심 등록을 유지하면 새 공연이 확인될 때 이곳에서 바로 볼 수 있어요.</p></div>}</div>}
        </div>
      </div>

      {mode!=="guest"&&<div className="mt-6 rounded-3xl border border-line bg-white/[.03] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-gold">알림 설정</p><h2 className="mt-1 text-lg font-black text-paper">관심 아티스트 알림</h2><p className="mt-1 text-xs leading-5 text-muted">등록한 아티스트의 새 공연과 티켓 오픈 알림을 선택해서 받을 수 있습니다.</p></div><a href="/my?tab=alerts" className="text-xs font-black text-gold">전체 알림 관리 →</a></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><AlertToggle label="새 공연" desc="등록 아티스트 새 공연" checked={prefs.artistNewShow} onChange={v=>saveAlertPrefs({artistNewShow:v})}/><AlertToggle label="티켓 오픈" desc="예매 시작 시점" checked={prefs.ticketOpen} onChange={v=>saveAlertPrefs({ticketOpen:v})}/><AlertToggle label="무료 행사" desc="내 주변 무료 소식" checked={prefs.freeNearby} onChange={v=>saveAlertPrefs({freeNearby:v})}/><AlertToggle label="저장 조건" desc="조건에 맞는 새 소식" checked={prefs.savedSearch} onChange={v=>saveAlertPrefs({savedSearch:v})}/></div>{prefs.ticketOpen&&<div className="mt-4 rounded-2xl border border-line bg-white/[.025] p-4"><div className="flex flex-wrap items-center gap-2 text-xs text-muted"><b className="mr-1 text-paper">티켓 오픈 알림 시점</b><button type="button" onClick={()=>saveAlertPrefs({ticketAnnouncement:!prefs.ticketAnnouncement})} className={`rounded-full border px-3 py-1.5 font-bold ${prefs.ticketAnnouncement?"border-gold bg-gold/10 text-gold":"border-line"}`}>일정 발표 즉시</button>{([['7d','7일 전'],['3d','3일 전'],['1d','하루 전'],['3h','3시간 전'],['1h','1시간 전'],['10m','10분 전']] as const).map(([v,label])=><button type="button" key={v} onClick={()=>toggleLeadTime(v)} className={`rounded-full border px-3 py-1.5 font-bold ${prefs.ticketLeadTimes.includes(v)?"border-gold bg-gold/10 text-gold":"border-line"}`}>{label}</button>)}<button type="button" onClick={()=>saveAlertPrefs({ticketAtOpen:!prefs.ticketAtOpen})} className={`rounded-full border px-3 py-1.5 font-bold ${prefs.ticketAtOpen?"border-gold bg-gold/10 text-gold":"border-line"}`}>오픈 즉시</button></div><p className="mt-2 text-[10px] leading-5 text-muted">여러 시점을 동시에 선택할 수 있습니다.</p></div>}</div>}
    </div>
  </section>;
}

function TicketLine({badge,text}:{badge:string;text:string}){return <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white/[.04] px-3 py-2"><span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-black text-gold">{badge}</span><b className="text-xs text-paper">{text}</b></div>}

function AlertToggle({label,desc,checked,onChange}:{label:string;desc:string;checked:boolean;onChange:(v:boolean)=>void}){
  return <button onClick={()=>onChange(!checked)} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left ${checked?"border-gold/60 bg-gold/10":"border-line"}`}><div><b className="block text-sm text-paper">{label}</b><span className="mt-1 block text-[10px] text-muted">{desc}</span></div><span className={`relative h-6 w-11 shrink-0 rounded-full ${checked?"bg-gold":"bg-white/15"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked?"left-6":"left-1"}`}/></span></button>;
}
