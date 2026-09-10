"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onboardingOptions } from "@/lib/dummy-data";
import { saveProfile } from "@/lib/profile";
import { RecommendationProfile } from "@/types/show";

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
              value === opt
                ? "border-gold bg-gold text-ink"
                : "border-line text-paper hover:border-gold"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingForm />
    </Suspense>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ageBand, setAgeBand] = useState<RecommendationProfile["ageBand"] | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [companion, setCompanion] = useState<RecommendationProfile["companion"] | null>(null);
  type ChildAge = (typeof onboardingOptions.childAges)[number];
  const [childAge, setChildAge] = useState<ChildAge | null>(null);
  const [preferredDay, setPreferredDay] = useState<RecommendationProfile["preferredDay"] | null>(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const [saving, setSaving] = useState(false);

  // 질문을 다 안 채워도 진행할 수 있도록, 안 고른 항목은 무난한 기본값으로 채운다.
  // (연령대·요일·거리 등은 추천 점수에만 쓰이는 보조 정보라 정확하지 않아도 크게 문제되지 않는다.)
  const handleSubmit = async () => {
    setSaving(true);
    await saveProfile({
      ageBand: ageBand ?? "20대",
      district: district ?? "기타 지역",
      companion: companion ?? "혼자",
      childAge: companion === "자녀와 함께" ? childAge ?? "해당 없음" : "해당 없음",
      preferredDay: preferredDay ?? "평일",
      maxDistanceKm: maxDistanceKm ?? 999,
      genres,
    });
    router.push(searchParams.get("next") ?? "/");
  };

  const handleSkip = async () => {
    setSaving(true);
    await saveProfile({
      ageBand: "20대",
      district: "기타 지역",
      companion: "혼자",
      childAge: "해당 없음",
      preferredDay: "평일",
      maxDistanceKm: 999,
      genres: [],
    });
    router.push(searchParams.get("next") ?? "/");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-gold">SHOWDAY 맞춤 시작</p>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="shrink-0 text-xs text-muted underline underline-offset-4 hover:text-paper disabled:opacity-50"
          >
            나중에 할게요, 지금은 건너뛰기
          </button>
        </div>
        <h1 className="font-display font-black text-3xl text-paper">
          카카오로 간편하게 시작하고,
          <br />내가 갈 공연만 받아보세요.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          아래는 답할수록 추천이 더 정확해지는 참고용 질문이에요 — 몇 개만 고르거나 건너뛰어도 괜찮습니다.
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">
          관심 지역과 동행자만 알려주시면 내 주변 공연·행사, 아이 연령에 맞는 가족공연, 관심 장르를 우선 추천합니다.
        </p>
      </div>

      <div className="flex flex-col gap-8">

        <ChipGroup
          label="주로 활동하는 지역"
          options={onboardingOptions.districts}
          value={district}
          onChange={setDistrict}
        />
        <ChipGroup
          label="누구와 함께 보러 가시나요"
          options={onboardingOptions.companions}
          value={companion}
          onChange={setCompanion}
        />
        {companion === "자녀와 함께" && <ChipGroup label="아이 연령" options={onboardingOptions.childAges} value={childAge} onChange={setChildAge} />}
        <ChipGroup
          label="연령대"
          options={onboardingOptions.ageBands}
          value={ageBand}
          onChange={setAgeBand}
        />
        <ChipGroup
          label="선호하는 요일"
          options={onboardingOptions.days}
          value={preferredDay}
          onChange={setPreferredDay}
        />

        <div>
          <p className="mb-3 text-sm text-muted">이동 가능 거리</p>
          <div className="flex flex-wrap gap-2">
            {onboardingOptions.distances.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => setMaxDistanceKm(d.km)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  maxDistanceKm === d.km
                    ? "border-gold bg-gold text-ink"
                    : "border-line text-paper hover:border-gold"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">관심 있는 공연 종류 (복수 선택 가능)</p>
          <div className="flex flex-wrap gap-2">
            {onboardingOptions.genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  genres.includes(g)
                    ? "border-gold bg-gold text-ink"
                    : "border-line text-paper hover:border-gold"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-sm bg-gold py-3.5 text-sm font-bold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        {saving ? "저장하는 중..." : "맞춤 추천 시작하기"}
      </button>
    </main>
  );
}
