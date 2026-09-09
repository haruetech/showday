"use client";

import { CalendarIcon, PinIcon, SearchIcon, SparkIcon, TicketIcon } from "@/components/Icons";

const items = [
  { href: "#show-search", label: "찾기", icon: SearchIcon },
  { href: "#popular-now", label: "인기", icon: SparkIcon },
  { href: "#shows", label: "공연", icon: CalendarIcon },
  { href: "#venues", label: "공연장", icon: PinIcon },
];

export default function ResponsiveDock(){
  return <nav className="showday-responsive-dock" aria-label="모바일 빠른 메뉴">
    {items.map(({href,label,icon:Icon})=><a key={href} href={href} className="showday-dock-item"><Icon className="h-[19px] w-[19px]"/><span>{label}</span></a>)}
    <a href="https://arena.showday.kr" target="_blank" rel="noopener noreferrer" className="showday-dock-item"><TicketIcon className="h-[19px] w-[19px]"/><span>ARENA</span></a>
  </nav>
}
