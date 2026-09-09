"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, PinIcon, SparkIcon, TicketIcon } from "@/components/Icons";

type LocalEvent = {
  id: string;
  category: string;
  district: string;
  title: string;
  dateText: string;
  startDate: string | null;
  endDate: string | null;
  venue: string;
  priceText: string;
  isFree: boolean;
  imageUrl: string;
  showTime: string;
  bookingUrl: string;
  officialUrl: string;
  lat: number | null;
  lng: number | null;
};

type DistanceEvent = LocalEvent & { distanceKm: number | null };

const DISTRICTS = ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"];
const DISTRICT_CENTERS: Record<string,[number,number]> = {
  강남구:[37.5172,127.0473],강동구:[37.5301,127.1238],강북구:[37.6396,127.0257],강서구:[37.5509,126.8495],관악구:[37.4784,126.9516],광진구:[37.5385,127.0823],구로구:[37.4955,126.8876],금천구:[37.4569,126.8955],노원구:[37.6542,127.0568],도봉구:[37.6688,127.0471],동대문구:[37.5744,127.0396],동작구:[37.5124,126.9393],마포구:[37.5663,126.9019],서대문구:[37.5791,126.9368],서초구:[37.4837,127.0324],성동구:[37.5633,127.0369],성북구:[37.5894,127.0167],송파구:[37.5145,127.1059],양천구:[37.5170,126.8665],영등포구:[37.5264,126.8963],용산구:[37.5326,126.9905],은평구:[37.6027,126.9291],종로구:[37.5730,126.9794],중구:[37.5641,126.9979],중랑구:[37.6063,127.0927]
};

function haversine(lat1:number,lng1:number,lat2:number,lng2:number){
  const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function closestDistrict(lat:number,lng:number){
  let best="서울"; let bestD=Infinity;
  for(const [name,[dlat,dlng]] of Object.entries(DISTRICT_CENTERS)){const d=haversine(lat,lng,dlat,dlng);if(d<bestD){bestD=d;best=name}}
  return best;
}
function isWeekend(iso:string|null){if(!iso)return false;const d=new Date(iso);const day=d.getDay();return day===5||day===6||day===0}

export default function MyAreaSection({fullPage=false}:{fullPage?:boolean}){
  const [events,setEvents]=useState<LocalEvent[]>([]);
  const [loading,setLoading]=useState(true);
  const [configured,setConfigured]=useState(true);
  const [location,setLocation]=useState<{lat:number;lng:number}|null>(null);
  const [district,setDistrict]=useState("");
  const [radius,setRadius]=useState<3|5|10|99>(fullPage ? 99 : 5);
  const [filter,setFilter]=useState<"all"|"today"|"weekend"|"free">("all");
  const [genre,setGenre]=useState<"all"|"콘서트"|"뮤지컬"|"연극"|"클래식"|"무용"|"국악"|"기타">("all");
  const [geoState,setGeoState]=useState<"idle"|"loading"|"denied">("idle");
  const scrollRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    let ignore=false;
    const pages=fullPage?[1,2,3,4,5]:[1,2,3];
    Promise.all(pages.map(page=>fetch(`/api/seoul-events?rows=1000&page=${page}`,{cache:"no-store"}).then(r=>r.json())))
      .then(results=>{
        if(ignore)return;
        const configuredOk=results.every(data=>data?.configured!==false);
        const merged=results.flatMap(data=>Array.isArray(data?.events)?data.events:[]);
        const unique=Array.from(new Map(merged.map(event=>[event.id,event])).values());
        setEvents(unique);
        setConfigured(configuredOk);
      }).catch(()=>{}).finally(()=>{if(!ignore)setLoading(false)});
    return()=>{ignore=true};
  },[fullPage]);

  function useCurrentLocation(){
    if(!navigator.geolocation){setGeoState("denied");return}
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition((pos)=>{const next={lat:pos.coords.latitude,lng:pos.coords.longitude};setLocation(next);setDistrict(closestDistrict(next.lat,next.lng));setGeoState("idle")},()=>setGeoState("denied"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
  }

  const visible=useMemo<DistanceEvent[]>(()=>{
    const now=new Date(); const todayKey=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
    return events.map(e=>({...e,distanceKm:location&&e.lat!=null&&e.lng!=null?haversine(location.lat,location.lng,e.lat,e.lng):null}))
      .filter(e=>location&&radius<99&&e.distanceKm!=null?e.distanceKm<=radius:district?e.district===district:true)
      .filter(e=>{
        if(genre==="all") return true;
        if(genre==="기타") return !["콘서트","뮤지컬","연극","클래식","무용","국악"].some(g=>e.category.includes(g));
        return e.category.includes(genre);
      })
      .filter(e=>{
        if(filter==="free") return e.isFree;
        if(filter==="weekend") return isWeekend(e.startDate);
        if(filter==="today"){
          const startKey=e.startDate?.slice(0,10);
          if(!startKey) return false;
          const endKey=e.endDate?.slice(0,10) ?? startKey;
          return startKey<=todayKey && endKey>=todayKey;
        }
        return true;
      })
      .sort((a,b)=>location?(a.distanceKm??999)-(b.distanceKm??999):(a.startDate||"9999").localeCompare(b.startDate||"9999"))
      .slice(0,fullPage?72:24);
  },[events,location,district,radius,filter,genre,fullPage]);

  function scrollMore(direction:1|-1=1){
    const el=scrollRef.current;
    if(!el)return;
    const amount=Math.max(320,Math.round(el.clientWidth*0.82));
    el.scrollBy({left:amount*direction,behavior:"smooth"});
  }

  function setDistanceRadius(r:3|5|10|99){
    setRadius(r);
    if(r===99)setDistrict("");
  }

  return <section id="my-area" className="my-area-section border-t border-line px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-[1440px]">
      <div className="my-area-head">
        <div><p className="my-area-eyebrow">MY AREA</p><h2>{fullPage?"서울 공연·행사 전체보기":"내 주변에서 만나는 공연과 문화"}</h2><p>{fullPage?"서울 전체 공연·행사를 기본으로 보여드리고, 원할 때 현재 위치·관심 지역·거리·날짜·무료 여부로 좁혀볼 수 있습니다.":"현재 위치나 관심 지역을 기준으로 오늘부터 예정된 공연·행사를 골라 보여드립니다."}</p></div>
        <div className="my-area-head-actions">
          {!fullPage&&<div className="my-area-carousel-actions"><button type="button" onClick={()=>scrollMore(-1)} aria-label="이전 공연" className="my-area-arrow">‹</button><button type="button" onClick={()=>scrollMore(1)} className="my-area-more-link">공연 더보기 <span aria-hidden="true">›</span></button></div>}
          <button type="button" onClick={useCurrentLocation} className="my-area-location-btn"><PinIcon className="h-4 w-4"/>{geoState==="loading"?"위치 확인 중":location?`현재 위치 · ${district}`:"현재 위치로 찾기"}</button>
        </div>
      </div>

      <div className="my-area-toolbar">
        <div className="my-area-select-wrap"><span>관심 지역</span><select value={district} onChange={e=>{setDistrict(e.target.value);setLocation(null);setRadius(99)}}><option value="">서울 전체</option>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div className="my-area-pills" aria-label="거리 선택">{([3,5,10,99] as const).map(r=><button key={r} onClick={()=>setDistanceRadius(r)} className={radius===r?"is-active":""} disabled={!location&&r!==99}>{r===99?"서울 전체":`${r}km`}</button>)}</div>
        <div className="my-area-pills" aria-label="일정 필터">{[["all","전체"],["today","오늘"],["weekend","이번 주말"],["free","무료"]].map(([v,label])=><button key={v} onClick={()=>setFilter(v as typeof filter)} className={filter===v?"is-active":""}>{label}</button>)}</div>
      </div>

      <div className="my-area-genre-row" aria-label="장르 선택">
        <span className="my-area-filter-label">장르</span>
        <div className="my-area-genre-pills no-scrollbar">
          {(fullPage
            ? [["all","전체"],["콘서트","콘서트"],["뮤지컬","뮤지컬"],["연극","연극"],["클래식","클래식"],["무용","무용"],["국악","국악"],["기타","기타 공연"]]
            : [["all","전체"],["콘서트","콘서트"],["뮤지컬","뮤지컬"],["연극","연극"],["클래식","클래식"]]
          ).map(([v,label])=><button key={v} type="button" onClick={()=>setGenre(v as typeof genre)} className={genre===v?"is-active":""}>{label}</button>)}
        </div>
      </div>

      {geoState==="denied"&&<p className="my-area-note">위치 권한을 사용할 수 없습니다. 관심 지역을 직접 선택해도 동일하게 이용할 수 있습니다.</p>}
      {!configured&&<div className="my-area-empty"><SparkIcon className="h-5 w-5"/><div><strong>서울시 문화행사 API 연결 준비 중</strong><p>Vercel 환경변수에 SEOUL_OPEN_DATA_API_KEY를 추가하면 MY AREA가 자동으로 활성화됩니다.</p></div></div>}
      {configured&&loading&&<div className="my-area-empty">가까운 공연과 행사를 불러오고 있습니다.</div>}
      {configured&&!loading&&visible.length===0&&<div className="my-area-empty">선택한 조건에 맞는 현재·예정 공연이나 행사가 없습니다. 반경이나 지역을 넓혀보세요.</div>}

      {fullPage&&visible.length>0&&<div className="my-area-result-summary"><strong>{visible.length}</strong>개의 {genre==="all"?"서울 공연·행사":`${genre} 공연`}를 보고 있습니다.</div>}
      {visible.length>0&&<div ref={fullPage?undefined:scrollRef} className={fullPage?"my-area-grid":"my-area-scroll no-scrollbar"}>{visible.map(event=><article key={event.id} className="my-area-card">
        <a href={event.officialUrl||event.bookingUrl||"#"} target="_blank" rel="noopener noreferrer" className="my-area-card-link">
          <div className="my-area-image">{event.imageUrl?<img src={event.imageUrl} alt="" loading="lazy"/>:<div className="my-area-image-fallback"><TicketIcon className="h-6 w-6"/></div>}<span>{event.category}</span>{event.isFree&&<b>FREE</b>}</div>
          <div className="my-area-copy"><div className="my-area-meta"><span><PinIcon className="h-3 w-3"/>{event.district}</span>{event.distanceKm!=null&&<span>{event.distanceKm<1?`${Math.round(event.distanceKm*1000)}m`:`${event.distanceKm.toFixed(1)}km`}</span>}</div><h3>{event.title}</h3><p><CalendarIcon className="h-3.5 w-3.5"/>{event.dateText}{event.showTime?` · ${event.showTime}`:""}</p><p className="my-area-venue">{event.venue}</p><div className="my-area-price"><span>{event.priceText}</span><span>정보 보기</span></div></div>
        </a>
      </article>)}</div>}
      {!fullPage&&visible.length>0&&<div className="my-area-mobile-more"><button type="button" onClick={()=>scrollMore(1)}>다음 공연 보기 <span aria-hidden="true">›</span></button></div>}
      <p className="my-area-source">문화행사 정보 제공: 서울특별시 · 종료된 행사는 자동 제외됩니다.</p>
    </div>
  </section>
}
