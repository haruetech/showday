"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { allShows } from "@/lib/dummy-data";
import { ArrowIcon, CalendarIcon, PinIcon, SearchIcon, SparkIcon } from "@/components/Icons";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주말" | "이번 달" | "날짜 선택";
type Region = "내 주변" | "서울" | "경기" | "인천" | "부산" | "전국";
type Companion = "아이와 함께" | "데이트" | "친구·부부" | "부모님과" | "혼자";
type ChildAge = "0~3세" | "4~7세" | "8~10세" | "11~13세" | "전체관람가";
type Price = "가격 무관" | "무료" | "1만원 이하" | "3만원 이하" | "5만원 이하";

const timings: Timing[] = ["오늘", "이번 주말", "이번 달", "날짜 선택"];
const regions: Region[] = ["내 주변", "서울", "경기", "인천", "부산", "전국"];
const companions: Companion[] = ["아이와 함께", "데이트", "친구·부부", "부모님과", "혼자"];
const childAges: ChildAge[] = ["0~3세", "4~7세", "8~10세", "11~13세", "전체관람가"];
const genres = ["전체", "콘서트", "뮤지컬", "연극", "클래식", "아동·가족"] as const;
const prices: Price[] = ["가격 무관", "무료", "1만원 이하", "3만원 이하", "5만원 이하"];
const regionCodes: Record<Exclude<Region, "내 주변">, string> = { 서울:"11", 경기:"41", 인천:"28", 부산:"26", 전국:"" };

function isEnded(status?: string){ return Boolean(status && (status.includes("완료") || status.includes("종료"))); }
function priceLimit(value:Price){
  if(value==="무료") return 0;
  if(value==="1만원 이하") return 10000;
  if(value==="3만원 이하") return 30000;
  if(value==="5만원 이하") return 50000;
  return Infinity;
}
function matchesPrice(show:Show, value:Price){
  if(value==="가격 무관") return true;
  if(value==="무료") return /무료/.test(show.priceLabel||"");
  return Boolean(show.priceValue) && show.priceValue<=priceLimit(value);
}
function matchesCompanion(show:Show, value:Companion){
  if(value==="아이와 함께") return show.tags?.includes("가족") || /아동|어린이|가족/.test(show.genre);
  if(value==="데이트") return show.tags?.includes("데이트") || /뮤지컬|연극|콘서트|대중/.test(show.genre);
  if(value==="부모님과") return show.tags?.includes("부모님") || show.tags?.includes("50+") || /클래식|국악|콘서트/.test(show.genre);
  return true;
}
function genreMatches(show:Show, genre:string){
  if(genre==="전체") return true;
  if(genre==="콘서트") return /콘서트|대중음악|대중/.test(show.genre);
  if(genre==="아동·가족") return /아동|어린이|가족/.test(show.genre) || show.tags?.includes("가족");
  return show.genre?.includes(genre);
}
function minAllowedAge(label?:string){
  if(!label) return null;
  if(/전체\s*관람|전체관람/.test(label)) return 0;
  const m=label.match(/(\d+)\s*세/);
  return m ? Number(m[1]) : null;
}
function childAgeMatches(show:Show, value:ChildAge|null){
  if(!value) return true;
  const minAge=minAllowedAge(show.ageLabel);
  if(value==="전체관람가") return minAge===0 || /전체\s*관람|전체관람/.test(show.ageLabel||"");
  if(minAge===null) return true; // KOPIS 목록에 관람연령이 없으면 상세에서 확인할 수 있게 제외하지 않음
  const maxAge = value==="0~3세" ? 3 : value==="4~7세" ? 7 : value==="8~10세" ? 10 : 13;
  return minAge<=maxAge;
}
function toIsoDate(d:Date){
  const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

export default function Hero(){
  const [query,setQuery]=useState("");
  const [companion,setCompanion]=useState<Companion>("아이와 함께");
  const [region,setRegion]=useState<Region>("내 주변");
  const [timing,setTiming]=useState<Timing>("이번 주말");
  const [customDate,setCustomDate]=useState(toIsoDate(new Date()));
  const [genre,setGenre]=useState<(typeof genres)[number]>("전체");
  const [childAge,setChildAge]=useState<ChildAge|null>("4~7세");
  const [price,setPrice]=useState<Price>("가격 무관");
  const [results,setResults]=useState<Show[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [locationMsg,setLocationMsg]=useState("");
  const [listening,setListening]=useState(false);
  const [voiceMsg,setVoiceMsg]=useState("");

  const fallback=useMemo(()=>allShows
    .filter(s=>!isEnded(s.status))
    .filter(s=>genreMatches(s,genre))
    .filter(s=>region==="전국"||region==="내 주변"||s.region.includes(region))
    .filter(s=>matchesPrice(s,price))
    .filter(s=>matchesCompanion(s,companion))
    .filter(s=>companion!=="아이와 함께"||childAgeMatches(s,childAge))
    .filter(s=>!query.trim()||`${s.title} ${s.artist??""} ${s.venue}`.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0,12),[query,genre,region,price,companion,childAge]);

  function chooseCompanion(v:Companion){
    setCompanion(v);
    if(v!=="아이와 함께") setChildAge(null);
    else if(!childAge) setChildAge("4~7세");
  }

  function applyVoiceCommand(text:string){
    const t=text.replace(/\s+/g," ").trim();
    setQuery("");

    if(/아이|아들|딸|자녀|어린이|가족/.test(t)) chooseCompanion("아이와 함께");
    else if(/데이트|여자친구|남자친구|연인/.test(t)) chooseCompanion("데이트");
    else if(/부모님|엄마|아빠|어머니|아버지/.test(t)) chooseCompanion("부모님과");
    else if(/친구|부부|배우자|남편|아내/.test(t)) chooseCompanion("친구·부부");
    else if(/혼자|나홀로/.test(t)) chooseCompanion("혼자");

    if(/내 주변|근처|가까운 곳|주변/.test(t)) setRegion("내 주변");
    else if(/서울/.test(t)) setRegion("서울");
    else if(/경기|경기도/.test(t)) setRegion("경기");
    else if(/인천/.test(t)) setRegion("인천");
    else if(/부산/.test(t)) setRegion("부산");
    else if(/전국/.test(t)) setRegion("전국");

    if(/오늘/.test(t)) setTiming("오늘");
    else if(/이번\s*주말|주말/.test(t)) setTiming("이번 주말");
    else if(/이번\s*달|이달/.test(t)) setTiming("이번 달");

    if(/뮤지컬/.test(t)) setGenre("뮤지컬");
    else if(/연극/.test(t)) setGenre("연극");
    else if(/클래식/.test(t)) setGenre("클래식");
    else if(/콘서트|공연/.test(t)) setGenre("콘서트");
    else if(/아동|어린이|가족/.test(t)) setGenre("아동·가족");

    if(/전체\s*관람/.test(t)) setChildAge("전체관람가");
    else {
      const age=t.match(/(\d{1,2})\s*살|((?:\d{1,2}))\s*세/);
      const n=age?Number(age[1]||age[2]):null;
      if(n!==null){
        chooseCompanion("아이와 함께");
        if(n<=3) setChildAge("0~3세");
        else if(n<=7) setChildAge("4~7세");
        else if(n<=10) setChildAge("8~10세");
        else if(n<=13) setChildAge("11~13세");
      }
    }

    if(/무료/.test(t)) setPrice("무료");
    else if(/1\s*만\s*원|만원/.test(t)) setPrice("1만원 이하");
    else if(/3\s*만\s*원|삼만원/.test(t)) setPrice("3만원 이하");
    else if(/5\s*만\s*원|오만원/.test(t)) setPrice("5만원 이하");

    setVoiceMsg(`“${t}”에서 검색 조건을 적용했습니다. 조건을 확인한 뒤 ‘이 조건으로 찾기’를 눌러주세요.`);
  }

  function startVoiceSearch(){
    const w=window as Window & {
      SpeechRecognition?: new()=>SpeechRecognitionLike;
      webkitSpeechRecognition?: new()=>SpeechRecognitionLike;
    };
    const Recognition=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Recognition){
      setVoiceMsg("이 브라우저에서는 음성검색을 지원하지 않습니다. Chrome 또는 Edge에서 이용해주세요.");
      return;
    }
    const recognition=new Recognition();
    recognition.lang="ko-KR";
    recognition.interimResults=false;
    recognition.maxAlternatives=1;
    recognition.onstart=()=>{setListening(true);setVoiceMsg("말씀해주세요. 예: 이번 주말 도봉구에서 7살 아이와 3만원 이하 공연");};
    recognition.onresult=(event)=>{
      const transcript=event.results?.[0]?.[0]?.transcript||"";
      if(transcript) applyVoiceCommand(transcript);
    };
    recognition.onerror=()=>setVoiceMsg("음성을 인식하지 못했습니다. 마이크 권한을 확인하고 다시 시도해주세요.");
    recognition.onend=()=>setListening(false);
    recognition.start();
  }

  async function searchShows(){
    setLoading(true); setSearched(true); setLocationMsg("");
    try{
      const p=new URLSearchParams({type:"search",rows:"60"});
      if(query.trim()) p.set("q",query.trim());
      if(region!=="내 주변" && regionCodes[region]) p.set("region",regionCodes[region]);
      if(timing==="오늘") p.set("range","today");
      else if(timing==="이번 주말") p.set("range","weekend");
      else if(timing==="이번 달") p.set("range","month");
      else { p.set("range","date"); p.set("date",customDate); }

      const data=await fetch(`/api/kopis?${p.toString()}`,{cache:"no-store"}).then(r=>r.json());
      let list:Show[]=(data?.shows??[])
        .filter((s:Show)=>!isEnded(s.status))
        .filter((s:Show)=>genreMatches(s,genre))
        .filter((s:Show)=>matchesPrice(s,price))
        .filter((s:Show)=>matchesCompanion(s,companion))
        .filter((s:Show)=>companion!=="아이와 함께"||childAgeMatches(s,childAge));

      if(region==="내 주변" && list.length){
        try{
          setLocationMsg("현재 위치 기준 가까운 공연을 확인하고 있습니다.");
          const pos=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:7000,maximumAge:300000}));
          const candidates=list.slice(0,24);
          const tt=await fetch("/api/travel-times",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:{lat:pos.coords.latitude,lng:pos.coords.longitude},venues:candidates.map(s=>({id:s.id,name:s.venue,region:s.region}))})}).then(r=>r.json());
          if(tt?.configured===false){
            setLocationMsg("내 주변 거리 계산은 지도 연동 준비 후 더 정확해집니다. 현재는 검색 조건에 맞는 공연을 보여드립니다.");
          }else{
            const times=tt?.times||{};
            list=candidates.filter(s=>{const mins=times[s.id]?.transitMinutes; return typeof mins==="number" && mins<=60;});
            setLocationMsg("현재 위치에서 대중교통 약 1시간 이내 공연을 우선 보여드립니다.");
          }
        }catch{
          setLocationMsg("위치 권한을 허용하면 내 주변 공연을 더 정확하게 찾을 수 있습니다.");
        }
      }
      setResults((list.length?list:fallback).slice(0,12));
    }catch{
      setResults(fallback);
    }finally{ setLoading(false); }
  }

  const periodLabel=timing==="날짜 선택"?customDate:timing;
  const summary=[companion, region, periodLabel, genre!=="전체"?genre:null, companion==="아이와 함께"&&childAge?childAge:null, price!=="가격 무관"?price:null].filter(Boolean).join(" · ");

  return <section id="show-search" className="border-b border-line bg-surface">
    <div className="relative overflow-hidden bg-[#512a20]">
      <div className="absolute inset-0 opacity-40"><img src="/showday-hero-audience.png" alt="" className="h-full w-full object-cover"/></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#422118]/95 via-[#512a20]/82 to-[#512a20]/38"/>
      <div className="relative mx-auto flex min-h-[330px] max-w-[1280px] items-center px-4 py-14 sm:px-6 lg:min-h-[390px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[.24em] text-[#f3b37f]">SHOWDAY · 내게 맞는 공연 발견</p>
          <h1 className="font-display font-black leading-[1.08]">
            <span className="block whitespace-nowrap text-[clamp(1.55rem,4.6vw,3.8rem)] text-white">이번 주말 누구와 어디갈까요?</span>
            <span className="mt-2 block whitespace-nowrap text-[clamp(1.15rem,3.7vw,3rem)] leading-[1.14] text-[#f3b37f]">내 주변 공연·행사를 쉽게 찾아보세요.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base">아이와 함께, 데이트, 부모님과 함께. 복잡한 검색 대신 네 가지만 고르면 SHOWDAY가 볼 만한 공연을 찾아드립니다.</p>
          <a href="#quick-search" className="mt-7 inline-flex items-center gap-2 border-b border-[#f3b37f] pb-1 text-sm font-bold text-white">바로 찾기 <ArrowIcon className="h-4 w-4"/></a>
        </div>
      </div>
    </div>

    <div id="quick-search" className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="rounded-2xl border border-line bg-white/55 p-4 shadow-sm sm:p-6">
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[.18em] text-gold">EASY SEARCH</p>
          <h2 className="mt-2 text-xl font-black text-paper sm:text-2xl">다섯 가지만 보면 됩니다.</h2>
          <p className="mt-1 text-xs leading-5 text-muted">누구와 · 어디서 · 언제 · 무엇을 · 얼마에 볼지 빠르게 고르세요.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Choice label="1. 누구와" options={companions} value={companion} setValue={chooseCompanion}/>
          <Choice label="2. 어디서" options={regions} value={region} setValue={setRegion}/>
          <div>
            <Choice label="3. 언제" options={timings} value={timing} setValue={setTiming}/>
            {timing==="날짜 선택"&&<label className="mt-3 flex max-w-[260px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2"><CalendarIcon className="h-4 w-4 text-gold"/><input type="date" value={customDate} min={toIsoDate(new Date())} onChange={e=>setCustomDate(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-paper outline-none"/></label>}
          </div>
          <Choice label="4. 무엇을" options={genres} value={genre} setValue={setGenre}/>
          <Choice label="5. 가격" options={prices} value={price} setValue={setPrice}/>
        </div>

        {companion==="아이와 함께"&&<div className="mt-5 rounded-xl border border-[#d9b89f] bg-[#fff8f0] p-4"><Choice label="아이 나이에 맞춰 찾기" options={childAges} value={childAge??"4~7세"} setValue={setChildAge}/><p className="mt-2 text-[11px] leading-5 text-muted">관람 연령 정보가 있는 공연은 아이 나이에 맞춰 우선 검색합니다.</p></div>}

        <div className="mt-6 border-t border-line pt-5">
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative"><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchShows()} placeholder="공연명·아티스트를 입력하거나 음성으로 말해보세요" className="w-full rounded-xl border border-line bg-white py-3.5 pl-12 pr-4 text-sm text-paper outline-none transition focus:border-gold"/></label>
            <button type="button" onClick={startVoiceSearch} disabled={listening} className={`inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition ${listening?"border-gold bg-[#fff8f0] text-gold":"border-line bg-white text-paper hover:border-gold"}`}><MicIcon className="h-4 w-4"/>{listening?"듣고 있어요…":"음성으로 찾기"}</button>
            <button onClick={searchShows} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-paper px-7 text-sm font-black text-white transition hover:bg-gold"><SearchIcon className="h-4 w-4"/>이 조건으로 찾기</button>
          </div>
          {voiceMsg&&<p className="mt-3 rounded-lg bg-surface-raised/70 px-3 py-2 text-xs font-semibold leading-5 text-muted">{voiceMsg}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted">선택 조건</span><Chip icon={<SparkIcon className="h-3.5 w-3.5"/>}>{companion}</Chip><Chip icon={<PinIcon className="h-3.5 w-3.5"/>}>{region}</Chip><Chip icon={<CalendarIcon className="h-3.5 w-3.5"/>}>{periodLabel}</Chip>{genre!=="전체"&&<Chip>{genre}</Chip>}{companion==="아이와 함께"&&childAge&&<Chip>{childAge}</Chip>}{price!=="가격 무관"&&<Chip>{price}</Chip>}</div>
          <p className="mt-3 text-[11px] leading-5 text-muted">{summary} 기준으로 검색합니다. 내 주변은 위치 권한이 허용된 경우 가까운 공연을 우선합니다.</p>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible">
          <Quick label="아이와 이번 주말" onClick={()=>{chooseCompanion("아이와 함께");setTiming("이번 주말");setGenre("아동·가족")}}/>
          <Quick label="데이트 공연" onClick={()=>{chooseCompanion("데이트");setTiming("이번 주말");setGenre("전체")}}/>
          <Quick label="부모님과" onClick={()=>{chooseCompanion("부모님과");setTiming("이번 주말");setGenre("전체")}}/>
          <Quick label="오늘 내 주변" onClick={()=>{setRegion("내 주변");setTiming("오늘")}}/>
        </div>
      </div>

      {searched&&<div className="mt-7 rounded-2xl border border-line bg-white/45 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><strong className="text-sm text-paper">검색 결과 {loading?"":`${results.length}건`}</strong><button onClick={()=>setSearched(false)} className="text-xs text-muted hover:text-paper">접기</button></div>
        {locationMsg&&<p className="mb-4 rounded-lg bg-surface-raised/70 px-3 py-2 text-xs font-semibold text-muted">{locationMsg}</p>}
        {loading?<p className="py-7 text-center text-sm text-muted">공연정보를 찾고 있습니다.</p>:results.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{results.map(show=><ResultCard key={show.id} show={show}/>)}</div>:<Empty/>}
      </div>}
    </div>
  </section>;
}

type SpeechRecognitionLike = {
  lang:string;
  interimResults:boolean;
  maxAlternatives:number;
  onstart:(()=>void)|null;
  onresult:((event:{results:ArrayLike<{[index:number]:{transcript:string}}>} )=>void)|null;
  onerror:(()=>void)|null;
  onend:(()=>void)|null;
  start:()=>void;
};

function MicIcon({className=""}:{className?:string}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4M9 21h6"/></svg>}

function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T;setValue:(v:T)=>void}){return <div><p className="mb-2 text-xs font-black text-paper">{label}</p><div className="flex flex-wrap gap-2">{options.map(o=><button type="button" key={o} onClick={()=>setValue(o)} className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${o===value?"border-paper bg-paper text-white":"border-line bg-white/65 text-muted hover:border-gold/50 hover:text-paper"}`}>{o}</button>)}</div></div>}
function Quick({label,onClick}:{label:string;onClick:()=>void}){return <button type="button" onClick={onClick} className="shrink-0 rounded-full border border-line bg-white/55 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-gold/60 hover:text-paper">{label}</button>}
function Chip({icon,children}:{icon?:ReactNode;children:ReactNode}){return <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised/80 px-2.5 py-1 font-semibold text-paper">{icon}{children}</span>}
function Empty(){return <div className="border-y border-line py-8 text-center"><p className="text-sm font-semibold text-paper">조건에 맞는 현재·예정 공연을 찾지 못했습니다.</p><p className="mt-2 text-xs text-muted">지역이나 날짜를 조금 넓혀 다시 찾아보세요.</p></div>}
function ResultCard({show}:{show:Show}){return <a href={`/show/${encodeURIComponent(show.id)}`} className="group grid grid-cols-[88px_1fr] gap-3 border-b border-line pb-4 sm:block"><div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="sm:pt-3"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm text-paper group-hover:text-gold">{show.title}</b><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p>{show.ageLabel&&<p className="mt-1 text-[11px] text-muted">{show.ageLabel}</p>}<span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-paper">자세히 <ArrowIcon className="h-3.5 w-3.5"/></span></div></a>}
