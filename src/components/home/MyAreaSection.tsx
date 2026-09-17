"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, PinIcon, SparkIcon, TicketIcon } from "@/components/common/Icons";
import ShowdayMap, { MapBounds, MapPoint } from "@/components/map/ShowdayMap";
import type { ShowdayEvent } from "@/lib/events/eventTypes";

type SourceMeta = { source: string; configured: boolean; count: number; error: string | null };

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
function isWeekend(iso?:string|null){if(!iso)return false;const d=new Date(iso);const day=d.getDay();return day===5||day===6||day===0}
// 소스마다 district(자치구)를 채워주지 않는 경우가 있어(KOPIS·관광공사 등), region/address/venue까지 함께 본다.
function matchesDistrictText(e:ShowdayEvent, d:string){
  return [e.district,e.region,e.address,e.venue].filter(Boolean).some(v=>String(v).includes(d));
}
// 화면 표시용 장르: culturePortal 등은 subcategory에 세부 장르를 담고, category는 대분류("공연" 등)라 subcategory 우선.
function matchesGenre(e:ShowdayEvent, genre:string){
  if(genre==="all") return true;
  const label = e.subcategory || e.category || "";
  if(genre==="기타") return !["콘서트","뮤지컬","연극","클래식","무용","국악"].some(g=>label.includes(g));
  return label.includes(genre);
}

type DistanceEvent = ShowdayEvent & { distanceKm: number | null };

export default function MyAreaSection({fullPage=false}:{fullPage?:boolean}){
  const [events,setEvents]=useState<ShowdayEvent[]>([]);
  const [sources,setSources]=useState<SourceMeta[]>([]);
  const [loading,setLoading]=useState(true);
  const [location,setLocation]=useState<{lat:number;lng:number}|null>(null);
  const [district,setDistrict]=useState("");
  const [radius,setRadius]=useState<3|5|10|99>(fullPage ? 99 : 5);
  const [filter,setFilter]=useState<"all"|"today"|"weekend"|"free">("all");
  const [genre,setGenre]=useState<"all"|"콘서트"|"뮤지컬"|"연극"|"클래식"|"기타">("all");
  const [geoState,setGeoState]=useState<"idle"|"loading"|"denied">("idle");
  const [view,setView]=useState<"list"|"map">("list");
  const [mapBounds,setMapBounds]=useState<MapBounds|null>(null);
  const scrollRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    let ignore=false;
    fetch(`/api/events/search?rows=${fullPage?600:300}`,{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>{
        if(ignore)return;
        setEvents(Array.isArray(data?.events)?data.events:[]);
        setSources(Array.isArray(data?.sources)?data.sources:[]);
      }).catch(()=>{}).finally(()=>{if(!ignore)setLoading(false)});
    return()=>{ignore=true};
  },[fullPage]);

  // 필터 조건이 바뀌면 "이 지역 재검색"으로 고정해둔 지도 범위는 초기화한다.
  useEffect(()=>{ setMapBounds(null); },[genre,filter,district,radius,location]);

  function useCurrentLocation(){
    if(!navigator.geolocation){setGeoState("denied");return}
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition((pos)=>{const next={lat:pos.coords.latitude,lng:pos.coords.longitude};setLocation(next);setDistrict(closestDistrict(next.lat,next.lng));setGeoState("idle")},()=>setGeoState("denied"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
  }

  const configuredAny = sources.length===0 || sources.some(s=>s.configured);

  const baseFiltered=useMemo(()=>{
    const now=new Date(); const todayKey=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
    return events
      .filter(e=>matchesGenre(e,genre))
      .filter(e=>{
        if(filter==="free") return Boolean(e.isFree);
        if(filter==="weekend") return isWeekend(e.startDate);
        if(filter==="today"){
          const startKey=e.startDate?.slice(0,10);
          if(!startKey) return false;
          const endKey=e.endDate?.slice(0,10) ?? startKey;
          return startKey<=todayKey && endKey>=todayKey;
        }
        return true;
      });
  },[events,genre,filter]);

  const distanceFiltered=useMemo<DistanceEvent[]>(()=>{
    return baseFiltered.map(e=>({...e,distanceKm:location&&e.lat!=null&&e.lng!=null?haversine(location.lat,location.lng,e.lat,e.lng):null}))
      .filter(e=>location&&radius<99&&e.distanceKm!=null?e.distanceKm<=radius:district?matchesDistrictText(e,district):true)
      .sort((a,b)=>location?(a.distanceKm??999)-(b.distanceKm??999):(a.startDate||"9999").localeCompare(b.startDate||"9999"))
      .slice(0,fullPage?72:24);
  },[baseFiltered,location,district,radius,fullPage]);

  const boundsFiltered=useMemo<DistanceEvent[]|null>(()=>{
    if(!mapBounds) return null;
    return baseFiltered
      .filter(e=>e.lat!=null&&e.lng!=null&&e.lat>=mapBounds.swLat&&e.lat<=mapBounds.neLat&&e.lng>=mapBounds.swLng&&e.lng<=mapBounds.neLng)
      .map(e=>({...e,distanceKm:location&&e.lat!=null&&e.lng!=null?haversine(location.lat,location.lng,e.lat,e.lng):null}))
      .sort((a,b)=>(a.startDate||"9999").localeCompare(b.startDate||"9999"))
      .slice(0,fullPage?72:24);
  },[baseFiltered,mapBounds,location,fullPage]);

  // "이 지역 재검색"을 누르기 전까지는 목록과 지도가 같은 조건(거리/자치구)을 공유한다.
  const visible = boundsFiltered ?? distanceFiltered;

  const mapPoints=useMemo<MapPoint[]>(()=>visible
    .filter((e):e is DistanceEvent & {lat:number; lng:number} => e.lat!=null && e.lng!=null)
    .map(e=>({id:e.id,lat:e.lat,lng:e.lng,title:e.title,category:e.subcategory||e.category,isFree:e.isFree}))
  ,[visible]);

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
        <div><p className="my-area-eyebrow">SHOWDAY MAP</p><h2>{fullPage?"서울 공연·행사 전체보기":"내 위치에서 가까운 공연·문화행사"}</h2><p>{fullPage?"공연·전시·축제·체험을 하나의 지도에서 확인하고, 목록으로도 한눈에 비교해보세요.":"‘현재 위치로 찾기’를 누르면 위치 권한 확인 후 3km·5km·10km 거리로 좁혀볼 수 있습니다. 지도 보기에서는 원하는 지역으로 이동해 ‘이 지역 재검색’도 가능합니다."}</p></div>
        <div className="my-area-head-actions">
          <div className="my-area-view-toggle" role="tablist" aria-label="목록/지도 전환">
            <button type="button" role="tab" aria-selected={view==="list"} className={view==="list"?"is-active":""} onClick={()=>setView("list")}>목록</button>
            <button type="button" role="tab" aria-selected={view==="map"} className={view==="map"?"is-active":""} onClick={()=>setView("map")}>지도</button>
          </div>
          {!fullPage&&view==="list"&&<div className="my-area-carousel-actions"><button type="button" onClick={()=>scrollMore(-1)} aria-label="이전 공연" className="my-area-arrow">‹</button><button type="button" onClick={()=>scrollMore(1)} className="my-area-more-link">공연 더보기 <span aria-hidden="true">›</span></button></div>}
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
          {[["all","전체"],["콘서트","콘서트"],["뮤지컬","뮤지컬"],["연극","연극"],["클래식","클래식"],["기타","전시·축제·체험"]].map(([v,label])=><button key={v} type="button" onClick={()=>setGenre(v as typeof genre)} className={genre===v?"is-active":""}>{label}</button>)}
        </div>
      </div>

      {geoState==="denied"&&<p className="my-area-note">위치 권한을 사용할 수 없습니다. 관심 지역을 직접 선택해도 동일하게 이용할 수 있습니다.</p>}
      {!configuredAny&&<div className="my-area-empty"><SparkIcon className="h-5 w-5"/><div><strong>공연·행사 정보 준비 중</strong><p>곧 공공데이터·KOPIS 연동을 통해 가까운 공연·행사를 보여드릴게요.</p></div></div>}
      {configuredAny&&loading&&<div className="my-area-empty">가까운 공연과 행사를 불러오고 있습니다.</div>}
      {configuredAny&&!loading&&visible.length===0&&<div className="my-area-empty">선택한 조건에 맞는 현재·예정 공연이나 행사가 없습니다. 반경이나 지역을 넓혀보세요.</div>}

      {view==="map"&&configuredAny&&!loading&&<ShowdayMap points={mapPoints} center={location} onBoundsSearch={setMapBounds} className="my-area-map"/>}

      {fullPage&&visible.length>0&&<div className="my-area-result-summary"><strong>{visible.length}</strong>개의 {genre==="all"?"서울 공연·행사":`${genre} 공연`}를 보고 있습니다.{mapBounds&&" (지도에 보이는 범위 기준)"}</div>}
      {visible.length>0&&<div ref={fullPage||view==="map"?undefined:scrollRef} className={fullPage||view==="map"?"my-area-grid":"my-area-scroll no-scrollbar"}>{visible.map(event=>{
        const link=event.officialUrl||event.bookingUrl||"";
        const Wrapper=link?"a":"div";
        const wrapperProps=link?{href:link,target:"_blank",rel:"noopener noreferrer"}:{};
        return <article key={event.id} className="my-area-card">
        <Wrapper {...wrapperProps} className="my-area-card-link">
          <div className="my-area-image">{event.imageUrl?<img src={event.imageUrl} alt="" loading="lazy"/>:<div className="my-area-image-fallback"><TicketIcon className="h-6 w-6"/></div>}<span>{event.subcategory||event.category}</span>{event.isFree&&<b>FREE</b>}</div>
          <div className="my-area-copy"><div className="my-area-meta"><span><PinIcon className="h-3 w-3"/>{event.district||event.region||"위치 확인 중"}</span>{event.distanceKm!=null&&<span>{event.distanceKm<1?`${Math.round(event.distanceKm*1000)}m`:`${event.distanceKm.toFixed(1)}km`}</span>}</div><h3>{event.title}</h3><p><CalendarIcon className="h-3.5 w-3.5"/>{event.dateText||"일정 확인 중"}</p><p className="my-area-venue">{event.venue||"장소 확인 중"}</p><div className="my-area-price"><span>{event.priceText||(event.isFree?"무료":"가격 확인 중")}</span>{link?<span>정보 보기 ↗</span>:<span className="my-area-no-link">상세 정보 없음</span>}</div></div>
        </Wrapper>
      </article>})}</div>}
      {!fullPage&&view==="list"&&visible.length>0&&<div className="my-area-mobile-more"><button type="button" onClick={()=>scrollMore(1)}>다음 공연 보기 <span aria-hidden="true">›</span></button></div>}
      <p className="my-area-source">공연·행사 정보 제공: KOPIS·서울특별시·한국관광공사 외 공공데이터 · 종료된 행사는 자동 제외됩니다.</p>
    </div>
  </section>
}
