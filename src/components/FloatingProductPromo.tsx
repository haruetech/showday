"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PROMO = {
  eyebrow: "SHOWDAY PICK",
  title: "공연 가는 날, 가볍게 챙기는 한 가지",
  description: "SHOWDAY가 준비하는 공연 데이 상품을 만나보세요.",
  cta: "상품 보기",
  href: "https://haruepick.com",
};

const STORAGE_KEY = "showday-floating-promo-hidden-until";
const HIDE_DAYS = 7;

export default function FloatingProductPromo() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const until = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    if (until > Date.now()) return;

    const timer = window.setTimeout(() => setVisible(true), 1400);
    const onScroll = () => setCompact(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (!visible || pathname !== "/") return null;

  const close = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      String(Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000),
    );
    setVisible(false);
  };

  return (
    <aside
      className={`showday-product-float ${compact ? "is-compact" : ""}`}
      aria-label="SHOWDAY 추천 상품"
    >
      <button
        type="button"
        className="showday-product-close"
        aria-label="추천 상품 닫기"
        onClick={close}
      >
        <span aria-hidden="true">×</span>
      </button>

      <Link
        href={PROMO.href}
        target="_blank"
        rel="noopener noreferrer"
        className="showday-product-link"
      >
        <div className="showday-product-thumb" aria-hidden="true">
          <span className="showday-product-mark">S</span>
        </div>

        <div className="showday-product-copy">
          <span className="showday-product-eyebrow">{PROMO.eyebrow}</span>
          <strong>{PROMO.title}</strong>
          <p>{PROMO.description}</p>
        </div>

        <span className="showday-product-cta">
          {PROMO.cta}
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </aside>
  );
}
