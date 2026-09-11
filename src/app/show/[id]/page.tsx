"use client";

import { useEffect,useMemo,useState } from "react";
import { useParams } from "next/navigation";
import { ArrowIcon, BellIcon, HeartIcon, TicketIcon } from "@/components/Icons";
import { createClient } from "@/lib/supabase/client";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import ShowCard from "@/components/ShowCard";
import SectionRow from "@/components/SectionRow";
import Header from "@/components/Header";
import type { Show } from "@/types/show";

type Detail={id:string;title:string;genre:string;venue:string;period:string;timeGuide:string;cast:string;crew:string;producer:string;synopsis:string;posterUrl?:string;priceLabel:string;priceGuide:string;ageLabel:string;runningTime:string;status:string;bookingUrl?:string};
const favKey="showday:favourite-shows";const alertKey="showday:show-alerts";
function loadSet(key:string){try{return new Set<string>(JSON.parse(localStorage.getItem(key)||"[]"))}catch{return new Set<string>()}}
function saveSet(key:string,v:Set<string>){localStorage.setItem(key,JSON.stringify([...v]))}

export default function ShowDetail(){
  const {id}=useParams<{id:string}>();const [isMember,setIsMember]=useState(false);const [mode,setMode]=useState<"guest"|"member">("guest");const [d,setD]=useState<Detail|null|undefined>(undefined);const [ended,setEnded]=useState(false);const [similar,setSimilar]=useState<Show[]>([]);const [saved,setSaved]=useState(false);const [alerted,setAlerted]=useState(false);const [shareMsg,setShareMsg]=useState("");
  useEffect(()=>{const supabase=createClient();supabase?.auth.getSession().then(({data})=>setIsMember(Boolean(data.session)));const {data:listener}=supabase?.auth.onAuthStateChange((_event,session)=>setIsMember(Boolean(session)))||{data:{subscription:null}};return()=>listener.subscription?.unsubscribe()},[]);
  useEffect(()=>{setSaved(loadSet(favKey).has(id));setAlerted(loadSet(alertKey).has(id));fetch(`/api/kopis?type=detail&id=${encodeURIComponent(id)}`,{cache:"no-store"}).then(r=>r.json()).then(x=>{setEnded(Boolean(x.ended));setD(x.detail||null)}).catch(()=>setD(null))},[id]);
  // 다른 공연 카드를 눌러 이동해도(같은 페이지 컴포넌트를 재사용하는 특성상) 스크롤 위치가
  // 그대로 유지되던 문제 — id가 바뀔 때마다 항상 맨 위로 스크롤을 강제한다.
  useEffect(()=>{window.scrollTo(0,0)},[id]);
  useEffect(()=>{if(!d)return;fetch('/api/kopis?type=upcoming&rows=40',{cache:'no-store'}).then(r=>r.json()).then(x=>{const list=(x.shows||[]) as Show[];setSimilar(list.filter(s=>s.id!==id&&(s.genre===d.genre||s.venue===d.venue)).slice(0,8))}).catch(()=>setSimilar([]))},[d,id]);
  const requireLogin=()=>{if(isAuthConfigured)signInWithKakao();else alert("관심 공연 저장과 일정 알림은 로그인 후 이용할 수 있습니다.")};
  const toggle=(key:string,current:boolean,setter:(v:boolean)=>void)=>{if(!isMember){requireLogin();return}const set=loadSet(key);current?set.delete(id):set.add(id);saveSet(key,set);setter(!current)};
  const copyShareLink=async()=>{let copied=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(window.location.href);copied=true}}catch{}if(!copied){try{const el=document.createElement("textarea");el.value=window.location.href;el.setAttribute("readonly","");el.style.position="fixed";el.style.left="-9999px";document.body.appendChild(el);el.select();copied=document.execCommand("copy");document.body.removeChild(el)}catch{copied=false}}setShareMsg(copied?"공연 링크를 복사했습니다.":"주소창의 공연 링크를 복사해 공유해 주세요.");setTimeout(()=>setShareMsg(""),3000)};
  const shareShow=async()=>{
    try{
      const shareData={title:d?.title||"SHOWDAY 공연정보",text:d?`${d.title} · ${d.period} · ${d.venue}`:"SHOWDAY 공연정보",url:window.location.href};
      // PC(마우스 입력 위주)에서는 OS 공유창이 뜰 앱이 마땅히 없어 빈 채로 떴다가
      // 바로 닫혀버리는 경우가 많다. 터치 입력이 주된 기기(폰·태블릿)에서만
      // navigator.share를 쓰고, PC에서는 바로 링크 복사로 보낸다.
      const isTouchPrimary = typeof window!=="undefined" && typeof window.matchMedia==="function" && window.matchMedia("(pointer: coarse)").matches;
      if(isTouchPrimary&&typeof navigator!=="undefined"&&typeof navigator.share==="function"){
        try{
          await navigator.share(shareData);
          return;
        }catch(err){
          // 사용자가 공유 시트에서 직접 취소한 경우는 실패로 취급하지 않고 조용히 종료한다.
          if(err instanceof DOMException&&err.name==="AbortError")return;
        }
      }
      await copyShareLink();
    }catch{
      // 공유·복사가 모두 막힌 환경(예: 일부 인앱 브라우저)에서도 사용자에게 안내는 반드시 보여준다.
      setShareMsg("주소창의 공연 링크를 복사해 공유해 주세요.");
      setTimeout(()=>setShareMsg(""),3000);
    }
  };

  return <><Header mode={mode} onModeChange={setMode}/><main className="min-h-screen bg-ink text-paper"><div className="mx-auto max-w-[1180px] px-6 py-8"><a href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-paper"><ArrowIcon className="h-3.5 w-3.5 rotate-180"/>목록으로</a>
    {d===undefined?<div className="mt-10 border-y border-line py-10 text-sm text-muted">공연 상세정보를 불러오는 중입니다.</div>:!d?<div className="mt-10 border-y border-line py-10"><h1 className="text-2xl font-black">{ended?"종료된 공연입니다.":"공연 상세정보를 찾지 못했습니다."}</h1><p className="mt-3 text-sm text-muted">{ended?"SHOWDAY는 현재 진행 중이거나 앞으로 예정된 공연만 소개합니다.":"공연정보가 갱신 중이거나 상세정보가 아직 등록되지 않았을 수 있습니다."}</p><a href="/" className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-bold text-paper">현재·예정 공연 보기 <ArrowIcon className="h-3.5 w-3.5"/></a></div>:<>
      <section className="mt-9 grid gap-10 border-t border-line pt-9 lg:grid-cols-[330px_1fr]">
        <div className="aspect-[3/4] overflow-hidden bg-surface-raised">{d.posterUrl?<img src={d.posterUrl} alt={`${d.title} 포스터`} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-sm text-muted">포스터 준비중</div>}</div>
        <div className="py-1"><div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[.08em]"><span className="text-gold">{d.genre}</span><span className="h-3 w-px bg-line"/><span className="text-muted">{d.status||"공연"}</span></div><h1 className="mt-5 text-3xl font-black leading-[1.2] sm:text-5xl">{d.title}</h1><p className="mt-5 text-base font-semibold text-paper">{d.venue}</p>
          <div className="mt-8 grid border-y border-line sm:grid-cols-2"><Info label="공연기간" value={d.period}/><Info label="공연시간" value={d.timeGuide||d.runningTime}/><Info label="관람연령" value={d.ageLabel}/><Info label="티켓" value={d.priceGuide||d.priceLabel}/></div>
          <div className="mt-7 flex flex-wrap gap-2"><button onClick={()=>toggle(favKey,saved,setSaved)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${saved?"border-gold bg-gold/8 text-gold":"border-line text-paper"}`}><HeartIcon filled={saved} className="h-4 w-4"/>{saved?"관심 공연 저장됨":"관심 공연 저장"}</button><button onClick={()=>toggle(alertKey,alerted,setAlerted)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${alerted?"border-gold bg-gold/8 text-gold":"border-line text-paper"}`}><BellIcon className="h-4 w-4"/>{alerted?"일정 알림 설정됨":"일정 알림 받기"}</button><div className="relative"><button type="button" onClick={shareShow} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-bold text-paper">공연정보 공유</button></div></div>{shareMsg&&<p className="mt-3 text-xs font-semibold text-gold">{shareMsg}</p>}{!isMember&&<p className="mt-3 text-xs text-muted">관심 공연 저장과 일정 알림은 로그인 후 이용할 수 있습니다.</p>}
          {d.bookingUrl&&<a href={d.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-black text-white transition hover:bg-gold"><TicketIcon className="h-4 w-4"/>예매처에서 좌석·가격 확인 <ArrowIcon className="h-4 w-4"/></a>}
        </div>
      </section>
      <section className="mt-14 grid gap-10 border-t border-line pt-9 lg:grid-cols-[1fr_300px]"><div><p className="text-[10px] font-semibold tracking-[.16em] text-gold">ABOUT THE SHOW</p><h2 className="mt-2 text-2xl font-black">공연 소개</h2><p className="mt-5 whitespace-pre-line text-sm leading-8 text-muted">{d.synopsis||"공연 소개 정보가 등록되면 SHOWDAY에서 바로 확인할 수 있습니다."}</p></div><aside className="border-t border-line lg:border-l lg:border-t-0 lg:pl-7"><DetailLine label="출연" value={d.cast}/><DetailLine label="제작진" value={d.crew}/><DetailLine label="기획·제작" value={d.producer}/><DetailLine label="러닝타임" value={d.runningTime}/></aside></section>
      {similar.length>0&&<SectionRow eyebrow="YOU MAY ALSO LIKE" title="비슷한 공연도 확인해보세요">{similar.map(s=><ShowCard key={s.id} show={s}/>)}</SectionRow>}
    </>}
  </div></main></>
}
function Info({label,value}:{label:string;value?:string}){return <div className="border-b border-line py-4 sm:px-4"><p className="text-[10px] font-semibold tracking-[.08em] text-muted">{label}</p><p className="mt-2 text-sm font-bold leading-6 text-paper">{value||"정보 없음"}</p></div>}
function DetailLine({label,value}:{label:string;value?:string}){if(!value)return null;return <div className="border-b border-line py-4 first:pt-0"><p className="text-[10px] font-semibold tracking-[.08em] text-muted">{label}</p><p className="mt-2 text-sm leading-6 text-paper">{value}</p></div>}
