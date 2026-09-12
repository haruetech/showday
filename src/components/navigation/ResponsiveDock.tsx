"use client";

import { CalendarIcon, PinIcon, SearchIcon, SparkIcon, TicketIcon } from "@/components/common/Icons";

const items = [
  { href: "/#show-search", label: "찾기", icon: SearchIcon },
  { href: "/#popular-now", label: "인기", icon: SparkIcon },
  { href: "/#my-area", label: "내 주변", icon: PinIcon },
  { href: "/#genre-discovery", label: "장르", icon: CalendarIcon },
];

export default function ResponsiveDock(){
  return <nav className="showday-responsive-dock" aria-label="모바일 빠른 메뉴">
    {items.map(({href,label,icon:Icon})=><a key={href} href={href} className="showday-dock-item"><Icon className="h-[19px] w-[19px]"/><span>{label}</span></a>)}
    <a href="https://arena.showday.kr" target="_blank" rel="noopener noreferrer" className="showday-dock-item"><TicketIcon className="h-[19px] w-[19px]"/><span>ARENA</span></a>
  </nav>
}
