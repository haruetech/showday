"use client";
import { useEffect, useState } from "react";

const DISMISS_KEY = "showday:ad-popup-dismissed-until";

type FeaturedShow = {
  id: string; title: string; genre: string; venue: string; period: string; priceLabel: string; posterUrl: string;
};
type Notice = {
  id: string; title: string; body: string; image_url: string; link_url: string; link_label: string;
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
  const [notice, setNotice] = useState<Notice | null>(null);
  const [show, setShow] = useState<FeaturedShow | null>(null);
  const [visible, setVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (isDismissedToday()) return;
    // 홍보·공지 팝업이 켜져 있으면 그걸 우선 노출하고, 없으면 공연 팝업을 확인한다.
    fetch("/api/notices/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.notice) { setNotice(d.notice); setVisible(true); return; }
        return fetch("/api/manual-shows/featured")
          .then((r) => r.json())
          .then((sd) => { if (sd.show) { setShow(sd.show); setVisible(true); } });
      })
      .catch(() => {});
  }, []);

  const close = () => {
    if (dontShowToday) dismissUntilTomorrow();
    setVisible(false);
  };

  if (!visible || (!notice && !show)) return null;

  if (notice) {
    return (
      <div className="fixed left-4 top-20 z-[70] w-[260px] overflow-hidden rounded-2xl border border-[#e7dcc9] bg-white shadow-xl sm:left-6 sm:top-24">
        <div className="relative">
          <button onClick={close} aria-label="닫기" className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-xs text-white backdrop-blur-sm">✕</button>
          {notice.image_url && <img src={notice.image_url} alt="" className="w-full h-auto object-contain bg-[#f7f0e4]" />}
        </div>
        <div className="p-3.5">
          <p className="text-[9px] font-bold tracking-[.1em] text-[#b3742f]">SHOWDAY 소식</p>
          <p className="mt-0.5 text-sm font-black text-[#241a10]">{notice.title}</p>
          {notice.body && <p className="mt-1 text-[11px] leading-5 text-[#5c4a38]">{notice.body}</p>}
          {notice.link_url && (
            <a href={notice.link_url} target="_blank" rel="noopener noreferrer" className="mt-2.5 block rounded-lg bg-[#241a10] py-2 text-center text-xs font-black text-white">
              {notice.link_label || "자세히 보기"}
            </a>
          )}
        </div>
        <label className="flex items-center justify-center gap-1.5 border-t border-[#f0e6d6] py-2 text-[10px] font-semibold text-[#8a7360]">
          <input type="checkbox" checked={dontShowToday} onChange={(e) => setDontShowToday(e.target.checked)} className="h-3 w-3" />
          오늘 하루 보지 않기
        </label>
      </div>
    );
  }

  return (
    <div className="fixed left-4 top-20 z-[70] w-[260px] overflow-hidden rounded-2xl border border-[#e7dcc9] bg-white shadow-xl sm:left-6 sm:top-24">
      <div className="relative">
        <button onClick={close} aria-label="닫기" className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-xs text-white backdrop-blur-sm">✕</button>
        <a href={`/show/${encodeURIComponent(show!.id)}`} className="block">
          {show!.posterUrl ? (
            <img src={show!.posterUrl} alt={`${show!.title} 포스터`} className="w-full h-auto object-contain bg-[#f7f0e4]" />
          ) : (
            <div className="flex aspect-[16/10] w-full items-end bg-[linear-gradient(145deg,#c8875e,#7a351d)] p-3">
              <p className="text-sm font-black leading-snug text-white">{show!.title}</p>
            </div>
          )}
        </a>
      </div>
      <div className="p-3.5">
        <p className="text-[9px] font-bold tracking-[.1em] text-[#b3742f]">{show!.genre} · SHOWDAY PICK</p>
        <a href={`/show/${encodeURIComponent(show!.id)}`} className="mt-0.5 block truncate text-sm font-black text-[#241a10] hover:text-[#b3742f]">{show!.title}</a>
        <p className="mt-1 truncate text-[11px] text-[#5c4a38]">{show!.venue}</p>
        {show!.priceLabel && <p className="mt-0.5 truncate text-[11px] font-bold text-[#241a10]">{show!.priceLabel}</p>}
        <a href={`/show/${encodeURIComponent(show!.id)}`} className="mt-2.5 block rounded-lg bg-[#241a10] py-2 text-center text-xs font-black text-white">
          공연 정보 보기
        </a>
      </div>
      <label className="flex items-center justify-center gap-1.5 border-t border-[#f0e6d6] py-2 text-[10px] font-semibold text-[#8a7360]">
        <input type="checkbox" checked={dontShowToday} onChange={(e) => setDontShowToday(e.target.checked)} className="h-3 w-3" />
        오늘 하루 보지 않기
      </label>
    </div>
  );
}
