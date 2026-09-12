"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/common/Icons";

export default function SectionRow({eyebrow,title,action,children,id}:{eyebrow?:string;title:string;action?:ReactNode;children:ReactNode;id?:string}){
  const trackRef=useRef<HTMLDivElement>(null);const [left,setLeft]=useState(false);const [right,setRight]=useState(false);
  const update=()=>{const el=trackRef.current;if(!el)return;setLeft(el.scrollLeft>4);setRight(el.scrollLeft+el.clientWidth<el.scrollWidth-4)};
  useEffect(()=>{update();const el=trackRef.current;if(!el)return;const on=()=>update();window.addEventListener("resize",on);const ro=new ResizeObserver(update);ro.observe(el);return()=>{window.removeEventListener("resize",on);ro.disconnect()}},[children]);
  const move=(d:1|-1)=>{const el=trackRef.current;if(el)el.scrollBy({left:d*Math.max(320,el.clientWidth*.82),behavior:"smooth"})};
  return <section id={id} className="mx-auto w-full max-w-[1280px] px-4 py-9 sm:px-6 sm:py-12">
    <div className="mb-5 flex items-end justify-between gap-3 border-t border-line pt-6 sm:mb-6 sm:gap-4 sm:pt-7"><div className="min-w-0">{eyebrow&&<p className="text-[10px] font-semibold tracking-[.16em] text-gold">{eyebrow}</p>}<h2 className="mt-2 text-xl font-black leading-7 text-paper sm:text-3xl">{title}</h2></div><div className="shrink-0">{action}</div></div>
    <div className="relative">
      <div ref={trackRef} onScroll={update} className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 pr-[18vw] scroll-smooth sm:gap-5 sm:pr-2 sm:snap-proximity [&>*]:snap-start">{children}</div>
      <div className="mt-4 hidden items-center justify-end gap-2 sm:flex">
        {left&&<button onClick={()=>move(-1)} aria-label="이전" className="grid h-9 w-9 place-items-center rounded-full border border-line text-paper transition hover:border-gold"><ArrowIcon className="h-4 w-4 rotate-180"/></button>}
        {right&&<button onClick={()=>move(1)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/30 px-4 py-2 text-xs font-bold text-paper transition hover:border-gold hover:text-gold">공연 더보기 <ArrowIcon className="h-4 w-4"/></button>}
      </div>
    </div>
  </section>
}
