"use client";

import { CalendarIcon, PinIcon, SearchIcon, TicketIcon } from "@/components/common/Icons";

export default function ResponsiveDock() {
  function quickFree(){
    if(window.location.pathname!=="/"){
      sessionStorage.setItem("showday:pending-quick","free_start");
      window.location.href="/#quick-search";
      return;
    }
    window.dispatchEvent(new CustomEvent("showday:quick-search",{detail:"free_start"}));
  }
  return (
    <nav className="showday-responsive-dock" aria-label="모바일 빠른 메뉴">
      <a href="/#show-search" className="showday-dock-item"><SearchIcon className="h-[19px] w-[19px]"/><span>찾기</span></a>
      <a href="/#my-area" className="showday-dock-item"><PinIcon className="h-[19px] w-[19px]"/><span>내 주변</span></a>
      <button type="button" onClick={quickFree} className="showday-dock-item"><span className="showday-dock-free" aria-hidden="true">₩0</span><span>무료</span></button>
      <a href="/#showday-now" className="showday-dock-item"><CalendarIcon className="h-[19px] w-[19px]"/><span>티켓·소식</span></a>
      <a href="/my" className="showday-dock-item"><TicketIcon className="h-[19px] w-[19px]"/><span>MY</span></a>
    </nav>
  );
}
