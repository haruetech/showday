"use client";

import { useState } from "react";
import { aiSearchExamples } from "@/lib/dummy-data";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20">
        <div>
          <h1 className="font-display text-4xl leading-[1.25] text-paper sm:text-5xl">
            오늘, 어떤 공연을
            <br />
            만나고 싶으세요?
          </h1>
          <p className="mt-3 text-sm text-muted">
            좋아하는 아티스트나 지역을 알려주시면, 딱 맞는 공연과 이유를 함께 보여드려요.
          </p>
        </div>

        {/* AI QUICK PICK: 일반 사용자 항목과 50+ 항목을 균형 있게 배치 (선택형 칩 우선) */}
        <div className="max-w-2xl">
          <p className="mb-3 text-xs text-muted">AI QUICK PICK</p>
          <div className="flex flex-wrap gap-2">
            {aiSearchExamples.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  query === ex
                    ? "border-gold bg-gold text-ink"
                    : "border-line text-paper hover:border-gold"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {!showTyping ? (
            <button
              onClick={() => setShowTyping(true)}
              className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-paper"
            >
              직접 입력할게요
            </button>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-sm border border-line bg-surface px-4 py-3.5 focus-within:border-gold">
              <span className="font-display text-gold">AI</span>
              <div className="perforated h-8 w-px bg-line" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 부모님과 볼 뮤지컬, 10만원 이하로"
                className="w-full bg-transparent text-sm text-paper placeholder:text-muted focus:outline-none"
              />
            </div>
          )}

          <button className="mt-4 w-full rounded-sm bg-gold py-3 text-sm font-bold text-ink transition-opacity hover:opacity-90 sm:w-auto sm:px-8">
            공연 찾기
          </button>
        </div>
      </div>
    </section>
  );
}
