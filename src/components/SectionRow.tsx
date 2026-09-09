"use client";

import { ReactNode, useRef, useState, useEffect } from "react";

export default function SectionRow({
  eyebrow,
  title,
  action,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [children]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(320, el.clientWidth * 0.82), behavior: "smooth" });
  }

  return (
    <section id={id} className="group/row mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-xs text-muted">{eyebrow}</p>}
          <h2 className="font-display text-2xl font-bold text-paper">{title}</h2>
        </div>
        <div className="shrink-0">{action}</div>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            aria-label="이전 공연 보기"
            onClick={() => scrollByPage(-1)}
            className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-line bg-ink/95 px-3 py-2 text-sm font-bold text-paper shadow-xl transition hover:border-gold hover:text-gold lg:flex"
          >
            ‹
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth [&>*]:snap-start"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            aria-label="다음 공연 더보기"
            onClick={() => scrollByPage(1)}
            className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-gold/60 bg-ink/95 px-4 py-2.5 text-xs font-black text-paper shadow-xl transition hover:bg-gold hover:text-ink lg:flex"
          >
            공연 더보기 <span className="text-base leading-none">›</span>
          </button>
        )}

        {canScrollRight && (
          <button
            aria-label="다음 공연 보기"
            onClick={() => scrollByPage(1)}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-line py-3 text-xs font-bold text-paper lg:hidden"
          >
            공연 더보기 <span>›</span>
          </button>
        )}
      </div>
    </section>
  );
}
