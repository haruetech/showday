"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getFollowedArtistIds } from "@/lib/favorites";
import { createClient } from "@/lib/supabase/client";
import { isAuthConfigured, signInWithKakao } from "@/lib/auth";

const SAVED_ITEMS_KEY="showday:saved-items:v1";
const SAVED_ITEM_DETAILS_KEY="showday:saved-item-details:v1";
const SAVED_SEARCHES_KEY="showday:saved-searches:v1";
const ALERT_PREFS_KEY="showday:alert-prefs:v1";
const FREE_ALERTS_KEY="showday:free-open-alerts:v1";

type Tab="likes"|"artists"|"searches"|"alerts";
type SavedItemDetail={key:string;title:string;url?:string;imageUrl?:string;kind?:string;meta?:string;savedAt:string};
type SavedSearch={id:string;label:string;summary?:string;href?:string;createdAt?:string};
type AlertPrefs={artistNewShow:boolean;ticketOpen:boolean;freeNearby:boolean;savedSearch:boolean;ticketLead:"1d"|"1h"|"10m"};
type FreeOpenAlert={key:string;title:string;url?:string;imageUrl?:string;venue?:string;dateText?:string;applyStartDate?:string;applyEndDate?:string;status?:"open"|"soon"|"unknown"|"closed";savedReason?:string;savedAt:string};
const DEFAULT_ALERT_PREFS:AlertPrefs={artistNewShow:true,ticketOpen:true,freeNearby:false,savedSearch:false,ticketLead:"1h"};

function safeJson<T>(value:string|null,fallback:T):T{try{return value?JSON.parse(value) as T:fallback}catch{return fallback}}
function artistNameFromId(id:string){if(!id.startsWith("artist-name:"))return "";try{return decodeURIComponent(id.slice("artist-name:".length))}catch{return ""}}
function formatDate(value?:string){if(!value)return "";try{return new Intl.DateTimeFormat("ko-KR",{month:"short",day:"numeric"}).format(new Date(value))}catch{return ""}}

export default function MyShowdayPage(){
  const [tab,setTab]=useState<Tab>("likes");
  const [user,setUser]=useState<User|null>(null);
  const [authReady,setAuthReady]=useState(false);
  const [likedKeys,setLikedKeys]=useState<string[]>([]);
  const [details,setDetails]=useState<Record<string,SavedItemDetail>>({});
  const [artists,setArtists]=useState<string[]>([]);
  const [searches,setSearches]=useState<SavedSearch[]>([]);
  const [alertPrefs,setAlertPrefs]=useState<AlertPrefs>(DEFAULT_ALERT_PREFS);
  const [freeAlerts,setFreeAlerts]=useState<FreeOpenAlert[]>([]);
  const [alertNotice,setAlertNotice]=useState("");

  useEffect(()=>{
    const requested=new URLSearchParams(window.location.search).get("tab");
    if(requested==="likes"||requested==="artists"||requested==="searches"||requested==="alerts") setTab(requested);
  },[]);

  useEffect(()=>{
    if(!isAuthConfigured){
      setAuthReady(true);
      return;
    }
    const supabase=createClient();
    if(!supabase){
      setAuthReady(true);
      return;
    }
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user??null);
      setAuthReady(true);
    });
    const {data:sub}=supabase.auth.onAuthStateChange((_event,session)=>{
      setUser(session?.user??null);
      setAuthReady(true);
    });
    return ()=>sub.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user)return;
    setLikedKeys(safeJson<string[]>(localStorage.getItem(SAVED_ITEMS_KEY),[]));
    setDetails(safeJson<Record<string,SavedItemDetail>>(localStorage.getItem(SAVED_ITEM_DETAILS_KEY),{}));
    setSearches(safeJson<SavedSearch[]>(localStorage.getItem(SAVED_SEARCHES_KEY),[]));
    setAlertPrefs({...DEFAULT_ALERT_PREFS,...safeJson<Partial<AlertPrefs>>(localStorage.getItem(ALERT_PREFS_KEY),{})});
    setFreeAlerts(safeJson<FreeOpenAlert[]>(localStorage.getItem(FREE_ALERTS_KEY),[]));
    getFollowedArtistIds().then(ids=>setArtists(Array.from(ids).map(artistNameFromId).filter(Boolean))).catch(()=>setArtists([]));
  },[user]);

  const likedItems=useMemo(()=>likedKeys.map(key=>details[key]||{key,title:"좋아요한 콘텐츠",savedAt:""}).sort((a,b)=>(b.savedAt||"").localeCompare(a.savedAt||"")),[likedKeys,details]);

  function saveAlertPrefs(patch:Partial<AlertPrefs>){
    const next={...alertPrefs,...patch}; setAlertPrefs(next); localStorage.setItem(ALERT_PREFS_KEY,JSON.stringify(next)); setAlertNotice("알림 설정을 저장했습니다."); setTimeout(()=>setAlertNotice(""),2000);
  }

  function removeFreeAlert(key:string){
    const next=freeAlerts.filter(v=>v.key!==key); setFreeAlerts(next); localStorage.setItem(FREE_ALERTS_KEY,JSON.stringify(next));
  }

  function removeLike(key:string){
    const next=likedKeys.filter(v=>v!==key); setLikedKeys(next); localStorage.setItem(SAVED_ITEMS_KEY,JSON.stringify(next));
    const nextDetails={...details}; delete nextDetails[key]; setDetails(nextDetails); localStorage.setItem(SAVED_ITEM_DETAILS_KEY,JSON.stringify(nextDetails));
  }

  const tabs:[Tab,string,string][]=[
    ["likes","좋아요","마음에 둔 공연·전시·체험"],
    ["artists","관심 아티스트","좋아하는 아티스트 모아보기"],
    ["searches","저장한 검색","자주 찾는 조건 다시 사용"],
    ["alerts","알림 설정","놓치고 싶지 않은 소식 관리"],
  ];

  if(!authReady){
    return <MyGate title="MY SHOWDAY 확인 중" desc="로그인 상태를 확인하고 있습니다." loading/>;
  }

  if(!user){
    return <MyGate
      title="MY SHOWDAY는 로그인 후 이용할 수 있어요"
      desc="좋아요한 공연·전시·체험, 관심 아티스트, 저장한 검색조건과 알림을 한곳에서 관리합니다."
      onLogin={()=>signInWithKakao()}
    />;
  }

  return <main className="min-h-screen bg-[#f8f6f2] text-[#251b16]">
    <div className="border-b border-[#e8dfd7] bg-white/95">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-black tracking-tight text-xl">SHOWDAY</Link>
        <Link href="/" className="rounded-full border border-[#dfd4ca] px-4 py-2 text-xs font-black hover:border-[#c77b46]">← SHOWDAY 홈</Link>
      </div>
    </div>

    <section className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="rounded-[28px] bg-[#241a16] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <p className="text-[11px] font-black tracking-[.2em] text-[#e5a16f]">MY SHOWDAY</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">내가 좋아한 문화생활을 한곳에서</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">좋아요한 콘텐츠, 관심 아티스트, 저장한 검색조건과 알림을 모아 관리합니다. 다시 찾을 때 처음부터 검색하지 않아도 됩니다.</p>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
          <Summary value={likedKeys.length} label="좋아요"/>
          <Summary value={artists.length} label="관심 아티스트"/>
          <Summary value={searches.length} label="저장한 검색"/>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-6 border-y border-[#e8dfd7] bg-[#f8f6f2]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map(([id,label,desc])=><button key={id} onClick={()=>setTab(id)} className={`min-h-[48px] rounded-xl px-3 py-2 text-left transition ${tab===id?"bg-[#251b16] text-white shadow-sm":"bg-white text-[#251b16] hover:bg-[#fff7ef]"}`}><b className="block text-xs sm:text-sm">{label}</b><span className={`mt-0.5 hidden text-[10px] sm:block ${tab===id?"text-white/60":"text-[#8f8177]"}`}>{desc}</span></button>)}
        </div>
      </div>

      <div className="mt-6">
        {tab==="likes"&&<section>
          <SectionTitle title="좋아요한 콘텐츠" desc="하트를 누른 공연·전시·체험·행사를 다시 확인할 수 있어요." count={likedItems.length}/>
          {likedItems.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{likedItems.map(item=><article key={item.key} className="overflow-hidden rounded-2xl border border-[#e7ddd4] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            {item.url?<a href={item.url} className="block" target={item.url.startsWith("http")?"_blank":undefined} rel="noopener noreferrer"><LikeCard item={item}/></a>:<LikeCard item={item}/>} 
            <div className="flex items-center justify-between border-t border-[#eee5de] px-4 py-3"><span className="text-[10px] font-bold text-[#9c8a7d]">{item.savedAt?`${formatDate(item.savedAt)} 저장`:"저장됨"}</span><button onClick={()=>removeLike(item.key)} className="rounded-full border border-[#e3d8cf] px-3 py-1.5 text-[11px] font-black text-[#7a6252] hover:border-[#c77b46]">좋아요 취소</button></div>
          </article>)}</div>:<Empty title="아직 좋아요한 콘텐츠가 없어요" desc="마음에 드는 공연·전시·체험 카드에서 ♡ 좋아요를 눌러보세요." action="좋아할 콘텐츠 찾기" href="/#show-search"/>}
        </section>}

        {tab==="artists"&&<section>
          <SectionTitle title="관심 아티스트" desc="좋아하는 가수·배우·연주자의 공연을 더 빨리 찾기 위한 공간입니다." count={artists.length}/>
          {artists.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{artists.map(name=><div key={name} className="rounded-2xl border border-[#e7ddd4] bg-white p-5"><span className="text-[10px] font-black tracking-[.12em] text-[#c77b46]">MY ARTIST</span><h3 className="mt-2 text-lg font-black">{name}</h3><p className="mt-1 text-xs leading-5 text-[#8f8177]">새 공연과 티켓 오픈 정보를 연결할 수 있도록 등록된 관심 아티스트입니다.</p><Link href={`/artists?artist=${encodeURIComponent(name)}`} className="mt-4 inline-flex rounded-full bg-[#251b16] px-4 py-2 text-xs font-black text-white">관련 공연 찾아보기</Link></div>)}</div>:<Empty title="관심 아티스트를 등록해보세요" desc="원하는 아티스트 이름을 직접 검색해 관심 아티스트로 저장할 수 있어요." action="관심 아티스트 등록" href="/artists"/>}
        </section>}

        {tab==="searches"&&<section>
          <SectionTitle title="저장한 검색" desc="예: 아이와·이번 주말·내 주변 30km처럼 자주 쓰는 조건을 보관하는 공간입니다." count={searches.length}/>
          {searches.length?<div className="space-y-3">{searches.map(s=><a key={s.id} href={s.href||"/#show-search"} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7ddd4] bg-white p-4 hover:border-[#c77b46]"><div><b className="text-sm">{s.label}</b>{s.summary&&<p className="mt-1 text-xs text-[#8f8177]">{s.summary}</p>}</div><span className="text-xs font-black">다시 검색 →</span></a>)}</div>:<Empty title="저장한 검색조건이 아직 없어요" desc="검색 결과에서 자주 사용하는 조건을 저장하면 다음 방문 때 바로 다시 사용할 수 있습니다." action="조건 검색하기" href="/#show-search"/>}
        </section>}

        {tab==="alerts"&&<section>
          <SectionTitle title="알림 설정" desc="관심 아티스트·티켓 오픈·무료행사·저장한 검색조건 중 필요한 소식만 선택합니다."/>
          {alertNotice&&<div className="mb-3 rounded-xl bg-[#251b16] px-4 py-3 text-xs font-black text-white">{alertNotice}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <AlertSwitch title="관심 아티스트 새 공연" desc="등록한 아티스트의 새로운 공연이 SHOWDAY에 확인되면 알림 대상으로 저장합니다." checked={alertPrefs.artistNewShow} onChange={v=>saveAlertPrefs({artistNewShow:v})}/>
            <AlertSwitch title="티켓 오픈" desc="관심 공연의 공식 예매 시작일·최초 시간이 확인되면 티켓 오픈 알림 대상으로 저장합니다." checked={alertPrefs.ticketOpen} onChange={v=>saveAlertPrefs({ticketOpen:v})}/>
            <AlertSwitch title="내 주변 무료 행사" desc="저장한 지역 기준으로 새 무료 공연·전시·행사가 확인되면 알림 대상으로 저장합니다." checked={alertPrefs.freeNearby} onChange={v=>saveAlertPrefs({freeNearby:v})}/>
            <AlertSwitch title="저장한 검색조건 새 소식" desc="저장한 조건과 맞는 신규 콘텐츠가 들어오면 다시 확인할 수 있도록 알림 대상으로 저장합니다." checked={alertPrefs.savedSearch} onChange={v=>saveAlertPrefs({savedSearch:v})}/>
          </div>
          {alertPrefs.ticketOpen&&<div className="mt-4 rounded-2xl border border-[#ead7c6] bg-[#fff8f0] p-4"><b className="text-xs text-[#251b16]">티켓 오픈 사전 알림</b><div className="mt-3 flex flex-wrap gap-2">{([["1d","하루 전"],["1h","1시간 전"],["10m","10분 전"]] as const).map(([v,label])=><button key={v} onClick={()=>saveAlertPrefs({ticketLead:v})} className={`rounded-full border px-3 py-2 text-[11px] font-black ${alertPrefs.ticketLead===v?"border-[#c77b46] bg-[#fff0e3] text-[#b96730]":"border-[#dfd4ca] bg-white text-[#715a4a]"}`}>{label}</button>)}</div></div>}
          <div className="mt-5">
            <SectionTitle title="내 무료공연 신청·예매 알림" desc="무료공연 카드에서 저장한 오픈예정·일정미공개·마감 전 알림을 여기서 관리합니다." count={freeAlerts.length}/>
            {freeAlerts.length?<div className="space-y-3">{freeAlerts.map(item=>{const label=item.status==="open"?"지금 신청 가능":item.status==="soon"?"곧 신청 오픈":item.status==="closed"?"신청마감":"일정 미공개";return <div key={item.key} className="rounded-2xl border border-[#e7ddd4] bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#fff3e7] px-2 py-1 text-[10px] font-black text-[#a65f31]">{label}</span>{item.applyStartDate&&<span className="text-[10px] font-bold text-[#8f8177]">오픈 {item.applyStartDate}</span>}{item.applyEndDate&&<span className="text-[10px] font-bold text-[#8f8177]">마감 {item.applyEndDate}</span>}</div><b className="mt-2 block truncate text-sm text-[#251b16]">{item.title}</b><p className="mt-1 text-[11px] leading-5 text-[#8f8177]">{[item.venue,item.dateText].filter(Boolean).join(" · ")||"공식 일정 확인 대기"}</p></div><div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">{item.status==="open"&&item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#251b16] px-4 py-2 text-[11px] font-black text-white">지금 신청하기 ↗</a>}{item.url&&item.status!=="open"&&<a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#dfd4ca] px-4 py-2 text-[11px] font-black text-[#6f5949]">공식 페이지 ↗</a>}<button onClick={()=>removeFreeAlert(item.key)} className="rounded-full border border-[#dfd4ca] px-3 py-2 text-[11px] font-black text-[#8a6d59]">알림 삭제</button></div></div>})}</div>:<Empty title="저장한 무료공연 알림이 없어요" desc="무료공연 검색에서 오픈 알림받기 또는 예매일정 알림받기를 누르면 여기에 자동 저장됩니다." action="무료공연 찾기" href="/#show-search"/>}
          </div>
          <div className="mt-4 rounded-2xl border border-[#ead7c6] bg-[#fff8f0] p-4 text-xs leading-5 text-[#715a4a]">설정값은 저장되어 관심 아티스트 화면과 공유됩니다. 실제 웹푸시·카카오 발송은 발송 서버와 해당 채널이 연결된 항목부터 동작합니다. 공식 예매 오픈 시간이 없는 공연은 임의 시간을 만들지 않고 ‘미확인’으로 표시합니다.</div>
        </section>}
      </div>
    </section>
  </main>
}

function MyGate({title,desc,onLogin,loading=false}:{title:string;desc:string;onLogin?:()=>void;loading?:boolean}){
  return <main className="min-h-screen bg-[#f8f6f2] text-[#251b16]">
    <div className="border-b border-[#e8dfd7] bg-white/95">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-black tracking-tight text-xl">SHOWDAY</Link>
        <Link href="/" className="rounded-full border border-[#dfd4ca] px-4 py-2 text-xs font-black hover:border-[#c77b46]">SHOWDAY 홈</Link>
      </div>
    </div>
    <section className="mx-auto grid min-h-[72vh] max-w-[760px] place-items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-[30px] border border-[#eadfd6] bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff3e7] text-xl font-black text-[#c77b46]">MY</div>
        <p className="mt-5 text-[11px] font-black tracking-[.18em] text-[#c77b46]">MY SHOWDAY</p>
        <h1 className="mt-2 text-xl font-black tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#82746a]">{desc}</p>
        {loading?<div className="mx-auto mt-6 h-7 w-7 animate-spin rounded-full border-2 border-[#eadfd6] border-t-[#c77b46]" aria-label="로그인 상태 확인 중"/>:<>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2 text-left text-[11px] text-[#725f52] sm:grid-cols-4">
            <span className="rounded-xl bg-[#faf6f2] px-3 py-2.5">♡ 좋아요</span>
            <span className="rounded-xl bg-[#faf6f2] px-3 py-2.5">★ 관심 아티스트</span>
            <span className="rounded-xl bg-[#faf6f2] px-3 py-2.5">⌕ 저장 검색</span>
            <span className="rounded-xl bg-[#faf6f2] px-3 py-2.5">● 알림 설정</span>
          </div>
          {onLogin&&<button onClick={onLogin} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FEE500] px-6 py-3 text-sm font-black text-[#191600] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#191600] text-[10px] text-[#FEE500]">K</span>카카오로 로그인</button>}
          <p className="mt-4 text-[11px] leading-5 text-[#9a8b80]">로그인하면 좋아요한 콘텐츠를 MY SHOWDAY에서 바로 확인할 수 있습니다.</p>
        </>}
      </div>
    </section>
  </main>
}

function Summary({value,label}:{value:number;label:string}){return <div className="rounded-2xl bg-white/8 p-3 sm:p-4"><b className="block text-xl font-black sm:text-2xl">{value}</b><span className="mt-1 block text-[10px] font-bold text-white/55 sm:text-xs">{label}</span></div>}
function SectionTitle({title,desc,count}:{title:string;desc:string;count?:number}){return <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black sm:text-2xl">{title}</h2><p className="mt-1 text-xs leading-5 text-[#8f8177] sm:text-sm">{desc}</p></div>{typeof count==="number"&&<span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black shadow-sm">{count}개</span>}</div>}
function Empty({title,desc,action,href}:{title:string;desc:string;action:string;href:string}){return <div className="rounded-3xl border border-dashed border-[#dccfc4] bg-white px-5 py-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff4e7] text-xl">♡</div><h3 className="mt-4 text-base font-black">{title}</h3><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8f8177]">{desc}</p><Link href={href} className="mt-5 inline-flex rounded-full bg-[#251b16] px-5 py-2.5 text-xs font-black text-white">{action}</Link></div>}
function LikeCard({item}:{item:SavedItemDetail}){return <div className="grid grid-cols-[92px_1fr] gap-3 p-3 sm:grid-cols-[104px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#f1ece7]">{item.imageUrl?<img src={item.imageUrl} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-[10px] font-black text-[#a39285]">SHOWDAY</div>}</div><div className="min-w-0 py-1"><span className="text-[10px] font-black text-[#c77b46]">{item.kind||"관심 콘텐츠"}</span><h3 className="mt-1 line-clamp-2 text-sm font-black leading-5">{item.title}</h3>{item.meta&&<p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#8f8177]">{item.meta}</p>}<span className="mt-3 inline-flex text-[11px] font-black">상세 보기 →</span></div></div>}
function AlertSwitch({title,desc,checked,onChange}:{title:string;desc:string;checked:boolean;onChange:(v:boolean)=>void}){return <button onClick={()=>onChange(!checked)} className={`flex items-start justify-between gap-4 rounded-2xl border bg-white p-5 text-left transition ${checked?"border-[#c77b46]":"border-[#e7ddd4]"}`}><div><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{title}</b><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${checked?"bg-[#fff0e3] text-[#b96730]":"bg-[#f4eee9] text-[#8a7465]"}`}>{checked?"알림 대상":"꺼짐"}</span></div><p className="mt-2 text-xs leading-5 text-[#8f8177]">{desc}</p></div><span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full ${checked?"bg-[#c77b46]":"bg-[#d8cec6]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked?"left-6":"left-1"}`}/></span></button>}
