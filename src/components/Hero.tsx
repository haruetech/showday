"use client";

import { useMemo, useState } from "react";
import { allShows } from "@/lib/dummy-data";

type Companion = "혼자" | "데이트" | "부모님" | "가족";
type Timing = "이번 주말" | "평일 저녁" | "가까운 공연";
type Budget = "5만원 이하" | "10만원 이하" | "가격 상관없음";

const companions: Companion[] = ["혼자", "데이트", "부모님", "가족"];
const timings: Timing[] = ["이번 주말", "평일 저녁", "가까운 공연"];
const budgets: Budget[] = ["5만원 이하", "10만원 이하", "가격 상관없음"];

export default function Hero() {
  const [companion, setCompanion] = useState<Companion>("데이트");
  const [timing, setTiming] = useState<Timing>("이번 주말");
  const [budget, setBudget] = useState<Budget>("10만원 이하");
  const [showResults, setShowResults] = useState(false);

  const picks = useMemo(() => {
    const maxPrice = budget === "5만원 이하" ? 50000 : budget === "10만원 이하" ? 100000 : Infinity;
    const scored = allShows.map((show) => {
      let score = 0;
      const reasons: string[] = [];
      if (show.priceValue <= maxPrice) { score += 3; reasons.push(budget); }
      if (timing === "이번 주말" && (show.tags.includes("주말") || show.dayOfWeek === "토" || show.dayOfWeek === "일")) { score += 3; reasons.push("주말 일정"); }
      if (timing === "평일 저녁" && show.tags.includes("평일")) { score += 3; reasons.push("평일"); }
      if (timing === "가까운 공연" && (show.distanceFromDobongKm ?? 999) <= 15) { score += 4; reasons.push("가까운 거리"); }
      if (companion === "부모님" && (show.tags.includes("부모님") || show.tags.includes("50+"))) { score += 4; reasons.push("부모님과 함께"); }
      if (companion === "데이트" && show.tags.includes("데이트")) { score += 4; reasons.push("데이트"); }
      if (companion === "가족" && show.tags.includes("가족")) { score += 4; reasons.push("가족"); }
      if (companion === "혼자") { score += 1; reasons.push("혼자 보기 편한 공연"); }
      return { show, score, reason: reasons.slice(0, 2).join(" · ") || "지금 조건과 잘 맞는 공연" };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [budget, companion, timing]);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brick/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-18">
        <div className="pt-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            로그인 없이 바로 쓰는 공연비서
          </div>
          <h1 className="font-display text-4xl leading-[1.18] text-paper sm:text-5xl lg:text-6xl">
            공연을 찾는 대신,
            <br />
            <span className="text-gold">오늘의 3개</span>만 고릅니다.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted sm:text-base">
            누구와 가는지, 언제 시간이 되는지, 예산만 고르세요.
            SHOWDAY가 지금 볼 만한 공연 3개와 추천 이유를 먼저 보여드립니다.
          </p>

          <div className="mt-7 grid max-w-lg grid-cols-3 gap-2 text-center text-xs">
            {[
              ["01", "10초 선택"],
              ["02", "3개 추천"],
              ["03", "필요할 때만 로그인"],
            ].map(([no, label]) => (
              <div key={no} className="rounded-sm border border-line bg-surface/70 px-3 py-3">
                <span className="block text-gold">{no}</span>
                <span className="mt-1 block text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface/90 p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-gold">SHOWDAY NOW</p>
              <h2 className="mt-1 font-display text-2xl text-paper">10초 공연 선택</h2>
            </div>
            <span className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted">NO LOGIN</span>
          </div>

          <ChoiceRow label="누구와 가세요?" options={companions} value={companion} onChange={setCompanion} />
          <ChoiceRow label="언제가 좋아요?" options={timings} value={timing} onChange={setTiming} />
          <ChoiceRow label="예산은요?" options={budgets} value={budget} onChange={setBudget} />

          <button
            onClick={() => setShowResults(true)}
            className="mt-5 w-full rounded-sm bg-gold py-3.5 text-sm font-bold text-ink transition hover:brightness-105"
          >
            지금 볼 공연 3개만 골라줘 →
          </button>

          {showResults && (
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-muted">지금 조건에 맞는 공연</p>
                <button onClick={() => setShowResults(false)} className="text-[11px] text-muted hover:text-paper">접기</button>
              </div>
              <div className="space-y-2">
                {picks.map(({ show, reason }, index) => (
                  <a
                    key={show.id}
                    href="#today-shows"
                    className="group flex items-center gap-3 rounded-sm border border-line bg-ink/35 p-3 transition hover:border-gold"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-xs font-bold text-gold">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-paper">{show.title}</strong>
                      <span className="mt-0.5 block truncate text-xs text-muted">{show.dateLabel} · {show.venue}</span>
                      <span className="mt-1 block text-[11px] text-gold">{reason}</span>
                    </span>
                    <span className="text-muted transition group-hover:translate-x-0.5 group-hover:text-gold">→</span>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-muted">
                관심공연 저장·알림·다른 기기 동기화가 필요할 때만 카카오 로그인을 사용합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceRow<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-full border px-3.5 py-2 text-xs transition-colors sm:text-sm ${
              value === option ? "border-gold bg-gold text-ink" : "border-line text-paper hover:border-gold"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
