"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { allShows } from "@/lib/dummy-data";
import { ArrowIcon, CalendarIcon, PinIcon, SearchIcon, SparkIcon, TrendIcon, WellnessIcon } from "@/components/Icons";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주" | "이번 주말" | "다음 달" | "30일 이내";
type Region = "전국" | "서울" | "경기" | "인천" | "부산";
type Travel = "상관없음" | "30분 이내" | "1시간 이내" | "1시간 30분 이내";
type Price = "가격 무관" | "5만원 이하" | "10만원 이하" | "15만원 이하";
type Companion = "누구와든" | "혼자" | "부모님" | "아이와" | "연인·배우자" | "친구";

type InterpretedPrompt = {
  timing: Timing;
  region: Region;
  genre: string;
  travel: Travel;
  price: Price;
  companion: Companion;
  artistQuery: string;
  query: string;
};

const timings: Timing[] = ["오늘", "이번 주", "이번 주말", "다음 달", "30일 이내"];
const regions: Region[] = ["전국", "서울", "경기", "인천", "부산"];
const regionCodes: Record<Region,string> = {전국:"",서울:"11",경기:"41",인천:"28",부산:"26"};
const genres = ["전체", "대중음악", "뮤지컬", "연극", "클래식", "국악", "무용", "아동"];
const travels: Travel[] = ["상관없음", "30분 이내", "1시간 이내", "1시간 30분 이내"];
const prices: Price[] = ["가격 무관", "5만원 이하", "10만원 이하", "15만원 이하"];
const companions: Companion[] = ["누구와든", "혼자", "부모님", "아이와", "연인·배우자", "친구"];

function isEnded(status?: string){ return Boolean(status && (status.includes("완료") || status.includes("종료"))); }

function priceLimit(value:Price){
  if(value==="5만원 이하") return 50000;
  if(value==="10만원 이하") return 100000;
  if(value==="15만원 이하") return 150000;
  return Infinity;
}
function matchesPrice(show:Show, value:Price){
  if(value==="가격 무관" || !show.priceValue) return true;
  return show.priceValue<=priceLimit(value);
}
function matchesCompanion(show:Show, value:Companion){
  if(value==="누구와든" || !show.tags?.length) return true;
  if(value==="부모님") return show.tags.includes("부모님") || show.tags.includes("50+") || show.tags.includes("가족");
  if(value==="아이와") return show.tags.includes("가족") || show.genre.includes("아동");
  if(value==="연인·배우자") return show.tags.includes("데이트");
  return true;
}

function interpretPrompt(prompt:string, current:{timing:Timing;region:Region;genre:string;travel:Travel;price:Price;companion:Companion}):InterpretedPrompt{
  let nextTiming=current.timing, nextRegion=current.region, nextGenre=current.genre, nextTravel=current.travel, nextPrice=current.price, nextCompanion=current.companion;
  const normalized=prompt.trim();

  if(/오늘|지금|오늘밤|오늘\s*저녁/.test(normalized)) nextTiming="오늘";
  else if(/다음\s*달|내달/.test(normalized)) nextTiming="다음 달";
  else if(/이번\s*주말|주말|토요일|일요일/.test(normalized)) nextTiming="이번 주말";
  else if(/이번\s*주|이번주/.test(normalized)) nextTiming="이번 주";
  else if(/다음\s*공연|예정|앞으로|한달|한\s*달|30일/.test(normalized)) nextTiming="30일 이내";

  const foundRegion=regions.find(r=>r!=="전국"&&normalized.includes(r)); if(foundRegion) nextRegion=foundRegion;
  const genreMap:[RegExp,string][]=[[/콘서트|가요|아이돌|k-?pop|트로트/i,"대중음악"],[/뮤지컬/,"뮤지컬"],[/연극/,"연극"],[/클래식|오케스트라|피아노|성악|오페라/,"클래식"],[/국악/,"국악"],[/무용|발레/,"무용"],[/아동|어린이|키즈/,"아동"]];
  const foundGenre=genreMap.find(([rx])=>rx.test(normalized)); if(foundGenre) nextGenre=foundGenre[1];

  if(/30\s*분|삼십\s*분|반\s*시간/.test(normalized)) nextTravel="30분 이내";
  else if(/1\s*시간\s*30\s*분|한\s*시간\s*반|90\s*분/.test(normalized)) nextTravel="1시간 30분 이내";
  else if(/1\s*시간|한\s*시간|60\s*분/.test(normalized)) nextTravel="1시간 이내";

  if(/15\s*만\s*원|십오\s*만\s*원|150,?000\s*원/.test(normalized)) nextPrice="15만원 이하";
  else if(/10\s*만\s*원|십\s*만\s*원|100,?000\s*원/.test(normalized)) nextPrice="10만원 이하";
  else if(/(?:^|\s)5\s*만\s*원|오\s*만\s*원|50,?000\s*원/.test(normalized)) nextPrice="5만원 이하";

  if(/부모님|엄마|아빠|어머니|아버지/.test(normalized)) nextCompanion="부모님";
  else if(/아이|아이들|자녀|아들|딸|어린이/.test(normalized)) nextCompanion="아이와";
  else if(/연인|애인|남자친구|여자친구|남편|아내|배우자|데이트/.test(normalized)) nextCompanion="연인·배우자";
  else if(/친구|동료/.test(normalized)) nextCompanion="친구";
  else if(/혼자|나\s*혼자/.test(normalized)) nextCompanion="혼자";

  const artistMatch=normalized.match(/(?:^|\s)([가-힣A-Za-z0-9&._-]{2,20})(?:의)?\s*(?:공연|콘서트|뮤지컬)/);
  let artistQuery=artistMatch?.[1]?.trim()||"";
  const cleaned=normalized
    .replace(/오늘밤|오늘\s*저녁|오늘|지금|다음\s*달|내달|이번\s*주말|이번주말|주말|토요일|일요일|이번\s*주|이번주|다음\s*공연|예정|앞으로|한달|한\s*달|30일/gi," ")
    .replace(/서울|경기|인천|부산|전국|에서|근처|가까운|주변|볼\s*만한|보고\s*싶은|볼|추천|해줘|찾아줘|찾아|공연|콘서트|뮤지컬|클래식|오케스트라|연극|국악|무용|발레|트로트|k-?pop|아이돌/gi," ")
    .replace(/30\s*분|삼십\s*분|반\s*시간|1\s*시간\s*30\s*분|한\s*시간\s*반|90\s*분|1\s*시간|한\s*시간|60\s*분|안쪽|이내/gi," ")
    .replace(/5\s*만\s*원|오\s*만\s*원|50,?000\s*원|10\s*만\s*원|십\s*만\s*원|100,?000\s*원|15\s*만\s*원|십오\s*만\s*원|150,?000\s*원|이하|미만/gi," ")
    .replace(/부모님|엄마|아빠|어머니|아버지|아이들?|자녀|아들|딸|어린이|연인|애인|남자친구|여자친구|남편|아내|배우자|데이트|친구|동료|혼자|나\s*혼자|함께|같이|랑|와|과/gi," ")
    .replace(/50대|60대|편하게|힐링|좋은|괜찮은/gi," ")
    .replace(/\s+/g," ").trim();
  if(!artistQuery && cleaned && cleaned.split(" ").length<=2) artistQuery=cleaned;
  return {timing:nextTiming,region:nextRegion,genre:nextGenre,travel:nextTravel,price:nextPrice,companion:nextCompanion,artistQuery,query:artistQuery||cleaned};
}

export default function Hero() {
  const [query,setQuery]=useState("");
  const [timing,setTiming]=useState<Timing>("이번 주말");
  const [region,setRegion]=useState<Region>("전국");
  const [genre,setGenre]=useState("전체");
  const [travel,setTravel]=useState<Travel>("상관없음");
  const [price,setPrice]=useState<Price>("가격 무관");
  const [companion,setCompanion]=useState<Companion>("누구와든");
  const [results,setResults]=useState<Show[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [artistMode,setArtistMode]=useState(false);
  const [listening,setListening]=useState(false);
  const [voiceMsg,setVoiceMsg]=useState("");

  const fallback=useMemo(()=>allShows.filter(s=>!isEnded(s.status)).filter(s=>genre==="전체"||s.genre.includes(genre)).filter(s=>region==="전국"||s.region.includes(region)).filter(s=>matchesPrice(s,price)).filter(s=>matchesCompanion(s,companion)).filter(s=>!query.trim()||`${s.title} ${s.artist??""} ${s.venue}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,12),[query,genre,region,price,companion]);
  const parsed=useMemo(()=>interpretPrompt(query,{timing,region,genre,travel,price,companion}),[query,timing,region,genre,travel,price,companion]);

  async function searchShows(q=query, opts?:{timing?:Timing;region?:Region;genre?:string;price?:Price;companion?:Companion}){
    setArtistMode(false); setLoading(true); setSearched(true);
    const activeTiming=opts?.timing??timing, activeRegion=opts?.region??region, activeGenre=opts?.genre??genre, activePrice=opts?.price??price, activeCompanion=opts?.companion??companion;
    try{
      const range=activeTiming==="오늘"?"today":activeTiming==="이번 주"?"week":activeTiming==="이번 주말"?"weekend":activeTiming==="다음 달"?"nextmonth":"30d";
      const p=new URLSearchParams({type:"search",range,rows:"40"});
      if(q.trim())p.set("q",q.trim()); if(regionCodes[activeRegion])p.set("region",regionCodes[activeRegion]);
      const d=await fetch(`/api/kopis?${p}`,{cache:"no-store"}).then(r=>r.json());
      const list:(Show[])=(d?.shows??[]).filter((s:Show)=>!isEnded(s.status)).filter((s:Show)=>activeGenre==="전체"||s.genre?.includes(activeGenre)).filter((s:Show)=>matchesPrice(s,activePrice)).filter((s:Show)=>matchesCompanion(s,activeCompanion));
      setResults(list.slice(0,12));
    }catch{setResults(fallback)}finally{setLoading(false)}
  }

  function smartSearch(prompt:string){
    const next=interpretPrompt(prompt,{timing,region,genre,travel,price,companion});
    setTiming(next.timing);setRegion(next.region);setGenre(next.genre);setTravel(next.travel);setPrice(next.price);setCompanion(next.companion);setQuery(prompt);
    searchShows(next.query,{timing:next.timing,region:next.region,genre:next.genre,price:next.price,companion:next.companion});
  }

  async function searchArtistShows(q:string){
    setArtistMode(true);setLoading(true);setSearched(true);
    try{const d=await fetch(`/api/kopis?${new URLSearchParams({type:"artist",q,rows:"40"})}`,{cache:"no-store"}).then(r=>r.json());setResults(((d?.shows??[]) as Show[]).filter(s=>!isEnded(s.status)).slice(0,24));}
    catch{setResults([])}finally{setLoading(false)}
  }

  function startVoiceSearch(){
    type SpeechResultEvent={results:ArrayLike<{0:{transcript:string};isFinal:boolean}>};
    type SpeechErrorEvent={error?:string};
    type Recognition={lang:string;interimResults:boolean;continuous:boolean;maxAlternatives:number;start:()=>void;stop:()=>void;onstart:(()=>void)|null;onend:(()=>void)|null;onerror:((e:SpeechErrorEvent)=>void)|null;onresult:((e:SpeechResultEvent)=>void)|null};
    type RecognitionCtor=new()=>Recognition;
    const w=window as typeof window & {SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor};
    const Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Ctor){setVoiceMsg("이 브라우저는 음성검색을 지원하지 않습니다. Chrome 또는 Edge에서 이용해보세요.");setTimeout(()=>setVoiceMsg(""),4500);return}
    const recognition=new Ctor();
    recognition.lang="ko-KR"; recognition.interimResults=true; recognition.continuous=false; recognition.maxAlternatives=1;
    recognition.onstart=()=>{setListening(true);setVoiceMsg("듣고 있어요. 원하는 공연을 편하게 말씀해 주세요.")};
    recognition.onresult=(event)=>{
      let transcript=""; let finalText="";
      for(let i=0;i<event.results.length;i++){const r=event.results[i];transcript+=r[0]?.transcript||"";if(r.isFinal)finalText+=r[0]?.transcript||""}
      if(transcript.trim())setQuery(transcript.trim());
      if(finalText.trim()){setVoiceMsg(`“${finalText.trim()}”로 찾아볼게요.`);smartSearch(finalText.trim())}
    };
    recognition.onerror=(event)=>{setListening(false);setVoiceMsg(event.error==="not-allowed"?"마이크 권한이 필요합니다. 브라우저에서 마이크 사용을 허용해 주세요.":"음성을 인식하지 못했습니다. 다시 말씀해 주세요.");setTimeout(()=>setVoiceMsg(""),4000)};
    recognition.onend=()=>setListening(false);
    try{recognition.start()}catch{setListening(false);setVoiceMsg("음성검색을 시작하지 못했습니다. 잠시 후 다시 눌러주세요.")}
  }

  useEffect(()=>{const fn=(e:Event)=>{const detail=(e as CustomEvent<{query?:string;mode?:string}>).detail;const q=detail?.query?.trim();if(!q)return;setQuery(q);if(detail?.mode==="artist")setTimeout(()=>searchArtistShows(q),0);else setTimeout(()=>searchShows(q),0)};window.addEventListener("showday:search",fn);return()=>window.removeEventListener("showday:search",fn)},[]);

  const shown=artistMode?results:(results.length?results:fallback);
  const liveNow=artistMode?shown.filter(s=>s.status?.includes("중")):[];
  const upcoming=artistMode?shown.filter(s=>!s.status?.includes("중")&&!isEnded(s.status)):[];
  const artistGroupsEmpty=artistMode&&liveNow.length===0&&upcoming.length===0;

  return <section id="show-search" className="scroll-mt-24 border-b border-line/80">
    <div className="relative min-h-[330px] overflow-hidden border-b border-line/70 sm:min-h-[410px]">
      <img src="/showday-hero-audience.png" alt="공연을 즐기는 관객" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,16,8,.88)_0%,rgba(37,16,8,.58)_48%,rgba(37,16,8,.18)_100%)]" />
      <div className="relative mx-auto flex min-h-[330px] max-w-[1280px] items-center px-4 py-10 sm:min-h-[410px] sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[.24em] text-[#f3b37f]">SHOWDAY · PERFORMANCE DISCOVERY</p>
          <h1 className="font-display text-[2.15rem] font-black leading-[1.1] text-white sm:text-5xl lg:text-6xl">지금, 나에게 맞는 공연을 찾아보세요<br/><span className="text-[#f3b37f]">취향부터 일정까지, 원하는 조건으로.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/78 sm:text-base">보고 싶은 장르와 날짜, 지역을 고르거나 원하는 상황을 그대로 입력해보세요. SHOWDAY가 현재·예정 공연을 중심으로 찾아드립니다.</p>
          <a href="#quick-search" className="mt-7 inline-flex items-center gap-2 border-b border-[#f3b37f] pb-1 text-sm font-bold text-white">내 공연 찾기 <ArrowIcon className="h-4 w-4"/></a>
        </div>
      </div>
    </div>

    <div id="quick-search" className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-9">
      <div className="border-y border-line bg-surface/65 py-6 sm:py-7">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-semibold tracking-[.18em] text-gold">SMART SEARCH</p><h2 className="mt-2 text-xl font-black leading-7 text-paper sm:text-2xl">원하는 공연을 말해보세요. AI가 조건에 맞춰 찾아드립니다.</h2></div>
          <p className="max-w-md text-xs leading-5 text-muted">날짜·지역·장르·가격·동행자·이동시간까지 공연을 고를 때 중요한 조건을 한곳에서 조정할 수 있습니다.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.55fr_.85fr]">
          <div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><label className="relative"><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&smartSearch(query)} placeholder="예: 이번 주말 부모님과, 1시간 안쪽, 10만원 이하 공연" className="w-full rounded-md border border-line bg-white/55 py-3.5 pl-12 pr-4 text-sm text-paper outline-none transition focus:border-gold focus:bg-white"/></label><button type="button" onClick={startVoiceSearch} aria-label="음성으로 공연 찾기" className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3.5 text-sm font-bold transition ${listening?"border-gold bg-gold/10 text-gold":"border-line bg-white/45 text-paper hover:border-gold"}`}><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4M9 21h6"/></svg>{listening?"듣는 중":"음성 찾기"}</button><button onClick={()=>smartSearch(query)} className="inline-flex items-center justify-center gap-2 rounded-md bg-paper px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gold"><SearchIcon className="h-4 w-4"/>공연 찾기</button></div>
            {voiceMsg&&<p className={`mt-2 text-xs font-semibold ${listening?"text-gold":"text-muted"}`}>{voiceMsg}</p>}
            {query.trim() && <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted">SHOWDAY 해석</span><Chip icon={<CalendarIcon className="h-3.5 w-3.5"/>}>{parsed.timing}</Chip><Chip icon={<PinIcon className="h-3.5 w-3.5"/>}>{parsed.region}</Chip><Chip icon={<SparkIcon className="h-3.5 w-3.5"/>}>{parsed.genre}</Chip><Chip>{parsed.price}</Chip><Chip>{parsed.companion}</Chip><Chip>{parsed.travel}</Chip>{parsed.artistQuery&&<Chip>아티스트 · {parsed.artistQuery}</Chip>}</div>}
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"><Choice label="언제" options={timings} value={timing} setValue={setTiming}/><Choice label="어디서" options={regions} value={region} setValue={setRegion}/><Choice label="무엇을" options={genres} value={genre} setValue={setGenre}/><Choice label="가격" options={prices} value={price} setValue={setPrice}/><Choice label="누구와" options={companions} value={companion} setValue={setCompanion}/><Choice label="이동시간" options={travels} value={travel} setValue={setTravel}/></div><p className="mt-3 text-[11px] leading-5 text-muted">음성이나 문장으로 말하면 위 조건이 자동으로 바뀝니다. 이동시간은 현재 위치와 공연장 경로를 계산하는 지도 연동 후 정확하게 적용됩니다.</p>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible"><Quick icon={<TrendIcon className="h-4 w-4"/>} label="지금 인기" onClick={()=>document.getElementById("popular-now")?.scrollIntoView({behavior:"smooth"})}/><Quick icon={<CalendarIcon className="h-4 w-4"/>} label="이번 주말" onClick={()=>{setTiming("이번 주말");searchShows("",{timing:"이번 주말"})}}/><Quick icon={<PinIcon className="h-4 w-4"/>} label="서울 공연" onClick={()=>{setRegion("서울");searchShows("",{region:"서울"})}}/><Quick icon={<WellnessIcon className="h-4 w-4"/>} label="50+ 라이프" onClick={()=>document.getElementById("fiftyplus")?.scrollIntoView({behavior:"smooth"})}/></div>
          </div>
          <aside className="border-l-0 border-line pl-0 lg:border-l lg:pl-6">
            <div className="flex items-start gap-3"><span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold"><SparkIcon className="h-4 w-4"/></span><div><p className="text-sm font-black text-paper">SHOWDAY Guide</p><p className="mt-1 text-xs leading-5 text-muted">정확한 검색어를 몰라도 괜찮습니다. 직접 입력하거나 마이크를 눌러 상황을 그대로 말씀해보세요.</p></div></div>
            <div className="mt-4 divide-y divide-line border-y border-line">{["박서진 공연 서울에서 다음 달에 하는 거 찾아줘","이번 주말 부모님과 볼 공연, 1시간 이내","10만원 이하 서울 뮤지컬","아이와 30분 안쪽 공연"].map(ex=><button key={ex} onClick={()=>smartSearch(ex)} className="flex w-full items-center justify-between gap-3 py-3 text-left text-xs font-medium text-paper hover:text-gold"><span>{ex}</span><ArrowIcon className="h-4 w-4 shrink-0"/></button>)}</div>
            {isAuthConfigured&&<button onClick={signInWithKakao} className="mt-4 text-xs font-semibold text-muted underline underline-offset-4 hover:text-paper">로그인하고 관심 공연 저장하기</button>}
          </aside>
        </div>

        {searched && <div className="mt-7 border-t border-line pt-6"><div className="mb-4 flex justify-between"><strong className="text-sm text-paper">{artistMode?`'${query}' 현재·예정 공연`:"검색 결과"} {loading?"":`${shown.length}건`}</strong><button onClick={()=>setSearched(false)} className="text-xs text-muted hover:text-paper">접기</button></div>{loading?<p className="text-sm text-muted">공연정보를 불러오는 중입니다.</p>:artistMode?(artistGroupsEmpty?<Empty/>:<div className="flex flex-col gap-6">{liveNow.length>0&&<ResultGroup label="지금 공연 중" shows={liveNow}/>} {upcoming.length>0&&<ResultGroup label="예정 공연" shows={upcoming}/>}</div>):shown.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shown.map(show=><ResultCard key={show.id} show={show}/>)}</div>:<Empty/>}</div>}
      </div>
    </div>
  </section>
}
function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T;setValue:(v:T)=>void}){return <div><p className="mb-2 text-[11px] font-semibold text-muted">{label}</p><div className="flex flex-wrap gap-x-3 gap-y-2">{options.map(o=><button key={o} onClick={()=>setValue(o)} className={`border-b pb-1 text-xs transition ${o===value?"border-gold font-bold text-paper":"border-transparent text-muted hover:text-paper"}`}>{o}</button>)}</div></div>}
function Quick({icon,label,onClick}:{icon:ReactNode;label:string;onClick:()=>void}){return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/35 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-gold/60 hover:text-paper">{icon}{label}</button>}
function Chip({icon,children}:{icon?:ReactNode;children:ReactNode}){return <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised/70 px-2.5 py-1 font-semibold text-paper">{icon}{children}</span>}
function Empty(){return <div className="border-y border-line py-7 text-center"><p className="text-sm font-semibold text-paper">현재·예정 공연을 찾지 못했습니다.</p><p className="mt-2 text-xs text-muted">날짜나 지역을 넓혀 다시 찾아보세요.</p></div>}
function ResultCard({show}:{show:Show}){return <a href={`/show/${encodeURIComponent(show.id)}`} className="group grid grid-cols-[88px_1fr] gap-3 border-b border-line pb-4 sm:block"><div className="aspect-[3/4] overflow-hidden bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="sm:pt-3"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm text-paper group-hover:text-gold">{show.title}</b><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-paper">공연정보 <ArrowIcon className="h-3.5 w-3.5"/></span></div></a>}
function ResultGroup({label,shows}:{label:string;shows:Show[]}){return <div><p className="mb-3 text-xs font-bold text-gold">{label} · {shows.length}건</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shows.map(show=><ResultCard key={show.id} show={show}/>)}</div></div>}
