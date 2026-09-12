"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowIcon, CalendarIcon, PinIcon, SearchIcon, SparkIcon } from "@/components/common/Icons";
import type { Show } from "@/types/show";

type Timing = "오늘" | "이번 주말" | "이번 주" | "이번 달" | "날짜 선택";
type Region = "내 주변" | "서울" | "경기" | "인천" | "부산" | "전국";
type Companion = "상관없음" | "아이와" | "연인과" | "친구·부부" | "부모님과" | "혼자";
type ChildAge = "1세" | "2세" | "3세" | "4세" | "5세" | "6세" | "7세" | "8세" | "9세" | "10세" | "11세" | "12세" | "13세";
type Price = "1만원 이하" | "3만원 이하" | "5만원 이하" | "10만원 이하";
type Discovery = "전체" | "지금 예매 가능" | "곧 티켓오픈" | "무료 공연·행사" | "가격대별";

const timings: Timing[] = ["오늘", "이번 주말", "이번 주", "이번 달", "날짜 선택"];
const regions: Region[] = ["내 주변", "서울", "경기", "인천", "부산", "전국"];
const companions: Companion[] = ["상관없음", "아이와", "연인과", "친구·부부", "부모님과", "혼자"];
const childAges: ChildAge[] = ["1세", "2세", "3세", "4세", "5세", "6세", "7세", "8세", "9세", "10세", "11세", "12세", "13세"];
const genres = ["전체", "콘서트", "뮤지컬", "연극", "클래식", "전시회", "축제", "체험·가족행사"] as const;
const prices: Price[] = ["1만원 이하", "3만원 이하", "5만원 이하", "10만원 이하"];
const discoveries: Discovery[] = ["전체", "지금 예매 가능", "곧 티켓오픈", "무료 공연·행사", "가격대별"];
const regionCodes: Record<Exclude<Region, "내 주변">, string> = { 서울:"11", 경기:"41", 인천:"28", 부산:"26", 전국:"" };

function todayLocalYmd(){ const d=new Date(); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; }
function isEnded(show:Show){
  const status=String(show.status||"");
  return status.includes("완료") || status.includes("종료") || status==="03" || Boolean(show.endDate && /^\d{8}$/.test(show.endDate) && show.endDate<todayLocalYmd());
}
function priceLimit(value:Price){
  if(value==="1만원 이하") return 10000;
  if(value==="3만원 이하") return 30000;
  if(value==="5만원 이하") return 50000;
  return 100000;
}
function matchesPrice(show:Show, value:Price){
  if(/무료/.test(show.priceLabel||"")) return true;
  return Boolean(show.priceValue) && show.priceValue<=priceLimit(value);
}
function matchesDiscovery(show:Show, value:Discovery, price:Price){
  if(value==="전체") return true;
  if(value==="지금 예매 가능") return Boolean(show.bookingUrl);
  if(value==="곧 티켓오픈") return Boolean(show.tags?.includes("티켓오픈임박"));
  if(value==="무료 공연·행사") return /무료/.test(show.priceLabel||"");
  return matchesPrice(show,price);
}
function matchesCompanion(show:Show, value:Companion){
  if(value==="상관없음") return true;
  if(value==="아이와") return show.tags?.includes("가족") || /아동|어린이|가족/.test(`${show.genre} ${show.title}`);
  if(value==="연인과") return show.tags?.includes("데이트") || /뮤지컬|연극|콘서트|대중|전시/.test(show.genre);
  if(value==="부모님과") return show.tags?.includes("부모님") || show.tags?.includes("50+") || /클래식|국악|콘서트/.test(show.genre);
  return true;
}
function genreMatches(show:Show, genre:string){
  if(genre==="전체") return true;
  if(genre==="콘서트") return /콘서트|대중음악|대중/.test(show.genre);
  if(genre==="클래식") return /클래식|서양음악|오페라|독주|독창|관현악|실내악/.test(show.genre);
  if(genre==="전시회") return /전시|미술|박람회|아트|갤러리/.test(`${show.genre} ${show.title}`);
  if(genre==="축제") return /축제|페스티벌/.test(`${show.genre} ${show.title}`);
  if(genre==="체험·가족행사") return /체험|아동|어린이|가족|키즈/.test(`${show.genre} ${show.title}`) || show.tags?.includes("가족");
  return show.genre?.includes(genre);
}
function minAllowedAge(label?:string){
  if(!label) return null;
  if(/전체\s*관람|전체관람/.test(label)) return 0;
  const m=label.match(/(\d+)\s*세/);
  return m ? Number(m[1]) : null;
}
function childAgeMatches(show:Show, value:ChildAge|null){
  if(!value) return false;
  const minAge=minAllowedAge(show.ageLabel);
  if(minAge===null) return false; // 아이와 검색은 관람연령이 확인된 공연만 노출
  const childAge=Number(value.replace("세",""));
  return minAge<=childAge;
}
function toIsoDate(d:Date){
  const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

export default function Hero(){
  const [query,setQuery]=useState("");
  const [companion,setCompanion]=useState<Companion>("상관없음");
  const [region,setRegion]=useState<Region>("내 주변");
  const [timing,setTiming]=useState<Timing>("이번 주말");
  const [customDate,setCustomDate]=useState(toIsoDate(new Date()));
  const [genre,setGenre]=useState<(typeof genres)[number]>("전체");
  const [childAge,setChildAge]=useState<ChildAge|null>(null);
  const [discovery,setDiscovery]=useState<Discovery>("전체");
  const [price,setPrice]=useState<Price>("3만원 이하");
  const [results,setResults]=useState<Show[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [locationMsg,setLocationMsg]=useState("");
  const [listening,setListening]=useState(false);
  const [voiceMsg,setVoiceMsg]=useState("");



  function chooseCompanion(v:Companion){
    setCompanion(v);
    if(v!=="아이와") setChildAge(null);
  }

  function applyVoiceCommand(text:string){
    const t=text.replace(/\s+/g," ").trim();
    setQuery("");

    if(/아이|아들|딸|자녀|어린이|가족/.test(t)) chooseCompanion("아이와");
    else if(/데이트|여자친구|남자친구|연인/.test(t)) chooseCompanion("연인과");
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
    else if(/이번\s*주/.test(t)) setTiming("이번 주");
    else if(/이번\s*달|이달/.test(t)) setTiming("이번 달");

    if(/뮤지컬/.test(t)) setGenre("뮤지컬");
    else if(/연극/.test(t)) setGenre("연극");
    else if(/클래식|오페라|관현악|실내악/.test(t)) setGenre("클래식");
    else if(/전시|전시회|미술|박람회|갤러리/.test(t)) setGenre("전시회");
    else if(/축제|페스티벌/.test(t)) setGenre("축제");
    else if(/체험|아동|어린이|가족|키즈/.test(t)) setGenre("체험·가족행사");
    else if(/콘서트|공연/.test(t)) setGenre("콘서트");

    const age=t.match(/(\d{1,2})\s*살|((?:\d{1,2}))\s*세/);
    const n=age?Number(age[1]||age[2]):null;
    if(n!==null && n>=1 && n<=13){
      chooseCompanion("아이와");
      setChildAge(`${n}세` as ChildAge);
    }

    if(/무료/.test(t)) setDiscovery("무료 공연·행사");
    else if(/티켓\s*오픈|예매\s*오픈/.test(t)) setDiscovery("곧 티켓오픈");
    else if(/예매\s*가능/.test(t)) setDiscovery("지금 예매 가능");
    else if(/1\s*만\s*원|만원/.test(t)){ setDiscovery("가격대별"); setPrice("1만원 이하"); }
    else if(/3\s*만\s*원|삼만원/.test(t)){ setDiscovery("가격대별"); setPrice("3만원 이하"); }
    else if(/5\s*만\s*원|오만원/.test(t)){ setDiscovery("가격대별"); setPrice("5만원 이하"); }
    else if(/10\s*만\s*원|십만원/.test(t)){ setDiscovery("가격대별"); setPrice("10만원 이하"); }

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
    if(companion==="아이와" && !childAge){
      setVoiceMsg("아이와 볼 공연을 찾으려면 아이 나이를 먼저 선택해주세요.");
      document.getElementById("child-age-filter")?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }
    setLoading(true); setSearched(true); setLocationMsg("");
    try{
      const p=new URLSearchParams({type:"search",rows:"60"});
      if(query.trim()) p.set("q",query.trim());
      if(region!=="내 주변" && regionCodes[region]) p.set("region",regionCodes[region]);
      if(timing==="오늘") p.set("range","today");
      else if(timing==="이번 주말") p.set("range","weekend");
      else if(timing==="이번 주") p.set("range","week");
      else if(timing==="이번 달") p.set("range","month");
      else { p.set("range","date"); p.set("date",customDate); }

      const data=await fetch(`/api/kopis?${p.toString()}`,{cache:"no-store"}).then(r=>r.json());
      let list:Show[]=(data?.shows??[])
        .filter((s:Show)=>!isEnded(s))
        .filter((s:Show)=>genreMatches(s,genre))
        .filter((s:Show)=>matchesDiscovery(s,discovery,price))
        .filter((s:Show)=>matchesCompanion(s,companion))
        .filter((s:Show)=>companion!=="아이와"||childAgeMatches(s,childAge));

      if(region==="내 주변"){
        // 이전 버그: list.length가 0이면(=KOPIS_API_KEY 미설정 등으로 검색 결과가 아직 없으면)
        // 아래 블록 자체가 실행되지 않아 getCurrentPosition이 호출되지 않았고,
        // 그 결과 브라우저 위치 권한 창이 아예 뜨지 않았다. "내 주변"을 선택해 검색한
        // 이상 위치는 항상 확인해야 하므로, 결과 유무와 무관하게 위치부터 요청한다.
        try{
          setLocationMsg("현재 위치를 확인하고 있습니다. 위치 권한 요청 창이 뜨면 '허용'을 눌러주세요.");
          const pos=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:7000,maximumAge:300000}));
          if(list.length){
            const candidates=list.slice(0,24);
            const tt=await fetch("/api/travel-times",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:{lat:pos.coords.latitude,lng:pos.coords.longitude},venues:candidates.map(s=>({id:s.id,name:s.venue,region:s.region}))})}).then(r=>r.json());
            if(tt?.configured===false){
              setLocationMsg("내 주변 검색을 사용하려면 Vercel에 KAKAO_REST_API_KEY를 설정해주세요.");
              list=[];
            }else{
              const times=tt?.times||{};
              const withDistance=candidates
                .map(s=>({show:s,distanceKm:times[s.id]?.distanceKm as number|null|undefined}))
                .filter(x=>typeof x.distanceKm==="number")
                .sort((a,b)=>(a.distanceKm??999)-(b.distanceKm??999));
              const nearby=withDistance.filter(x=>(x.distanceKm??999)<=30);
              list=(nearby.length?nearby:withDistance.slice(0,12)).map(x=>({
                ...x.show,
                distanceFromDobongKm:x.distanceKm??x.show.distanceFromDobongKm,
              }));
              setLocationMsg(nearby.length
                ? `현재 위치 기준 30km 이내 공연 ${nearby.length}건을 가까운 순으로 보여드립니다.`
                : "30km 이내 공연이 없어 현재 위치에서 가까운 공연부터 보여드립니다.");
            }
          }else{
            setLocationMsg("현재 위치는 확인했지만, 조건에 맞는 공연을 찾지 못했습니다. 조건을 넓혀 다시 찾아보세요.");
          }
        }catch{
          setLocationMsg("위치 권한을 허용하면 내 주변 공연을 더 정확하게 찾을 수 있습니다.");
        }
      }
      setResults(list.slice(0,12));
    }catch{
      setResults([]);
    }finally{ setLoading(false); }
  }

  const periodLabel=timing==="날짜 선택"?customDate:timing;
  const summary=[companion!=="상관없음"?companion:null, periodLabel, region, genre!=="전체"?genre:null, companion==="아이와"&&childAge?childAge:null, discovery!=="전체"?discovery:null, discovery==="가격대별"?price:null].filter(Boolean).join(" · ");

  return <section id="show-search" className="border-b border-line bg-surface">
    <div className="relative overflow-hidden bg-[#512a20]">
      <div className="absolute inset-0 opacity-40"><img src="/showday-hero-audience.png" alt="" className="h-full w-full object-cover"/></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#422118]/95 via-[#512a20]/82 to-[#512a20]/38"/>
      <div className="relative mx-auto flex min-h-[330px] max-w-[1280px] items-center px-4 py-14 sm:px-6 lg:min-h-[390px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[.24em] text-[#f3b37f]">SHOWDAY · 내게 맞는 공연 찾기</p>
          <h1 className="font-display font-black leading-[1.08]">
            <span className="block text-[clamp(1.55rem,7vw,3.8rem)] text-white sm:whitespace-nowrap">누구와, 언제, 어디서 무엇을 볼까요?</span>
            <span className="mt-2 block text-[clamp(1.08rem,5vw,3rem)] leading-[1.2] text-[#f3b37f] sm:whitespace-nowrap">내 주변 공연·행사를 쉽게 찾아보세요.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[clamp(12px,1.45vw,16px)] leading-6 text-white/80">아이와, 연인과, 부모님과. 복잡한 검색 대신 목적에 맞는 조건을 고르면 <strong className="font-black text-white">SHOWDAY</strong>가 볼 만한 공연을 찾아드립니다.</p>
          <a href="#quick-search" className="mt-7 inline-flex items-center gap-2 border-b border-[#f3b37f] pb-1 text-sm font-bold text-white">바로 찾기 <ArrowIcon className="h-4 w-4"/></a>
        </div>
      </div>
    </div>

    <div id="quick-search" className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="rounded-2xl border border-line bg-white/55 p-4 shadow-sm sm:p-6">
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[.18em] text-gold">EASY SEARCH</p>
          <h2 className="mt-2 text-xl font-black text-paper sm:text-2xl">내 목적에 맞는 공연을 찾아보세요.</h2>
          <p className="mt-1 text-xs leading-5 text-muted">누구와 · 언제 · 어디서 · 무엇을 · 어떤 공연을 찾는지 순서대로 고르세요.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Choice label="1. 누구와" options={companions} value={companion} setValue={chooseCompanion}/>
          <div>
            <Choice label="2. 언제" options={timings} value={timing} setValue={setTiming}/>
            {timing==="날짜 선택"&&<label className="mt-3 flex max-w-[280px] items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5"><CalendarIcon className="h-4 w-4 shrink-0 text-gold"/><input type="date" value={customDate} min={toIsoDate(new Date())} onChange={e=>setCustomDate(e.target.value)} className="min-w-0 w-full bg-transparent text-sm font-semibold text-paper outline-none"/></label>}
          </div>
          <Choice label="3. 어디서" options={regions} value={region} setValue={setRegion}/>
          <Choice label="4. 무엇을" options={genres} value={genre} setValue={setGenre}/>
          <div className="lg:col-span-2">
            <Choice label="5. 어떤 공연" options={discoveries} value={discovery} setValue={setDiscovery}/>
            {discovery==="가격대별"&&<div className="mt-3 rounded-xl border border-line bg-surface-raised/45 p-3 sm:p-4"><Choice label="가격대 선택" options={prices} value={price} setValue={setPrice}/></div>}
            {discovery==="곧 티켓오픈"&&<p className="mt-2 text-[11px] leading-5 text-muted">티켓오픈 일정이 확인된 공연만 보여드립니다. 등록된 티켓오픈 정보가 없으면 결과가 없을 수 있습니다.</p>}
          </div>
        </div>

        {companion==="아이와"&&<div id="child-age-filter" className="mt-5 rounded-2xl border border-[#d9b89f] bg-[#fff8f0] p-4 sm:p-5"><Choice label="아이 나이는 몇 살인가요?" options={childAges} value={childAge} setValue={setChildAge}/><p className="mt-2 text-[11px] font-semibold leading-5 text-[#7b5a45]">선택한 나이에 실제 관람 가능한 것으로 확인된 공연만 보여드립니다. 관람연령 정보가 없는 공연은 아이와 검색에서 제외합니다.</p></div>}

        <div className="mt-6 border-t border-line pt-5">
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative"><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchShows()} placeholder="공연명·아티스트를 입력하거나 음성으로 말해보세요" className="w-full rounded-xl border border-line bg-white py-3.5 pl-12 pr-4 text-sm text-paper outline-none transition focus:border-gold"/></label>
            <button type="button" onClick={startVoiceSearch} disabled={listening} className={`inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition ${listening?"border-gold bg-[#fff8f0] text-gold":"border-line bg-white text-paper hover:border-gold"}`}><MicIcon className="h-4 w-4"/>{listening?"듣고 있어요…":"음성으로 찾기"}</button>
            <button onClick={searchShows} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-paper px-7 text-sm font-black text-white transition hover:bg-gold"><SearchIcon className="h-4 w-4"/>이 조건으로 찾기</button>
          </div>
          {voiceMsg&&<p className="mt-3 rounded-lg bg-surface-raised/70 px-3 py-2 text-xs font-semibold leading-5 text-muted">{voiceMsg}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted">선택 조건</span>{companion!=="상관없음"&&<Chip icon={<SparkIcon className="h-3.5 w-3.5"/>}>{companion}</Chip>}<Chip icon={<PinIcon className="h-3.5 w-3.5"/>}>{region}</Chip><Chip icon={<CalendarIcon className="h-3.5 w-3.5"/>}>{periodLabel}</Chip>{genre!=="전체"&&<Chip>{genre}</Chip>}{companion==="아이와"&&childAge&&<Chip>{childAge}</Chip>}{discovery!=="전체"&&<Chip>{discovery}</Chip>}{discovery==="가격대별"&&<Chip>{price}</Chip>}</div>
          <p className="mt-3 text-[11px] leading-5 text-muted">{summary} 기준으로 검색합니다. 아이와 검색은 관람연령이 확인된 공연만, 내 주변은 위치 권한이 허용된 경우 가까운 공연을 우선합니다.</p>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible">
          <Quick label="아이와 이번 주말" onClick={()=>{chooseCompanion("아이와");setTiming("이번 주말");setGenre("체험·가족행사");setDiscovery("전체")}}/>
          <Quick label="무료 공연·행사" onClick={()=>{setDiscovery("무료 공연·행사");setGenre("전체")}}/>
          <Quick label="부모님과 이번 주말" onClick={()=>{chooseCompanion("부모님과");setTiming("이번 주말");setGenre("전체");setDiscovery("전체")}}/>
          <Quick label="오늘 내 주변" onClick={()=>{setRegion("내 주변");setTiming("오늘");setDiscovery("전체")}}/>
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

function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T|null;setValue:(v:T)=>void}){return <div><p className="mb-2 text-xs font-black text-paper">{label}</p><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">{options.map(o=><button type="button" key={o} onClick={()=>setValue(o)} className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition sm:min-h-0 ${o===value?"border-paper bg-paper text-white shadow-sm":"border-line bg-white/70 text-muted hover:border-gold/50 hover:text-paper"}`}>{o}</button>)}</div></div>}
function Quick({label,onClick}:{label:string;onClick:()=>void}){return <button type="button" onClick={onClick} className="shrink-0 rounded-full border border-line bg-white/55 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-gold/60 hover:text-paper">{label}</button>}
function Chip({icon,children}:{icon?:ReactNode;children:ReactNode}){return <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised/80 px-2.5 py-1 font-semibold text-paper">{icon}{children}</span>}
function Empty(){return <div className="border-y border-line py-8 text-center"><p className="text-sm font-semibold text-paper">조건에 맞는 현재·예정 공연을 찾지 못했습니다.</p><p className="mt-2 text-xs text-muted">지역이나 날짜를 조금 넓혀 다시 찾아보세요.</p></div>}
function ResultCard({show}:{show:Show}){const hasPrice=show.priceLabel&&show.priceLabel!=="가격 정보 없음";const hasDistance=Number.isFinite(show.distanceFromDobongKm)&&show.distanceFromDobongKm<999;return <a href={`/show/${encodeURIComponent(show.id)}`} className="group grid grid-cols-[88px_1fr] gap-3 border-b border-line pb-4 sm:block"><div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="sm:pt-3"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm text-paper group-hover:text-gold">{show.title}</b><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p><div className="mt-2 flex flex-wrap items-center gap-1.5"><span className="rounded-md bg-[#fff5ea] px-2 py-1 text-[11px] font-black text-paper">{hasPrice?show.priceLabel:"가격 상세 확인"}</span>{hasDistance&&<span className="rounded-md bg-surface-raised px-2 py-1 text-[11px] font-bold text-muted">내 위치에서 {show.distanceFromDobongKm<1?`${Math.round(show.distanceFromDobongKm*1000)}m`:`${show.distanceFromDobongKm.toFixed(1)}km`}</span>}</div>{show.ageLabel&&show.ageLabel!=="관람등급 정보 없음"&&<p className="mt-2 text-[11px] text-muted">{show.ageLabel}</p>}<span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-paper">자세히 <ArrowIcon className="h-3.5 w-3.5"/></span></div></a>}
