"use client";

import { useEffect, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { ArrowIcon, CalendarIcon, PinIcon, SearchIcon, SparkIcon } from "@/components/common/Icons";
import type { Show } from "@/types/show";
import type { ShowdayEvent } from "@/lib/events/eventTypes";

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
  // 아이와 검색은 장르/제목의 '가족·어린이' 키워드로 공연 자체를 제외하지 않는다.
  // 실제 관람 가능 여부는 childAgeMatches()에서 연령 기준으로 안전하게 거른 뒤,
  // 가족 친화 공연은 showPurposeScore()로 위에 정렬한다.
  if(value==="아이와") return true;
  if(value==="연인과"){
    const text=`${show.title||""} ${show.genre||""} ${(show.tags||[]).join(" ")}`;
    if(/유아|어린이|아동|키즈|가족전용|가족뮤지컬/.test(text)) return false;
    return show.tags?.includes("데이트") || /뮤지컬|연극|콘서트|대중|전시|클래식/.test(show.genre);
  }
  if(value==="부모님과"){
    const text=`${show.title||""} ${show.genre||""} ${(show.tags||[]).join(" ")}`;
    if(/유아|어린이전용|키즈/.test(text)) return false;
    return show.tags?.includes("부모님") || show.tags?.includes("50+") || /클래식|국악|콘서트|연극|뮤지컬/.test(show.genre);
  }
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
  const text=label.replace(/\s+/g," ").trim();
  if(/전체\s*관람|전체관람|전 연령|전연령/.test(text)) return 0;
  const month=text.match(/(\d+)\s*개월/);
  if(month) return Math.ceil(Number(month[1])/12);
  const year=text.match(/(?:만\s*)?(\d+)\s*세/);
  if(year) return Number(year[1]);
  if(/초등학생\s*이상|초등\s*이상/.test(text)) return 7;
  if(/중학생\s*이상|중등\s*이상/.test(text)) return 13;
  return null;
}
function showPurposeScore(show:Show,value:Companion){
  const text=`${show.genre||""} ${show.title||""} ${(show.tags||[]).join(" ")}`;
  let score=0;
  if(show.bookingUrl) score+=2;
  if(show.posterUrl) score+=1;
  if(value==="아이와"){
    if(show.tags?.includes("가족")) score+=12;
    if(/어린이|아동|가족|키즈|동화|인형극|마술/.test(text)) score+=10;
    if(/뮤지컬|연극|클래식|국악|콘서트/.test(text)) score+=3;
    const minAge=minAllowedAge(show.ageLabel);
    if(minAge===0) score+=5;
  }
  return score;
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
const SEARCH_STATE_KEY="showday:search-state:v3";
function haversineKm(a:{lat:number;lng:number},b:{lat:number;lng:number}){
  const R=6371,rad=(n:number)=>n*Math.PI/180;
  const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
  const z=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z));
}
function eventPoint(e:ShowdayEvent){
  const lat=Number(e.lat),lng=Number(e.lng);
  return Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
}
function childFocusedEvent(e:ShowdayEvent){
  const text=`${e.category||""} ${e.subcategory||""} ${e.title||""} ${e.target||""} ${e.description||""}`;
  return /유아|어린이|아동|키즈|초등|청소년|가족\s*(체험|프로그램|교실|행사)|부모와\s*아이/.test(text);
}

export default function Hero({onSearchStateChange}:{onSearchStateChange?:(searched:boolean)=>void}={}){
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
  const [eventResults,setEventResults]=useState<ShowdayEvent[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [locationMsg,setLocationMsg]=useState("");
  const [userLocation,setUserLocation]=useState<{lat:number;lng:number}|null>(null);
  const [listening,setListening]=useState(false);
  const [voiceMsg,setVoiceMsg]=useState("");
  const [restored,setRestored]=useState(false);

  useEffect(()=>{
    try{
      const raw=sessionStorage.getItem(SEARCH_STATE_KEY);
      if(raw){
        const saved=JSON.parse(raw);
        if(saved?.savedAt && Date.now()-saved.savedAt<6*60*60*1000){
          if(typeof saved.query==="string") setQuery(saved.query);
          if(saved.companion) setCompanion(saved.companion);
          if(saved.region) setRegion(saved.region);
          if(saved.timing) setTiming(saved.timing);
          if(saved.customDate) setCustomDate(saved.customDate);
          if(saved.genre) setGenre(saved.genre);
          if(saved.childAge!==undefined) setChildAge(saved.childAge);
          if(saved.discovery) setDiscovery(saved.discovery);
          if(saved.price) setPrice(saved.price);
          if(Array.isArray(saved.results)) setResults(saved.results);
          if(Array.isArray(saved.eventResults)) setEventResults(saved.eventResults);
          if(saved.userLocation) setUserLocation(saved.userLocation);
          if(typeof saved.locationMsg==="string") setLocationMsg(saved.locationMsg);
          if(saved.searched){ setSearched(true); onSearchStateChange?.(true); }
        }
      }
    }catch{}
    setRestored(true);
  },[onSearchStateChange]);

  useEffect(()=>{
    if(!restored)return;
    try{
      sessionStorage.setItem(SEARCH_STATE_KEY,JSON.stringify({
        savedAt:Date.now(),query,companion,region,timing,customDate,genre,childAge,discovery,price,
        results,eventResults:eventResults.map(e=>({...e,raw:undefined})),searched,userLocation,locationMsg
      }));
    }catch{}
  },[restored,query,companion,region,timing,customDate,genre,childAge,discovery,price,results,eventResults,searched,userLocation,locationMsg]);

  function chooseCompanion(v:Companion){
    setCompanion(v);
    if(v!=="아이와") setChildAge(null);
  }

  async function requestCurrentLocation(){
    if(!navigator.geolocation){
      setLocationMsg("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
      return null;
    }
    if(userLocation) return userLocation;
    try{
      setLocationMsg("현재 위치를 확인하고 있습니다. 위치 권한 요청 창이 뜨면 '허용'을 눌러주세요.");
      const pos=await new Promise<GeolocationPosition>((resolve,reject)=>
        navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:8000,maximumAge:300000,enableHighAccuracy:false})
      );
      const next={lat:pos.coords.latitude,lng:pos.coords.longitude};
      setUserLocation(next);
      setLocationMsg("현재 위치를 확인했습니다. 검색하면 가까운 공연부터 보여드립니다.");
      return next;
    }catch{
      setLocationMsg("위치 권한을 허용하면 내 주변 공연을 가까운 순으로 찾을 수 있습니다.");
      return null;
    }
  }

  function chooseRegion(v:Region){
    setRegion(v);
    if(v==="내 주변") void requestCurrentLocation();
    else setLocationMsg("");
  }

  function applyVoiceCommand(text:string){
    const t=text.replace(/\s+/g," ").trim();
    setQuery("");

    if(/아이|아들|딸|자녀|어린이|가족/.test(t)) chooseCompanion("아이와");
    else if(/데이트|여자친구|남자친구|연인/.test(t)) chooseCompanion("연인과");
    else if(/부모님|엄마|아빠|어머니|아버지/.test(t)) chooseCompanion("부모님과");
    else if(/친구|부부|배우자|남편|아내/.test(t)) chooseCompanion("친구·부부");
    else if(/혼자|나홀로/.test(t)) chooseCompanion("혼자");

    if(/내 주변|근처|가까운 곳|주변/.test(t)) chooseRegion("내 주변");
    else if(/서울/.test(t)) chooseRegion("서울");
    else if(/경기|경기도/.test(t)) chooseRegion("경기");
    else if(/인천/.test(t)) chooseRegion("인천");
    else if(/부산/.test(t)) chooseRegion("부산");
    else if(/전국/.test(t)) chooseRegion("전국");

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
    setLoading(true); setSearched(true); onSearchStateChange?.(true); setLocationMsg("");
    try{
      const p=new URLSearchParams({type:"search",rows:"80"});
      if(query.trim()) p.set("q",query.trim());
      if(region!=="내 주변" && regionCodes[region]) p.set("region",regionCodes[region]);
      if(timing==="오늘") p.set("range","today");
      else if(timing==="이번 주말") p.set("range","weekend");
      else if(timing==="이번 주") p.set("range","week");
      else if(timing==="이번 달") p.set("range","month");
      else { p.set("range","date"); p.set("date",customDate); }

      const eventParams=new URLSearchParams({rows:"240"});
      if(query.trim()) eventParams.set("q",query.trim());
      if(region!=="내 주변") eventParams.set("region",region);
      const [data,eventData]=await Promise.all([
        fetch(`/api/kopis?${p.toString()}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({shows:[]})),
        fetch(`/api/events/search?${eventParams.toString()}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({events:[]}))
      ]);

      let list:Show[]=(data?.shows??[])
        .filter((s:Show)=>!isEnded(s))
        .filter((s:Show)=>genreMatches(s,genre))
        .filter((s:Show)=>matchesDiscovery(s,discovery,price))
        .filter((s:Show)=>matchesCompanion(s,companion))
        .filter((s:Show)=>companion!=="아이와"||childAgeMatches(s,childAge))
        .sort((a:Show,b:Show)=>showPurposeScore(b,companion)-showPurposeScore(a,companion));

      let unified:ShowdayEvent[]=(eventData?.events??[])
        .filter((e:ShowdayEvent)=>eventTimingMatches(e,timing,customDate))
        .filter((e:ShowdayEvent)=>eventGenreMatches(e,genre))
        .filter((e:ShowdayEvent)=>eventDiscoveryMatches(e,discovery,price))
        .filter((e:ShowdayEvent)=>eventCompanionMatches(e,companion));

      if(region==="내 주변"){
        try{
          const current=await requestCurrentLocation();
          if(!current){
            setResults([]); setEventResults([]);
            setLocationMsg("위치 권한을 허용하면 현재 위치 기준 30km 이내 결과만 정확하게 보여드릴 수 있습니다.");
            return;
          }

          if(list.length){
            const candidates=list.slice(0,60);
            const tt=await fetch("/api/travel-times",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:current,distanceOnly:true,venues:candidates.map(s=>({id:s.id,name:s.venue,region:s.region}))})}).then(r=>r.json());
            const times=tt?.times||{};
            list=candidates
              .map(s=>({show:s,distanceKm:times[s.id]?.distanceKm as number|null|undefined}))
              .filter(x=>typeof x.distanceKm==="number" && (x.distanceKm??999)<=30)
              .sort((a,b)=>(a.distanceKm??999)-(b.distanceKm??999))
              .map(x=>({...x.show,distanceFromDobongKm:x.distanceKm??x.show.distanceFromDobongKm}));
          }

          const direct:ShowdayEvent[]=[];
          const needsGeo:ShowdayEvent[]=[];
          for(const e of unified){
            const point=eventPoint(e);
            if(point){ if(haversineKm(current,point)<=30) direct.push(e); }
            else needsGeo.push(e);
          }
          let geocoded:ShowdayEvent[]=[];
          if(needsGeo.length){
            const batch=needsGeo.slice(0,80);
            const tt=await fetch("/api/travel-times",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:current,distanceOnly:true,venues:batch.map(e=>({id:e.id,name:e.venue||e.address||e.title,address:e.address,region:e.region}))})}).then(r=>r.json()).catch(()=>({times:{}}));
            const times=tt?.times||{};
            geocoded=batch.filter(e=>typeof times[e.id]?.distanceKm==="number" && times[e.id].distanceKm<=30);
          }
          unified=[...direct,...geocoded];
          setLocationMsg(`현재 위치 기준 30km 이내 공연·전시·체험·행사 ${list.length+unified.length}건을 조건에 맞는 순서로 보여드립니다.`);
        }catch{
          list=[]; unified=[];
          setLocationMsg("현재 위치 기준 검색 중 문제가 발생했습니다. 위치 권한을 확인한 뒤 다시 시도해주세요.");
        }
      }

      unified=unified.sort((a:ShowdayEvent,b:ShowdayEvent)=>eventPurposeScore(b,companion)-eventPurposeScore(a,companion) || String(a.startDate||"9999").localeCompare(String(b.startDate||"9999")));
      setResults(list.slice(0,60));
      setEventResults(unified.slice(0,200));
    }catch{
      setResults([]); setEventResults([]);
    }finally{ setLoading(false); }
  }

  const periodLabel=timing==="날짜 선택"?customDate:timing;
  const summary=[companion!=="상관없음"?companion:null, periodLabel, region, genre!=="전체"?genre:null, companion==="아이와"&&childAge?childAge:null, discovery!=="전체"?discovery:null, discovery==="가격대별"?price:null].filter(Boolean).join(" · ");

  return <section id="show-search" className="border-b border-line bg-surface">
    <div className="relative overflow-hidden bg-[#512a20]">
      <div className="pointer-events-none absolute inset-0 opacity-40"><img src="/showday-hero-audience.png" alt="" className="h-full w-full object-cover"/></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#422118]/95 via-[#512a20]/82 to-[#512a20]/38"/>
      <div className="relative mx-auto flex min-h-[330px] max-w-[1280px] items-center px-4 py-14 sm:px-6 lg:min-h-[390px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[.24em] text-[#f3b37f]">SHOWDAY · EASY SEARCH</p>
          <h1 className="font-display font-black leading-[1.08]">
            <span className="block text-[clamp(1.8rem,7vw,3.9rem)] text-white sm:whitespace-nowrap">보고 싶은 공연, 바로 찾기</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[clamp(13px,1.55vw,17px)] font-semibold leading-7 text-white/90">날짜 · 지역 · 누구와 함께할지만 선택하세요.</p>
          <p className="mt-2 max-w-2xl text-[clamp(13px,1.55vw,17px)] font-black leading-7 text-[#f3b37f]">공연부터 전시·체험·축제까지 SHOWDAY가 찾아드려요.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#quick-search" className="inline-flex items-center gap-2 border-b border-[#f3b37f] pb-1 text-sm font-bold text-white">바로 찾기 <ArrowIcon className="h-4 w-4"/></a>
            <a href="/simple-search" className="relative z-20 inline-flex min-h-[44px] items-center rounded-full border border-white/45 bg-black/20 px-4 text-xs font-bold text-white sm:hidden">구형 iPhone 간편검색</a>
          </div>
        </div>
      </div>
    </div>

    <div id="quick-search" className="relative z-10 mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="rounded-2xl border border-line bg-white/55 p-4 shadow-sm sm:p-6">
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[.18em] text-gold">EASY SEARCH</p>
          <h2 className="mt-2 text-xl font-black text-paper sm:text-2xl">내 목적에 맞는 공연을 찾아보세요.</h2>
          <p className="mt-1 text-xs leading-5 text-muted">누구와 · 언제 · 어디서 · 무엇을 · 어떤 공연을 찾는지 순서대로 고르세요.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <Choice label="1. 누구와" options={companions} value={companion} setValue={chooseCompanion}/>
            {companion==="아이와"&&<ChildAgeChoice value={childAge} setValue={setChildAge}/>}
          </div>
          <div>
            <Choice label="2. 언제" options={timings} value={timing} setValue={setTiming}/>
            {timing==="날짜 선택"&&<label className="mt-3 flex max-w-[280px] items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5"><CalendarIcon className="h-4 w-4 shrink-0 text-gold"/><input type="date" value={customDate} min={toIsoDate(new Date())} onChange={e=>setCustomDate(e.target.value)} className="min-w-0 w-full bg-transparent text-sm font-semibold text-paper outline-none"/></label>}
          </div>
          <div><Choice label="3. 어디서" options={regions} value={region} setValue={chooseRegion}/>{region==="내 주변"&&locationMsg&&<p className="mt-2 text-[11px] font-semibold leading-5 text-[#7b5a45]">{locationMsg}</p>}</div>
          <Choice label="4. 무엇을" options={genres} value={genre} setValue={setGenre}/>
          <div className="lg:col-span-2">
            <Choice label="5. 어떤 공연" options={discoveries} value={discovery} setValue={setDiscovery}/>
            {discovery==="가격대별"&&<div className="mt-3 rounded-xl border border-line bg-surface-raised/45 p-3 sm:p-4"><Choice label="가격대 선택" options={prices} value={price} setValue={setPrice}/></div>}
            {discovery==="곧 티켓오픈"&&<p className="mt-2 text-[11px] leading-5 text-muted">티켓오픈 일정이 확인된 공연만 보여드립니다. 등록된 티켓오픈 정보가 없으면 결과가 없을 수 있습니다.</p>}
          </div>
        </div>


        <div className="mt-6 border-t border-line pt-5">
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative"><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchShows()} placeholder="공연명·아티스트를 입력하거나 음성으로 말해보세요" className="w-full rounded-xl border border-line bg-white py-3.5 pl-12 pr-4 text-sm text-paper outline-none transition focus:border-gold"/></label>
            <button type="button" onClick={startVoiceSearch} disabled={listening} className={`relative z-10 inline-flex min-h-[50px] touch-manipulation select-none items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition ${listening?"border-gold bg-[#fff8f0] text-gold":"border-line bg-white text-paper hover:border-gold"}`}><MicIcon className="h-4 w-4"/>{listening?"듣고 있어요…":"음성으로 찾기"}</button>
            <button type="button" onClick={searchShows} className="relative z-10 inline-flex min-h-[50px] touch-manipulation select-none items-center justify-center gap-2 rounded-xl bg-paper px-7 text-sm font-black text-white transition hover:bg-gold"><SearchIcon className="h-4 w-4"/>이 조건으로 찾기</button>
          </div>
          {voiceMsg&&<p className="mt-3 rounded-lg bg-surface-raised/70 px-3 py-2 text-xs font-semibold leading-5 text-muted">{voiceMsg}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"><span className="text-muted">선택 조건</span>{companion!=="상관없음"&&<Chip icon={<SparkIcon className="h-3.5 w-3.5"/>}>{companion}</Chip>}<Chip icon={<PinIcon className="h-3.5 w-3.5"/>}>{region}</Chip><Chip icon={<CalendarIcon className="h-3.5 w-3.5"/>}>{periodLabel}</Chip>{genre!=="전체"&&<Chip>{genre}</Chip>}{companion==="아이와"&&childAge&&<Chip>{childAge}</Chip>}{discovery!=="전체"&&<Chip>{discovery}</Chip>}{discovery==="가격대별"&&<Chip>{price}</Chip>}</div>
          <p className="mt-3 text-[11px] leading-5 text-muted">{summary} 기준으로 검색합니다. 아이와 검색은 관람연령이 확인된 공연만, 내 주변은 위치 권한이 허용된 경우 가까운 공연을 우선합니다.</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 pb-1">
          <Quick label="아이와 이번 주말" onClick={()=>{chooseCompanion("아이와");setTiming("이번 주말");setGenre("체험·가족행사");setDiscovery("전체")}}/>
          <Quick label="무료 공연·행사" onClick={()=>{setDiscovery("무료 공연·행사");setGenre("전체")}}/>
          <Quick label="부모님과 이번 주말" onClick={()=>{chooseCompanion("부모님과");setTiming("이번 주말");setGenre("전체");setDiscovery("전체")}}/>
          <Quick label="오늘 내 주변" onClick={()=>{chooseRegion("내 주변");setTiming("오늘");setDiscovery("전체")}}/>
        </div>
      </div>

      {searched&&<SearchResults
        shows={results}
        events={eventResults}
        loading={loading}
        companion={companion}
        summary={summary}
        locationMsg={locationMsg}
        onClose={()=>{setSearched(false);onSearchStateChange?.(false)}}
      />}
    </div>
  </section>;
}


function parseEventDate(v?:string|null){
  if(!v) return null;
  const digits=v.replace(/\D/g,"").slice(0,8);
  if(digits.length!==8) return null;
  return new Date(Number(digits.slice(0,4)),Number(digits.slice(4,6))-1,Number(digits.slice(6,8)));
}
function startOfDay(d:Date){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function eventTimingMatches(e:ShowdayEvent,timing:Timing,customDate:string){
  const now=startOfDay(new Date()); const start=parseEventDate(e.startDate)||now; const end=parseEventDate(e.endDate)||start;
  let from=now,to=now;
  if(timing==="오늘") {from=now;to=now;}
  else if(timing==="이번 주말") {const day=now.getDay(); const sat=new Date(now); sat.setDate(now.getDate()+((6-day+7)%7)); from=sat;to=new Date(sat);to.setDate(sat.getDate()+1);}
  else if(timing==="이번 주") {from=now;to=new Date(now);to.setDate(now.getDate()+(7-now.getDay()));}
  else if(timing==="이번 달") {from=now;to=new Date(now.getFullYear(),now.getMonth()+1,0);}
  else {const d=new Date(`${customDate}T00:00:00`);from=d;to=d;}
  return start<=to && end>=from;
}
function eventGenreMatches(e:ShowdayEvent,genre:string){
  if(genre==="전체") return true; const text=`${e.category} ${e.subcategory||""} ${e.title}`;
  if(genre==="전시회") return /전시|미술|박물관|갤러리/.test(text);
  if(genre==="축제") return /축제|페스티벌|지역행사/.test(text);
  if(genre==="체험·가족행사") return /체험|교육|가족|어린이|아동|청소년|키즈/.test(text);
  if(genre==="콘서트") return /콘서트|대중음악|음악/.test(text);
  if(genre==="클래식") return /클래식|국악|오페라|관현악|실내악/.test(text);
  return text.includes(genre);
}
function eventDiscoveryMatches(e:ShowdayEvent,d:Discovery,price:Price){
  if(d==="전체") return true;
  if(d==="지금 예매 가능") return Boolean(e.bookingUrl||e.officialUrl);
  if(d==="곧 티켓오픈") {const a=parseEventDate(e.applyStartDate);if(!a)return false;const diff=(a.getTime()-Date.now())/86400000;return diff>=0&&diff<=30;}
  if(d==="무료 공연·행사") return Boolean(e.isFree)||/무료/.test(e.priceText||"");
  if(e.isFree) return true; return typeof e.priceValue==="number"&&e.priceValue<=priceLimit(price);
}
function eventCompanionMatches(e:ShowdayEvent,c:Companion){
  if(c==="상관없음"||c==="친구·부부"||c==="혼자") return true;
  const text=`${e.category||""} ${e.subcategory||""} ${e.title||""} ${e.target||""} ${e.description||""} ${e.venue||""}`;
  if(c==="아이와") return e.familyAllowed===true || /체험|교육|어린이|아동|가족|키즈|박물관|과학관|숲|동물|공예/.test(text);
  if(c==="연인과"){
    if(childFocusedEvent(e)) return false;
    return /공연|전시|미술관|박물관|갤러리|뮤지엄|미디어아트|사진전|특별전|기획전|축제|콘서트|뮤지컬|연극|야간|페스티벌|공예|디자인/.test(text);
  }
  if(c==="부모님과") return !/유아|키즈|어린이전용/.test(text) && /공연|전시|축제|국악|전통|클래식|음악|문화|해설|걷기|박물관|미술관/.test(text);
  return true;
}
function eventPurposeScore(e:ShowdayEvent,c:Companion){
  const text=`${e.category||""} ${e.subcategory||""} ${e.title||""} ${e.target||""} ${e.venue||""} ${e.description||""}`; let score=0;
  if(e.bookingUrl||e.officialUrl) score+=2; if(e.imageUrl) score+=1; if(e.isFree) score+=1;
  const label=groupLabel(e);
  if(c==="아이와"){
    if(label==="체험·교육")score+=20;
    if(/어린이|아동|가족|키즈|과학관|박물관|숲|공예|동물/.test(text))score+=12;
    if(label==="공연")score+=6;
  }
  if(c==="연인과"){
    if(label==="전시")score+=22;
    if(/미술관|갤러리|뮤지엄|미디어아트|사진전|특별전|기획전|야간|데이트|디자인|공예/.test(text))score+=12;
    if(label==="공연")score+=14;
    if(label==="축제·행사")score+=8;
    if(childFocusedEvent(e))score-=100;
  }
  if(c==="부모님과"){
    if(/국악|전통|클래식|문화|해설|박물관|미술관/.test(text))score+=14;
    if(label==="공연"||label==="전시")score+=10;
  }
  if(c==="친구·부부"){
    if(label==="공연"||label==="축제·행사")score+=10;
    if(label==="전시")score+=8;
  }
  if(c==="혼자"){
    if(label==="전시")score+=12;
    if(label==="공연")score+=8;
  }
  return score;
}
function groupLabel(e:ShowdayEvent){
  const core=`${e.category||""} ${e.subcategory||""} ${e.title||""} ${e.description||""}`.toLowerCase();
  const place=`${e.venue||""} ${e.address||""} ${e.organizer||""}`.toLowerCase();
  if(
    e.category==="체험·교육" ||
    /체험|교육|강좌|워크숍|클래스|프로그램|교실|아카데미|숲체험|문화체험/.test(core)
  ) return "체험·교육";
  if(
    e.category==="전시" ||
    /전시|전람|미디어아트|특별전|기획전|사진전|회고전|비엔날레/.test(core) ||
    (/미술관|박물관|갤러리|아트뮤지엄|뮤지엄/.test(place) && !/교육|체험|강좌|워크숍|클래스/.test(core))
  ) return "전시";
  if(
    e.category==="축제·지역행사" || e.category==="무료행사" ||
    /축제|페스티벌|지역행사|문화행사|거리축제|마켓|플리마켓/.test(core)
  ) return "축제·행사";
  if(
    e.category==="공연" ||
    /공연|콘서트|뮤지컬|연극|클래식|오페라|무용|발레|국악|전통예술|음악회|리사이틀/.test(core)
  ) return "공연";
  return "기타";
}
function resultGroupOrder(companion:Companion){
  if(companion==="아이와") return ["체험·교육","공연","전시","축제·행사","기타"];
  if(companion==="연인과") return ["전시","공연","축제·행사","체험·교육","기타"];
  if(companion==="부모님과") return ["공연","전시","축제·행사","체험·교육","기타"];
  if(companion==="혼자") return ["전시","공연","체험·교육","축제·행사","기타"];
  if(companion==="친구·부부") return ["공연","축제·행사","전시","체험·교육","기타"];
  return ["공연","전시","체험·교육","축제·행사","기타"];
}
function resultTitle(companion:Companion){
  if(companion==="아이와") return "아이와 즐기기 좋은 순서로 찾았어요";
  if(companion==="연인과") return "연인과 함께하기 좋은 순서로 찾았어요";
  if(companion==="부모님과") return "부모님과 함께하기 좋은 순서로 찾았어요";
  if(companion==="친구·부부") return "친구·부부와 즐기기 좋은 순서로 찾았어요";
  if(companion==="혼자") return "혼자 즐기기 좋은 순서로 찾았어요";
  return "선택한 조건에 맞는 결과예요";
}

type ResultTab="전체"|"공연"|"전시"|"체험·교육"|"축제·행사";
const RESULT_TABS:ResultTab[]=["전체","공연","전시","체험·교육","축제·행사"];
const SUB_TABS:Record<Exclude<ResultTab,"전체">,string[]>={
  "공연":["전체 공연","콘서트","뮤지컬","연극","클래식","무용","국악·전통","기타"],
  "전시":["전체 전시","미술관·갤러리","박물관","사진·미디어","특별전·기획전","기타"],
  "체험·교육":["전체","전시·관람","문화행사","교육·체험","공원·탐방","산림·여가","기타"],
  "축제·행사":["전체","지역축제","문화행사","계절·야외","마켓·지역행사","기타"],
};
function eventSearchText(e:ShowdayEvent){
  return `${e.category||""} ${e.subcategory||""} ${e.title||""} ${e.description||""} ${e.venue||""} ${e.address||""} ${e.organizer||""}`.toLowerCase();
}
function eventSubLabel(e:ShowdayEvent,tab:Exclude<ResultTab,"전체">){
  const text=eventSearchText(e);
  if(tab==="공연"){
    if(/콘서트|대중음악|가요|밴드|재즈/.test(text)) return "콘서트";
    if(/뮤지컬/.test(text)) return "뮤지컬";
    if(/연극|연희/.test(text)) return "연극";
    if(/클래식|오페라|관현악|실내악|리사이틀|독주|독창/.test(text)) return "클래식";
    if(/무용|발레|댄스/.test(text)) return "무용";
    if(/국악|전통|판소리|사물놀이|풍물/.test(text)) return "국악·전통";
    return "기타";
  }
  if(tab==="전시"){
    if(/사진|미디어아트|미디어\s*아트|영상전|디지털아트/.test(text)) return "사진·미디어";
    if(/특별전|기획전|비엔날레|회고전/.test(text)) return "특별전·기획전";
    if(/박물관|museum/.test(text)) return "박물관";
    if(/미술관|갤러리|아트뮤지엄|gallery/.test(text)) return "미술관·갤러리";
    return "기타";
  }
  if(tab==="체험·교육"){
    if(/산림|숲|휴양림|수목원|산림교육|숲체험/.test(text)) return "산림·여가";
    if(/공원|탐방|생태|둘레길|걷기|해설투어|도보투어/.test(text)) return "공원·탐방";
    if(/전시관람|관람|도슨트|해설|투어/.test(text) && !/교육|강좌|워크숍|체험/.test(text)) return "전시·관람";
    if(/문화행사|문화프로그램|공연관람|예술행사/.test(text)) return "문화행사";
    if(/교육|체험|강좌|워크숍|클래스|교실|아카데미|만들기|공예/.test(text)) return "교육·체험";
    return "기타";
  }
  if(/플리마켓|마켓|장터|지역행사|시민행사|거리행사/.test(text)) return "마켓·지역행사";
  if(/봄|여름|가을|겨울|야외|공원|벚꽃|단풍|빛축제|불꽃/.test(text)) return "계절·야외";
  if(/문화행사|문화제|예술제|공연행사/.test(text)) return "문화행사";
  if(/축제|페스티벌|festival/.test(text)) return "지역축제";
  return "기타";
}
function showSubLabel(show:Show){
  const text=`${show.genre||""} ${show.title||""} ${(show.tags||[]).join(" ")}`.toLowerCase();
  if(/콘서트|대중음악|가요|밴드|재즈/.test(text)) return "콘서트";
  if(/뮤지컬/.test(text)) return "뮤지컬";
  if(/연극|연희/.test(text)) return "연극";
  if(/클래식|오페라|관현악|실내악|리사이틀|독주|독창/.test(text)) return "클래식";
  if(/무용|발레|댄스/.test(text)) return "무용";
  if(/국악|전통|판소리|사물놀이|풍물/.test(text)) return "국악·전통";
  return "기타";
}
function SearchResults({shows,events,loading,companion,summary,locationMsg,onClose}:{shows:Show[];events:ShowdayEvent[];loading:boolean;companion:Companion;summary:string;locationMsg:string;onClose:()=>void}){
  const [tab,setTab]=useState<ResultTab>("전체");
  const [subTab,setSubTab]=useState("전체");
  const counts={
    "전체":events.length+shows.length,
    "공연":events.filter(e=>groupLabel(e)==="공연").length+shows.length,
    "전시":events.filter(e=>groupLabel(e)==="전시").length,
    "체험·교육":events.filter(e=>groupLabel(e)==="체험·교육").length,
    "축제·행사":events.filter(e=>groupLabel(e)==="축제·행사").length,
  };

  const baseEvents=tab==="전체"?events:events.filter(e=>groupLabel(e)===tab);
  const eventFiltered=tab==="전체"||subTab==="전체"||subTab===`전체 ${tab}`
    ?baseEvents
    :baseEvents.filter(e=>eventSubLabel(e,tab as Exclude<ResultTab,"전체">)===subTab);
  const showFiltered=tab==="공연"&&subTab!=="전체"&&subTab!=="전체 공연"?shows.filter(s=>showSubLabel(s)===subTab):shows;
  const order=tab==="전체"?resultGroupOrder(companion):[tab];
  const visibleTotal=tab==="공연"&&subTab!=="전체"&&subTab!=="전체 공연"
    ?eventFiltered.length+showFiltered.length
    :tab==="전체"?counts["전체"]:eventFiltered.length+(tab==="공연"?shows.length:0);
  const subTabs=tab==="전체"?[]:SUB_TABS[tab];
  const preferred=tab==="전체"?resultGroupOrder(companion)[0]:tab;

  const subCounts=(label:string)=>{
    if(tab==="공연"){
      if(label==="전체 공연") return counts["공연"];
      return events.filter(e=>groupLabel(e)==="공연"&&eventSubLabel(e,"공연")===label).length+shows.filter(s=>showSubLabel(s)===label).length;
    }
    if(tab==="전체")return counts["전체"];
    if(label==="전체")return counts[tab];
    return events.filter(e=>groupLabel(e)===tab&&eventSubLabel(e,tab as Exclude<ResultTab,"전체">)===label).length;
  };

  function scrollToResultsStart(){
    window.setTimeout(()=>{
      document.getElementById("search-results-list")?.scrollIntoView({behavior:"smooth",block:"start"});
    },0);
  }

  function chooseTab(next:ResultTab){
    setTab(next);
    setSubTab(next==="공연"?"전체 공연":"전체");
    scrollToResultsStart();
  }

  function chooseSubTab(next:string){
    setSubTab(next);
    scrollToResultsStart();
  }

  function groupTitle(label:string){
    if(companion==="아이와"&&label==="체험·교육") return "아이와 먼저 보기 좋은 체험·교육";
    if(companion==="연인과"&&label==="전시") return "연인과 먼저 보기 좋은 전시·미술관";
    if(companion==="부모님과"&&label==="공연") return "부모님과 먼저 보기 좋은 공연";
    if(companion==="혼자"&&label==="전시") return "혼자 보기 좋은 전시";
    if(companion==="친구·부부"&&label==="공연") return "친구·부부와 먼저 보기 좋은 공연";
    return label;
  }

  return <div id="search-results" className="mt-7 scroll-mt-20 rounded-2xl border border-line bg-white/60 p-3 sm:p-5">
    <div className="sticky top-[64px] z-20 -mx-3 border-b border-line bg-white/95 px-3 pb-3 pt-2 shadow-[0_8px_18px_rgba(0,0,0,0.04)] backdrop-blur-md sm:top-[72px] sm:-mx-5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold tracking-[.14em] text-gold">MY SHOWDAY RESULTS</p>
            {tab==="전체"&&preferred&&<span className="rounded-full bg-[#fff4e7] px-2 py-1 text-[10px] font-black text-paper">{preferred} 우선</span>}
          </div>
          <h3 className="mt-1 text-base font-black text-paper sm:text-lg">{resultTitle(companion)}</h3>
          <p className="mt-1 text-[11px] leading-5 text-muted sm:text-xs">{summary} · {loading?"검색 중":`현재 ${visibleTotal}건`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={()=>document.getElementById("quick-search")?.scrollIntoView({behavior:"smooth",block:"start"})} className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-paper sm:text-xs">↑ 검색조건</button>
          <button type="button" onClick={onClose} className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-muted sm:text-xs">결과 접기</button>
        </div>
      </div>

      {locationMsg&&<p className="mt-3 rounded-lg bg-surface-raised/70 px-3 py-2 text-[11px] font-semibold text-muted sm:text-xs">{locationMsg}</p>}

      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="검색 결과 대분류">
        {RESULT_TABS.map(t=><button type="button" role="tab" aria-selected={tab===t} key={t} onClick={()=>chooseTab(t)} className={`min-h-[40px] rounded-full border px-3 py-2 text-[11px] font-black sm:text-xs ${tab===t?"border-paper bg-paper text-white":"border-line bg-white text-muted"}`}><span>{t}</span>{!loading&&<span className={`ml-1.5 text-[10px] ${tab===t?"text-white/70":"text-muted/70"}`}>{counts[t]}</span>}</button>)}
      </div>

      {subTabs.length>0&&<div className="mt-2 rounded-xl bg-surface-raised/65 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-3"><p className="text-[10px] font-black tracking-[.08em] text-muted">세부 분류</p><span className="text-[10px] text-muted">원하는 항목만 바로 보기</span></div>
        <div className="flex flex-wrap gap-1.5">{subTabs.map(st=><button type="button" key={st} onClick={()=>chooseSubTab(st)} className={`min-h-[36px] rounded-full border px-3 py-1.5 text-[10px] font-bold sm:text-[11px] ${subTab===st?"border-gold bg-[#fff4e7] text-paper":"border-line bg-white text-muted"}`}>{st}<span className="ml-1.5 text-[10px] opacity-70">{subCounts(st)}</span></button>)}</div>
      </div>}
    </div>

    <div id="search-results-list" className="mt-5 scroll-mt-[230px] min-w-0">
      {loading?<p className="py-10 text-center text-sm text-muted">공연·전시·체험·문화행사를 함께 찾고 있습니다.</p>:visibleTotal===0?<Empty/>:<div className="space-y-10">
        {order.map((label,index)=>{
          if(label==="공연"){
            const performanceEvents=eventFiltered.filter(e=>groupLabel(e)==="공연");
            const performanceShows=(tab==="전체"||tab==="공연")?showFiltered:[];
            const total=performanceEvents.length+performanceShows.length;
            if(total===0)return null;
            return <div key="공연" id="result-performance"><div className="mb-4 flex items-end justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2">{index===0&&tab==="전체"&&<span className="rounded-full bg-[#fff4e7] px-2 py-1 text-[10px] font-black text-paper">먼저 보기</span>}<h4 className="text-base font-black text-paper">{groupTitle("공연")}</h4></div><p className="mt-1 text-[11px] text-muted">공연 DB와 SHOWDAY 공연을 함께 보여드려요.</p></div><span className="shrink-0 text-[11px] text-muted">{total}건</span></div><div className="space-y-5">{performanceEvents.length>0&&<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{performanceEvents.map(e=><EventCard key={e.id} event={e}/>)}</div>}{performanceShows.length>0&&<div><p className="mb-2 text-[10px] font-bold tracking-[.1em] text-gold">KOPIS 공연</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{performanceShows.map(show=><ResultCard key={show.id} show={show}/>)}</div></div>}</div></div>;
          }
          const items=eventFiltered.filter(e=>groupLabel(e)===label);
          if(!items.length)return null;
          return <ResultGroup key={label} title={groupTitle(label)} items={items} preferred={index===0&&tab==="전체"}/>;
        })}
      </div>}
    </div>

    <div className="mt-8 flex justify-center"><button type="button" onClick={()=>document.getElementById("quick-search")?.scrollIntoView({behavior:"smooth",block:"start"})} className="rounded-full border border-line bg-white px-4 py-2 text-xs font-black text-paper hover:border-gold">↑ 상단 검색으로</button></div>
    <div className="mt-5 rounded-2xl border border-[#e6cdb8] bg-[#fff8f0] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"><div><b className="text-sm text-paper">♡ 이 조건 저장하기</b><p className="mt-1 text-xs leading-5 text-muted">관심조건을 저장해두면 새 공연·행사와 티켓오픈 소식을 확인하기 편해집니다.</p></div><a href="/onboarding" className="mt-3 inline-flex rounded-full bg-paper px-4 py-2.5 text-xs font-black text-white sm:mt-0">관심조건 저장</a></div>
  </div>
}
function ResultGroup({title,items,preferred=false}:{title:string;items:ShowdayEvent[];preferred?:boolean}){return <div><div className="mb-4 flex items-end justify-between gap-3"><div className="flex flex-wrap items-center gap-2">{preferred&&<span className="rounded-full bg-[#fff4e7] px-2 py-1 text-[10px] font-black text-paper">먼저 보기</span>}<h4 className="text-base font-black text-paper">{title}</h4></div><span className="shrink-0 text-[11px] text-muted">{items.length}건</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(e=><EventCard key={e.id} event={e}/>)}</div></div>}
function EventCard({event:e}:{event:ShowdayEvent}){
  const href=e.bookingUrl||e.officialUrl;
  const body=<><div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-raised"><>{e.imageUrl?<img src={e.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"/>:<div className="grid h-full place-items-center px-2 text-center text-[10px] font-bold text-muted">SHOWDAY</div>}</></div><div className="min-w-0"><p className="truncate text-[10px] font-bold text-gold">{e.subcategory||e.category}</p><b className="mt-1 line-clamp-2 block text-sm leading-5 text-paper transition group-hover:text-gold">{e.title}</b><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted">{e.venue||e.address||e.region||"장소 확인"}<br/>{e.dateText||[e.startDate,e.endDate].filter(Boolean).join(" ~ ")}</p><div className="mt-2 flex flex-wrap gap-1.5">{(e.isFree||/무료/.test(e.priceText||""))&&<span className="rounded-md bg-[#fff5ea] px-2 py-1 text-[10px] font-black text-paper">무료</span>}{e.region&&<span className="rounded-md bg-surface-raised px-2 py-1 text-[10px] font-bold text-muted">{e.region}</span>}</div>{href&&<span className="mt-2 inline-flex text-[10px] font-bold text-muted group-hover:text-paper">외부 상세 ↗</span>}</div></>;
  const cls="group grid min-w-0 grid-cols-[82px_minmax(0,1fr)] gap-3 rounded-xl border border-line bg-white p-3 transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[#fffaf4] hover:shadow-md sm:grid-cols-[96px_minmax(0,1fr)]";
  return href?<a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${e.title} 상세 보기`}>{body}</a>:<article className={cls}>{body}</article>;
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

function mobilePress(handler:()=>void){
  return {
    onClick: handler,
    onTouchEnd: (e: TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handler();
    },
  };
}

function ChildAgeChoice({value,setValue}:{value:ChildAge|null;setValue:(v:ChildAge)=>void}){
  return <div id="child-age-filter" className="mt-3 rounded-2xl border border-[#d9b89f] bg-[#fff8f0] p-3.5 sm:p-4">
    <div className="flex items-end justify-between gap-3">
      <div><p className="text-sm font-black text-paper">아이 나이가 어떻게 되나요?</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#7b5a45]">관람 가능한 공연을 정확하게 찾기 위해 선택해주세요.</p></div>
      {value&&<span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-paper shadow-sm">{value}</span>}
    </div>
    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
      {childAges.map(age=>{
        const selected=age===value;
        return <button
          key={age}
          type="button"
          {...mobilePress(()=>setValue(age))}
          aria-pressed={selected}
          className={`relative z-10 min-h-[44px] w-full cursor-pointer select-none rounded-xl border px-2 py-2 text-xs font-black ${selected?"border-paper bg-paper text-white shadow-sm":"border-[#e7cdb9] bg-white text-[#6f5949]"}`}
          style={{WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}
        >{age}</button>
      })}
    </div>
    <p className="mt-3 text-[10px] font-semibold leading-4 text-[#8b6a53]">선택한 나이에 관람 가능한 것으로 확인된 공연을 우선 보여드립니다.</p>
  </div>
}
function Choice<T extends string>({label,options,value,setValue}:{label:string;options:readonly T[];value:T|null;setValue:(v:T)=>void}){
  return <div>
    <p className="mb-2 text-xs font-black text-paper">{label}</p>
    <div className="flex flex-wrap gap-2 pb-1">
      {options.map(o=>{
        const selected=o===value;
        return <button
          key={o}
          type="button"
          {...mobilePress(()=>setValue(o))}
          aria-pressed={selected}
          className={`relative z-10 min-h-[44px] shrink-0 cursor-pointer select-none whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold ${selected?"border-paper bg-paper text-white shadow-sm":"border-line bg-white/70 text-muted"}`}
          style={{WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}
        >{o}</button>
      })}
    </div>
  </div>
}
function Quick({label,onClick}:{label:string;onClick:()=>void}){
  return <button
    type="button"
    {...mobilePress(onClick)}
    className="relative z-10 min-h-[44px] shrink-0 cursor-pointer select-none rounded-full border border-line bg-white/55 px-3.5 py-2 text-xs font-semibold text-muted hover:border-gold/60 hover:text-paper"
    style={{WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}
  >{label}</button>
}
function Chip({icon,children}:{icon?:ReactNode;children:ReactNode}){return <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised/80 px-2.5 py-1 font-semibold text-paper">{icon}{children}</span>}
function Empty(){return <div className="border-y border-line py-8 text-center"><p className="text-sm font-semibold text-paper">조건에 맞는 현재·예정 공연을 찾지 못했습니다.</p><p className="mt-2 text-xs text-muted">지역이나 날짜를 조금 넓혀 다시 찾아보세요.</p></div>}
function ResultCard({show}:{show:Show}){const hasPrice=show.priceLabel&&show.priceLabel!=="가격 정보 없음";const hasDistance=Number.isFinite(show.distanceFromDobongKm)&&show.distanceFromDobongKm<999;return <a href={`/show/${encodeURIComponent(show.id)}`} className="group grid grid-cols-[88px_1fr] gap-3 border-b border-line pb-4 sm:block"><div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-raised">{show.posterUrl?<img src={show.posterUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>:<div className="h-full w-full" style={{background:`linear-gradient(135deg,${show.posterFrom},${show.posterTo})`}}/>}</div><div className="sm:pt-3"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p><b className="mt-1 line-clamp-2 block text-sm text-paper group-hover:text-gold">{show.title}</b><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{show.venue}<br/>{show.dateLabel}</p><div className="mt-2 flex flex-wrap items-center gap-1.5"><span className="rounded-md bg-[#fff5ea] px-2 py-1 text-[11px] font-black text-paper">{hasPrice?show.priceLabel:"가격 상세 확인"}</span>{hasDistance&&<span className="rounded-md bg-surface-raised px-2 py-1 text-[11px] font-bold text-muted">내 위치에서 {show.distanceFromDobongKm<1?`${Math.round(show.distanceFromDobongKm*1000)}m`:`${show.distanceFromDobongKm.toFixed(1)}km`}</span>}</div>{show.ageLabel&&show.ageLabel!=="관람등급 정보 없음"&&<p className="mt-2 text-[11px] text-muted">{show.ageLabel}</p>}<span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-paper">자세히 <ArrowIcon className="h-3.5 w-3.5"/></span></div></a>}
