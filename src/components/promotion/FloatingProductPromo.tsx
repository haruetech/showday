"use client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product={id:string;title:string;description:string;image_url:string;product_url:string;price_label:string;sale_label:string;category:string;cta_label:string;is_featured?:boolean};
const STORAGE_KEY="showday-floating-promo-hidden-until-v3"; const HIDE_DAYS=1;
export default function FloatingProductPromo(){
 const pathname=usePathname(); const [visible,setVisible]=useState(false); const [compact,setCompact]=useState(false); const [products,setProducts]=useState<Product[]>([]); const [index,setIndex]=useState(0);
 useEffect(()=>{if(pathname!=="/")return; fetch('/api/products',{cache:'no-store'}).then(r=>r.json()).then(d=>setProducts(d.products||[])).catch(()=>setProducts([]));},[pathname]);
 useEffect(()=>{if(pathname!=="/"||products.length===0)return; const until=Number(localStorage.getItem(STORAGE_KEY)||0); if(until>Date.now())return; const onScroll=()=>{const y=scrollY;setCompact(y>360);if(y>420)setVisible(true)};addEventListener('scroll',onScroll,{passive:true});onScroll();return()=>removeEventListener('scroll',onScroll)},[pathname,products.length]);
 const p=useMemo(()=>products[index%Math.max(products.length,1)],[products,index]); if(!visible||pathname!=="/"||!p)return null;
 const close=()=>{localStorage.setItem(STORAGE_KEY,String(Date.now()+HIDE_DAYS*86400000));setVisible(false)};
 return <aside className={`showday-product-float ${compact?'is-compact':''}`} aria-label="SHOWDAY 추천 상품">
  <button type="button" className="showday-product-close" aria-label="추천 상품 닫기" onClick={close}><span aria-hidden>×</span></button>
  <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="showday-product-link">
   <div className="showday-product-thumb" aria-hidden>{p.image_url?<img src={p.image_url} alt="" loading="lazy"/>:<span className="showday-product-mark">S</span>}</div>
   <div className="showday-product-copy"><span className="showday-product-eyebrow">{p.category||'SHOWDAY PICK'}</span><strong>{p.title}</strong><p>{p.description||[p.price_label,p.sale_label].filter(Boolean).join(' · ')}</p></div>
   <span className="showday-product-cta">{p.cta_label||'상품 보기'}<svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
  </a>
  {products.length>1&&<button type="button" onClick={()=>setIndex(i=>(i+1)%products.length)} aria-label="다음 추천 상품" className="absolute bottom-2 right-3 z-20 rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-[#5c4a38] shadow-sm">{index%products.length+1}/{products.length} ›</button>}
 </aside>
}
