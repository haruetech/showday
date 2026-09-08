"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { allShows } from "@/lib/dummy-data";
import type { Show } from "@/types/show";

type Companion = "혼자" | "데이트" | "부모님" | "가족" | "친구";
type Timing = "오늘" | "이번 주" | "이번 주말" | "날짜 상관없음";
type Budget = "1만원 이하" | "3만원 이하" | "5만원 이하" | "10만원 이하" | "가격 상관없음";
type AgeBand = "연령 상관없음" | "20대" | "30대" | "40대" | "50대" | "60대+";

const companions: Companion[] = ["혼자", "데이트", "부모님", "가족", "친구"];
const timings: Timing[] = ["오늘", "이번 주", "이번 주말", "날짜 상관없음"];
const budgets: Budget[] = ["1만원 이하", "3만원 이하", "5만원 이하", "10만원 이하", "가격 상관없음"];
const ages: AgeBand[] = ["연령 상관없음", "20대", "30대", "40대", "50대", "60대+"];
const genres = ["전체", "콘서트", "뮤지컬", "연극", "클래식", "국악", "무용", "강연"];

const budgetMax: Record<Budget, number> = {
  "1만원 이하": 10000,
  "3만원 이하": 30000,
  "5만원 이하": 50000,
  "10만원 이하": 100000,
  "가격 상관없음": Infinity,
};

// 검색어를 입력하는 즉시가 아니라, 타이핑이 멈춘 뒤 반영 — 매 키입력마다
// API를 부르지 않으면서도 "검색하기" 버튼을 누르지 않아도 결과가 갱신됨
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const [companion, setCompanion] = useState<Companion>("혼자");
  const [timing, setTiming] = useState<Timing>("이번 주");
  const [budget, setBudget] = useState<Budget>("5만원 이하");
  const [ageBand, setAgeBand] = useState<AgeBand>("연령 상관없음");
  const [genre, setGenre] = useState("전체");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const hasSearchedOnce = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 350);

  const fallback = useMemo(() => {
    const max = budgetMax[budget];
    return allShows
      .filter((s) => max === Infinity || (s.priceValue > 0 && s.priceValue <= max))
      .filter((s) => genre === "전체" || s.genre.includes(genre))
      .filter(
        (s) =>
          !debouncedQuery.trim() ||
          `${s.title} ${s.artist ?? ""} ${s.venue}`
            .toLowerCase()
            .includes(debouncedQuery.trim().toLowerCase())
      )
      .slice(0, 9);
  }, [budget, genre, debouncedQuery]);

  async function searchShows() {
    setLoading(true);
    setSearched(true);
    hasSearchedOnce.current = true;
    try {
      const range =
        timing === "오늘" ? "today" : timing === "이번 주" ? "week" : timing === "이번 주말" ? "weekend" : "30d";
      const params = new URLSearchParams({ type: "search", range, rows: "24" });
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      const res = await fetch(`/api/kopis?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      const list: Show[] = Array.isArray(data?.shows) ? data.shows : [];
      const max = budgetMax[budget];
      const filtered = list
        .filter((s) => max === Infinity || (s.priceValue > 0 && s.priceValue <= max))
        .filter((s) => genre === "전체" || s.genre?.includes(genre));
      setResults(filtered.slice(0, 9));
    } catch {
      setResults(fallback);
    } finally {
      setLoading(false);
    }
  }

  // 검색어·조건이 바뀌면 한 번이라도 검색한 이후부터는 버튼 없이도 자동으로 재조회
  useEffect(() => {
    if (!hasSearchedOnce.current) return;
    searchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, timing, genre, budget]);

  useEffect(() => {
    const onArtistSearch = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      const nextQuery = detail?.query?.trim();
      if (!nextQuery) return;
      setQuery(nextQuery);
      hasSearchedOnce.current = true;
      setTimeout(() => searchShows(), 0);
    };
    window.addEventListener("showday:search", onArtistSearch);
    return () => window.removeEventListener("showday:search", onArtistSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = searched ? (results.length ? results : fallback) : [];
  const advancedCount = [companion !== "혼자", budget !== "5만원 이하", ageBand !== "연령 상관없음"].filter(
    Boolean
  ).length;

  return (
    <section id="show-search" className="relative scroll-mt-24 overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brick/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:py-16">
        <div className="order-2 pt-2 lg:order-1">
          <h1 className="font-display text-4xl leading-[1.18] text-paper sm:text-5xl lg:text-6xl">
            오늘 보고 싶은 공연,
            <br />
            <span className="text-gold">조건으로 빠르게 찾으세요.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
            날짜·장르·예산까지, 지금 조건에 맞는 공연만 먼저 정리해드립니다.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-full border border-[#FEE500]/30 bg-[#FEE500]/5 py-2 pl-4 pr-2">
            <p className="text-xs text-paper">카카오 10초 로그인으로 맞춤추천·알림까지</p>
            {isAuthConfigured && (
              <button
                onClick={signInWithKakao}
                className="ml-auto shrink-0 rounded-full bg-[#FEE500] px-4 py-1.5 text-xs font-bold text-[#191600]"
              >
                카카오로 시작 →
              </button>
            )}
          </div>
        </div>

        <div className="order-1 rounded-md border border-line bg-surface/90 p-5 shadow-2xl shadow-black/20 sm:p-6 lg:order-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="mb-2 block text-xs text-muted">공연명 · 아티스트 · 공연장</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">⌕</span>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    hasSearchedOnce.current = true;
                    setSearched(true);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && searchShows()}
                  placeholder="예: 임영웅, 뮤지컬, 세종문화회관"
                  className="w-full rounded-sm border border-line bg-ink/60 py-3 pl-9 pr-4 text-sm text-paper outline-none placeholder:text-muted focus:border-gold"
                />
              </div>
            </label>
            <button id="show-search-submit" onClick={searchShows} className="rounded-sm bg-gold px-5 py-3 text-sm font-bold text-ink">
              검색하기
            </button>
          </div>

          <ChoiceRow label="언제 볼까요?" options={timings} value={timing} onChange={setTiming} />
          <ChoiceRow label="장르는요?" options={genres} value={genre} onChange={setGenre} />

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-paper"
          >
            <span className={`inline-block transition-transform ${showAdvanced ? "rotate-90" : ""}`}>›</span>
            상세 필터 (동행 · 예산 · 연령대){advancedCount > 0 ? ` · ${advancedCount}개 적용됨` : ""}
          </button>

          {showAdvanced && (
            <div className="mt-1 rounded-sm border border-line/70 bg-ink/25 p-3">
              <ChoiceRow label="누구와 가세요?" options={companions} value={companion} onChange={setCompanion} />
              <ChoiceRow label="예산은요?" options={budgets} value={budget} onChange={setBudget} />
              <ChoiceRow label="연령대 추천" options={ages} value={ageBand} onChange={setAgeBand} />
            </div>
          )}

          <div className="mt-4 rounded-sm border border-line bg-ink/35 px-3 py-2.5 text-[11px] leading-5 text-muted">
            <strong className="text-paper">가까운 공연</strong>은 정확한 거리 계산을 위해 위치 허용과 공연장 좌표가 필요합니다. 위치를 받지 않은 상태에서는 임의로 “가깝다”고 표시하지 않습니다.
          </div>

          {searched && (
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-paper">
                    검색 결과{!loading && shown.length > 0 ? ` ${shown.length}건` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {timing} · {genre}
                    {advancedCount > 0 ? ` · ${companion} · ${budget}${ageBand !== "연령 상관없음" ? ` · ${ageBand}` : ""}` : ""}
                  </p>
                </div>
                <button onClick={() => setSearched(false)} className="text-[11px] text-muted hover:text-paper">
                  접기
                </button>
              </div>

              {loading ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-sm border border-line bg-ink/35" />
                  ))}
                </div>
              ) : shown.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  조건에 맞는 공연이 없습니다. 필터를 조금 넓혀보세요.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3">
                  {shown.map((show) => (
                    <a
                      key={show.id}
                      href="#today-shows"
                      className="group flex flex-col overflow-hidden rounded-sm border border-line bg-ink/35 transition hover:border-gold"
                    >
                      <div
                        className="relative h-20 w-full"
                        style={{ background: `linear-gradient(135deg, ${show.posterFrom}, ${show.posterTo})` }}
                      >
                        {show.posterUrl && (
                          <img
                            src={show.posterUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-ink/60 px-1.5 py-0.5 text-[10px] text-paper backdrop-blur-sm">
                          {show.genre}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                        <strong className="block truncate text-sm text-paper">{show.title}</strong>
                        <span className="block truncate text-[11px] text-muted">{show.venue}</span>
                        <span className="mt-0.5 block text-[11px] text-gold">{show.priceLabel || "가격 확인"}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
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
