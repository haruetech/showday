"use client";
import { useEffect, useState } from "react";

const DISMISS_KEY = "showday:ad-popup-dismissed-until";

type FeaturedShow = {
  id: string; title: string; genre: string; venue: string; period: string; priceLabel: string; posterUrl: string;
};

function isDismissedToday() {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return new Date().getTime() < Number(until);
  } catch {
    return false;
  }
}

function dismissUntilTomorrow() {
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0); // 오늘 자정(=내일 0시)까지
  try { localStorage.setItem(DISMISS_KEY, String(tomorrow.getTime())); } catch {}
}

export default function ShowAdPopup() {
  const [show, setShow] = useState<FeaturedShow | null>(null);
  const [visible, setVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (isDismissedToday()) return;
    fetch("/api/manual-shows/featured")
      .then((r) => r.json())
      .then((d) => {
        if (d.show) { setShow(d.show); setVisible(true); }
      })
      .catch(() => {});
  }, []);

  const close = () => {
    if (dontShowToday) dismissUntilTomorrow();
    setVisible(false);
  };

  if (!visible || !show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative">
          <button onClick={close} aria-label="닫기" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">✕</button>
          <a href={`/show/${encodeURIComponent(show.id)}`} className="block">
            {show.posterUrl ? (
              <img src={show.posterUrl} alt={`${show.title} 포스터`} className="aspect-[3/4] w-full object-cover" />
            ) : (
              <div className="flex aspect-[3/4] w-full items-end bg-[linear-gradient(145deg,#c8875e,#7a351d)] p-6">
                <p className="text-2xl font-black leading-snug text-white">{show.title}</p>
              </div>
            )}
          </a>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-bold tracking-[.14em] text-[#b3742f]">{show.genre} · SHOWDAY PICK</p>
          <a href={`/show/${encodeURIComponent(show.id)}`} className="mt-1 block text-lg font-black text-[#241a10] hover:text-[#b3742f]">{show.title}</a>
          <p className="mt-1.5 text-sm text-[#5c4a38]">{show.venue} · {show.period}</p>
          {show.priceLabel && <p className="mt-1 text-sm font-bold text-[#241a10]">{show.priceLabel}</p>}
          <a href={`/show/${encodeURIComponent(show.id)}`} className="mt-4 block rounded-xl bg-[#241a10] py-3 text-center text-sm font-black text-white">
            공연 정보 보기
          </a>
        </div>
        <label className="flex items-center justify-center gap-2 border-t border-[#f0e6d6] py-3 text-xs font-semibold text-[#8a7360]">
          <input type="checkbox" checked={dontShowToday} onChange={(e) => setDontShowToday(e.target.checked)} className="h-3.5 w-3.5" />
          오늘 하루 보지 않기
        </label>
      </div>
    </div>
  );
}
