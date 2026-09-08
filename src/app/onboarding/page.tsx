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
  const [preferredDay, setPreferredDay] = useState<RecommendationProfile["preferredDay"] | null>(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const isComplete = ageBand && district && companion && preferredDay && maxDistanceKm !== null;

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!isComplete) return;
    setSaving(true);
    await saveProfile({
      ageBand: ageBand!,
      district: district!,
      companion: companion!,
      preferredDay: preferredDay!,
      maxDistanceKm: maxDistanceKm!,
      genres,
    });
    router.push(searchParams.get("next") ?? "/");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <div>
        <p className="mb-2 text-xs text-gold">추천 설정</p>
        <h1 className="font-display font-black text-3xl text-paper">
          나에게 맞는 공연,
          <br />
          어떻게 찾아드릴까요?
        </h1>
        <p className="mt-3 text-sm text-muted">
          몇 가지만 골라주시면, 조건에 맞는 이유와 함께 공연을 추천해 드려요.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <ChipGroup
          label="연령대"
          options={onboardingOptions.ageBands}
          value={ageBand}
          onChange={setAgeBand}
        />
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
        disabled={!isComplete || saving}
        className="rounded-sm bg-gold py-3.5 text-sm font-bold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        {saving ? "저장하는 중..." : "이 조건으로 추천받기"}
      </button>
    </main>
  );
}
