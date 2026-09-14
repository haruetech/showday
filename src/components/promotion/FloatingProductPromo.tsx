"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  product_url: string;
  price_label: string;
  sale_label: string;
  category: string;
  cta_label: string;
  is_featured?: boolean;
};

const LEGACY_PRODUCT: Product = {
  id: "legacy-harue-renya",
  title: "하루에 렌야 키높이 여성 스니커즈 6.5cm",
  description: "공연 가는 날에도 편안하고 가볍게.",
  image_url: "https://ca.lotteimall.com/S/storage001.daousync.com/v1/AUTH_78da087baa364fca88c704bf2ddb3904/image/1747033052723.jpg?imw=780&ol=4&sh=1280&v=250922163954",
  product_url: "https://posty.kr/products/161707873?from=search_result",
  price_label: "",
  sale_label: "",
  category: "SHOWDAY PICK",
  cta_label: "상품 보기",
  is_featured: true,
};

const STORAGE_KEY = "showday-floating-promo-hidden-until-v4";
const HIDE_DAYS = 1;

export default function FloatingProductPromo() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (pathname !== "/") return;

    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("products api unavailable");
        return response.json();
      })
      .then((data) => {
        const rows = Array.isArray(data?.products) ? data.products : [];
        // 새 DB에 상품이 아직 없더라도 기존 SHOWDAY PICK 상품은 사라지지 않습니다.
        setProducts(rows.length > 0 ? rows : [LEGACY_PRODUCT]);
      })
      .catch(() => setProducts([LEGACY_PRODUCT]));
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" || products.length === 0) return;

    const until = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    if (until > Date.now()) return;

    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > 360);
      if (y > 420) setVisible(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, products.length]);

  const product = useMemo(
    () => products[index % Math.max(products.length, 1)],
    [products, index],
  );

  if (!visible || pathname !== "/" || !product) return null;

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

      <a
        href={product.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className="showday-product-link"
      >
        <div className="showday-product-thumb" aria-hidden="true">
          {product.image_url ? (
            <img src={product.image_url} alt="" loading="lazy" />
          ) : (
            <span className="showday-product-mark">S</span>
          )}
        </div>

        <div className="showday-product-copy">
          <span className="showday-product-eyebrow">
            {product.category || "SHOWDAY PICK"}
          </span>
          <strong>{product.title}</strong>
          <p>
            {product.description ||
              [product.price_label, product.sale_label].filter(Boolean).join(" · ")}
          </p>
        </div>

        <span className="showday-product-cta">
          {product.cta_label || "상품 보기"}
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10h11M11 6l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>

      {products.length > 1 && (
        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % products.length)}
          aria-label="다음 추천 상품"
          className="absolute bottom-2 right-3 z-20 rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-[#5c4a38] shadow-sm"
        >
          {index % products.length + 1}/{products.length} ›
        </button>
      )}
    </aside>
  );
}
