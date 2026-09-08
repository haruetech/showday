"use client";

import { useMemo, useState } from "react";

type AroundKey = "meal" | "cafe" | "late" | "stay";

const items: Array<{ key: AroundKey; time: string; title: string; desc: string; query: string; icon: string }> = [
  { key: "meal", time: "공연 2시간 전", title: "빨리 먹을 수 있는 맛집", desc: "공연장 주변에서 이동과 식사 시간을 줄일 수 있는 곳을 찾습니다.", query: "공연장 근처 빠른 식사 맛집", icon: "🍜" },
  { key: "cafe", time: "공연 1시간 전", title: "가까운 카페", desc: "공연장으로 돌아오기 쉬운 가까운 카페를 우선 확인합니다.", query: "공연장 근처 카페", icon: "☕" },
  { key: "late", time: "공연 종료 후", title: "늦게까지 영업하는 식당", desc: "공연 종료 뒤에도 이용할 수 있는 심야 식당을 찾습니다.", query: "공연장 근처 늦게까지 영업 식당", icon: "🌙" },
  { key: "stay", time: "지방에서 방문", title: "공연장 근처 숙박", desc: "막차와 귀가가 부담스러울 때 공연장 주변 숙박을 확인합니다.", query: "공연장 근처 숙박 호텔", icon: "🏨" },
];

export default function AroundSection() {
  const [active, setActive] = useState<AroundKey>("meal");
  const [venue, setVenue] = useState("서울아레나");
  const selected = useMemo(() => items.find((x) => x.key === active) ?? items[0], [active]);
  const q = encodeURIComponent(`${venue} ${selected.query}`);

  return (
    <section id="around" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-12">
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs text-muted">AROUND</p>
          <h2 className="font-display text-2xl text-paper">공연 시간을 기준으로 주변을 추천합니다</h2>
          <p className="mt-2 text-sm text-muted">시간을 고르면 오른쪽 결과가 즉시 바뀝니다. 실제 장소는 지도 검색으로 이어집니다.</p>
        </div>
        <label className="w-full lg:w-64">
          <span className="mb-1 block text-[11px] text-muted">기준 공연장</span>
          <input value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-gold" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {items.map((item) => (
            <button key={item.key} onClick={() => setActive(item.key)} className={`rounded-sm border p-4 text-left transition ${active === item.key ? "border-gold bg-gold/10" : "border-line bg-surface hover:border-gold/60"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="ml-2 text-xs text-gold">{item.time}</span>
              <strong className="mt-2 block text-sm text-paper">{item.title}</strong>
            </button>
          ))}
        </div>

        <div className="flex min-h-[300px] flex-col justify-between rounded-sm border border-line bg-surface-raised p-6 lg:p-8">
          <div>
            <p className="text-xs text-gold">{selected.time} · NOW RECOMMEND</p>
            <div className="mt-4 flex items-start gap-4">
              <span className="text-4xl">{selected.icon}</span>
              <div>
                <h3 className="font-display text-2xl text-paper">{selected.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{selected.desc}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="border border-line bg-ink/30 p-3"><span className="text-[11px] text-muted">기준</span><strong className="mt-1 block text-sm text-paper">{venue}</strong></div>
              <div className="border border-line bg-ink/30 p-3"><span className="text-[11px] text-muted">추천 원칙</span><strong className="mt-1 block text-sm text-paper">공연시간 우선</strong></div>
              <div className="border border-line bg-ink/30 p-3"><span className="text-[11px] text-muted">다음 단계</span><strong className="mt-1 block text-sm text-paper">지도에서 실제 확인</strong></div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={`https://map.kakao.com/?q=${q}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-ink">카카오맵에서 보기 →</a>
            <a href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-2 text-xs text-paper hover:border-gold">네이버지도에서 보기 →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
