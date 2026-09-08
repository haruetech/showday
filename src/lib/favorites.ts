"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * 관심 아티스트(팔로우) 저장소.
 * Supabase가 연결되어 있고 로그인된 사용자라면 artist_follows 테이블(실제화)을 쓰고,
 * 그렇지 않으면(비로그인 데모, Supabase 미설정) localStorage로 동작합니다.
 * → supabase/migrations/0001_init.sql의 artist_follows 테이블과 대응됩니다.
 */
const LOCAL_KEY = "showday_artist_follows";

function getLocalFollows(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveLocalFollows(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(ids)));
}

/** 로그인 상태면 Supabase에서, 아니면 localStorage에서 팔로우 중인 아티스트 id 집합을 가져온다. */
export async function getFollowedArtistIds(): Promise<Set<string>> {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("artist_follows")
        .select("artist_id")
        .eq("user_id", user.id);

      if (!error && data) return new Set(data.map((r) => r.artist_id as string));
      return new Set();
    }
  }

  return getLocalFollows();
}

/** 팔로우 온/오프 토글. 토글 후 상태(true=팔로우 중)를 반환한다. */
export async function toggleArtistFollow(artistId: string): Promise<boolean> {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("artist_follows")
        .select("artist_id")
        .eq("user_id", user.id)
        .eq("artist_id", artistId)
        .maybeSingle();

      if (data) {
        await supabase
          .from("artist_follows")
          .delete()
          .eq("user_id", user.id)
          .eq("artist_id", artistId);
        return false;
      }

      const { error } = await supabase
        .from("artist_follows")
        .insert({ user_id: user.id, artist_id: artistId });
      if (error) console.error("관심 아티스트 저장 실패:", error);
      return !error;
    }
  }

  // 비로그인/Supabase 미설정: localStorage 폴백 (데모용 — 로그인 후에는 실제로 저장됨)
  const ids = getLocalFollows();
  const next = ids.has(artistId);
  if (next) ids.delete(artistId);
  else ids.add(artistId);
  saveLocalFollows(ids);
  return !next;
}
