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
    return () => window.removeEventListener("resize", onResize);
    // children 변경(데이터 로딩 완료) 시에도 화살표 상태 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section id={id} className="group/row mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="mb-1 text-xs text-muted">{eyebrow}</p>}
          <h2 className="font-display font-bold text-2xl text-paper">{title}</h2>
        </div>
        {action}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            aria-label="이전 항목 보기"
            onClick={() => scrollByPage(-1)}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-line bg-ink/90 p-2 text-paper opacity-0 shadow-lg transition-opacity hover:border-gold group-hover/row:opacity-100 lg:flex"
          >
            ‹
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto pb-2 scroll-smooth [&>*]:snap-start"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            aria-label="다음 항목 보기"
            onClick={() => scrollByPage(1)}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-line bg-ink/90 p-2 text-paper opacity-0 shadow-lg transition-opacity hover:border-gold group-hover/row:opacity-100 lg:flex"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}
