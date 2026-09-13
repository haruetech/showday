"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getFollowedArtistIds } from "@/lib/favorites";

const SAVED_ITEMS_KEY="showday:saved-items:v1";
const SAVED_ITEM_DETAILS_KEY="showday:saved-item-details:v1";
const SAVED_SEARCHES_KEY="showday:saved-searches:v1";

type Tab="likes"|"artists"|"searches"|"alerts";
type SavedItemDetail={key:string;title:string;url?:string;imageUrl?:string;kind?:string;meta?:string;savedAt:string};
type SavedSearch={id:string;label:string;summary?:string;href?:string;createdAt?:string};

function safeJson<T>(value:string|null,fallback:T):T{try{return value?JSON.parse(value) as T:fallback}catch{return fallback}}
function artistNameFromId(id:string){if(!id.startsWith("artist-name:"))return "";try{return decodeURIComponent(id.slice("artist-name:".length))}catch{return ""}}
function formatDate(value?:string){if(!value)return "";try{return new Intl.DateTimeFormat("ko-KR",{month:"short",day:"numeric"}).format(new Date(value))}catch{return ""}}

export default function MyShowdayPage(){
  const [tab,setTab]=useState<Tab>("likes");
  const [likedKeys,setLikedKeys]=useState<string[]>([]);
  const [details,setDetails]=useState<Record<string,SavedItemDetail>>({});
  const [artists,setArtists]=useState<string[]>([]);
  const [searches,setSearches]=useState<SavedSearch[]>([]);

  useEffect(()=>{
    setLikedKeys(safeJson<string[]>(localStorage.getItem(SAVED_ITEMS_KEY),[]));
    setDetails(safeJson<Record<string,SavedItemDetail>>(localStorage.getItem(SAVED_ITEM_DETAILS_KEY),{}));
    setSearches(safeJson<SavedSearch[]>(localStorage.getItem(SAVED_SEARCHES_KEY),[]));
    getFollowedArtistIds().then(ids=>setArtists(Array.from(ids).map(artistNameFromId).filter(Boolean))).catch(()=>setArtists([]));
  },[]);

  const likedItems=useMemo(()=>likedKeys.map(key=>details[key]||{key,title:"좋아요한 콘텐츠",savedAt:""}).sort((a,b)=>(b.savedAt||"").localeCompare(a.savedAt||"")),[likedKeys,details]);

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

  return <main className="min-h-screen bg-[#f8f6f2] text-[#251b16]">
    <div className="border-b border-[#e8dfd7] bg-white/95">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-black tracking-tight text-xl">SHOWDAY</Link>
        <Link href="/" className="rounded-full border border-[#dfd4ca] px-4 py-2 text-xs font-black hover:border-[#c77b46]">← 공연 찾기로</Link>
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
          {artists.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{artists.map(name=><div key={name} className="rounded-2xl border border-[#e7ddd4] bg-white p-5"><span className="text-[10px] font-black tracking-[.12em] text-[#c77b46]">MY ARTIST</span><h3 className="mt-2 text-lg font-black">{name}</h3><p className="mt-1 text-xs leading-5 text-[#8f8177]">새 공연과 티켓 오픈 정보를 연결할 수 있도록 등록된 관심 아티스트입니다.</p><Link href={`/?artist=${encodeURIComponent(name)}#show-search`} className="mt-4 inline-flex rounded-full bg-[#251b16] px-4 py-2 text-xs font-black text-white">관련 공연 찾아보기</Link></div>)}</div>:<Empty title="관심 아티스트를 등록해보세요" desc="원하는 아티스트 이름을 직접 검색해 관심 아티스트로 저장할 수 있어요." action="관심 아티스트 등록" href="/#interest-artists"/>}
        </section>}

        {tab==="searches"&&<section>
          <SectionTitle title="저장한 검색" desc="예: 아이와·이번 주말·내 주변 30km처럼 자주 쓰는 조건을 보관하는 공간입니다." count={searches.length}/>
          {searches.length?<div className="space-y-3">{searches.map(s=><a key={s.id} href={s.href||"/#show-search"} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7ddd4] bg-white p-4 hover:border-[#c77b46]"><div><b className="text-sm">{s.label}</b>{s.summary&&<p className="mt-1 text-xs text-[#8f8177]">{s.summary}</p>}</div><span className="text-xs font-black">다시 검색 →</span></a>)}</div>:<Empty title="저장한 검색조건이 아직 없어요" desc="검색 결과에서 자주 사용하는 조건을 저장하면 다음 방문 때 바로 다시 사용할 수 있습니다." action="조건 검색하기" href="/#show-search"/>}
        </section>}

        {tab==="alerts"&&<section>
          <SectionTitle title="알림 설정" desc="필요한 소식만 골라 받을 수 있도록 준비하는 공간입니다."/>
          <div className="grid gap-3 sm:grid-cols-2">
            <AlertCard title="관심 아티스트 새 공연" desc="등록한 아티스트의 새 공연이 확인되면 알려드리는 기능입니다." status="연결 준비"/>
            <AlertCard title="티켓 오픈" desc="관심 공연의 예매가 시작되는 시점을 놓치지 않도록 연결합니다." status="연결 준비"/>
            <AlertCard title="내 주변 무료 행사" desc="저장한 지역 기준으로 무료 공연·전시·행사를 확인하기 쉽게 구성합니다." status="연결 준비"/>
            <AlertCard title="저장한 검색조건 새 소식" desc="내가 저장한 조건에 맞는 새로운 콘텐츠를 다시 찾기 쉽게 연결합니다." status="연결 준비"/>
          </div>
          <div className="mt-4 rounded-2xl border border-[#ead7c6] bg-[#fff8f0] p-4 text-xs leading-5 text-[#715a4a]">알림은 현재 단계적으로 연결 중입니다. 실제 발송이 연결되기 전까지는 ‘알림 설정 완료’처럼 오해할 수 있는 표현을 사용하지 않습니다.</div>
        </section>}
      </div>
    </section>
  </main>
}

function Summary({value,label}:{value:number;label:string}){return <div className="rounded-2xl bg-white/8 p-3 sm:p-4"><b className="block text-xl font-black sm:text-2xl">{value}</b><span className="mt-1 block text-[10px] font-bold text-white/55 sm:text-xs">{label}</span></div>}
function SectionTitle({title,desc,count}:{title:string;desc:string;count?:number}){return <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black sm:text-2xl">{title}</h2><p className="mt-1 text-xs leading-5 text-[#8f8177] sm:text-sm">{desc}</p></div>{typeof count==="number"&&<span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black shadow-sm">{count}개</span>}</div>}
function Empty({title,desc,action,href}:{title:string;desc:string;action:string;href:string}){return <div className="rounded-3xl border border-dashed border-[#dccfc4] bg-white px-5 py-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff4e7] text-xl">♡</div><h3 className="mt-4 text-base font-black">{title}</h3><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8f8177]">{desc}</p><Link href={href} className="mt-5 inline-flex rounded-full bg-[#251b16] px-5 py-2.5 text-xs font-black text-white">{action}</Link></div>}
function LikeCard({item}:{item:SavedItemDetail}){return <div className="grid grid-cols-[92px_1fr] gap-3 p-3 sm:grid-cols-[104px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#f1ece7]">{item.imageUrl?<img src={item.imageUrl} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-[10px] font-black text-[#a39285]">SHOWDAY</div>}</div><div className="min-w-0 py-1"><span className="text-[10px] font-black text-[#c77b46]">{item.kind||"관심 콘텐츠"}</span><h3 className="mt-1 line-clamp-2 text-sm font-black leading-5">{item.title}</h3>{item.meta&&<p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#8f8177]">{item.meta}</p>}<span className="mt-3 inline-flex text-[11px] font-black">상세 보기 →</span></div></div>}
function AlertCard({title,desc,status}:{title:string;desc:string;status:string}){return <div className="rounded-2xl border border-[#e7ddd4] bg-white p-5"><div className="flex items-center justify-between gap-3"><b className="text-sm">{title}</b><span className="rounded-full bg-[#f4eee9] px-2.5 py-1 text-[10px] font-black text-[#8a7465]">{status}</span></div><p className="mt-2 text-xs leading-5 text-[#8f8177]">{desc}</p></div>}
