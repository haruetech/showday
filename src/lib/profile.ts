"use client";

import { RecommendationProfile } from "@/types/show";
import { createClient } from "@/lib/supabase/client";

/**
 * 추천 프로필 저장소.
 * Supabase가 연결되어 있고 로그인된 사용자라면 profiles 테이블(실제화)을 쓰고,
 * 그렇지 않으면(비로그인 데모, Supabase 미설정) localStorage로 동작합니다.
 * → supabase/migrations/0001_init.sql의 profiles 테이블과 필드가 대응됩니다.
 */
const LOCAL_KEY = "showday_recommendation_profile";

interface ProfileRow {
  age_band: RecommendationProfile["ageBand"];
  district: string;
  companion: RecommendationProfile["companion"];
  preferred_day: RecommendationProfile["preferredDay"];
  max_distance_km: number;
  genres: string[];
}

function rowToProfile(row: ProfileRow): RecommendationProfile {
  return {
    ageBand: row.age_band,
    district: row.district,
    companion: row.companion,
    preferredDay: row.preferred_day,
    maxDistanceKm: row.max_distance_km,
    genres: row.genres ?? [],
  };
}

function profileToRow(profile: RecommendationProfile) {
  return {
    age_band: profile.ageBand,
    district: profile.district,
    companion: profile.companion,
    preferred_day: profile.preferredDay,
    max_distance_km: profile.maxDistanceKm,
    genres: profile.genres,
    updated_at: new Date().toISOString(),
  };
}

function getLocalProfile(): RecommendationProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RecommendationProfile;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: RecommendationProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<RecommendationProfile | null> {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("age_band, district, companion, preferred_day, max_distance_km, genres")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) return rowToProfile(data as ProfileRow);
      return null; // 로그인은 했지만 아직 추천 설정을 안 한 상태 → 온보딩 필요
    }
  }

  // Supabase 미설정 또는 비로그인 데모: localStorage 폴백
  return getLocalProfile();
}

export async function saveProfile(profile: RecommendationProfile): Promise<void> {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...profileToRow(profile) });

      if (error) {
        console.error("추천 프로필 저장 실패, localStorage로 대체 저장:", error);
        saveLocalProfile(profile);
      }
      return;
    }
  }

  saveLocalProfile(profile);
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_KEY);
}
