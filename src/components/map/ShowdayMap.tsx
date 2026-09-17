"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "@/components/kakao/KakaoMapLoader";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  isFree?: boolean;
};

export type MapBounds = { swLat: number; swLng: number; neLat: number; neLng: number };

type Props = {
  points: MapPoint[];
  center?: { lat: number; lng: number } | null;
  onSelect?: (id: string) => void;
  onBoundsSearch?: (bounds: MapBounds) => void;
  className?: string;
};

// 서울시청 — 좌표를 아직 못 구했을 때(위치 미사용) 기본 중심
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function ShowdayMap({ points, center, onSelect, onBoundsSearch, className }: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRedo, setShowRedo] = useState(false);
  const [locating, setLocating] = useState(false);

  // 지도는 최초 1회만 생성한다 (points/center가 바뀔 때마다 다시 만들지 않음)
  useEffect(() => {
    let cancelled = false;

    loadKakaoMaps()
      .then((kakao) => {
        if (cancelled || !mapDivRef.current) return;
        const start = center || DEFAULT_CENTER;
        const map = new kakao.maps.Map(mapDivRef.current, {
          center: new kakao.maps.LatLng(start.lat, start.lng),
          level: center ? 5 : 8,
        });
        mapRef.current = map;
        clustererRef.current = new kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 6 });
        kakao.maps.event.addListener(map, "dragend", () => setShowRedo(true));
        kakao.maps.event.addListener(map, "zoom_changed", () => setShowRedo(true));
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMessage(err.message || "지도를 불러오지 못했습니다.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 위치 검색 등으로 center가 바뀌면 지도만 이동 (재생성하지 않음)
  useEffect(() => {
    if (status !== "ready" || !center || !mapRef.current) return;
    const kakao = window.kakao;
    mapRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    mapRef.current.setLevel(5);
    setShowRedo(false);
  }, [center, status]);

  // 목록이 바뀌면 마커만 다시 그린다
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !clustererRef.current) return;
    const kakao = window.kakao;
    const clusterer = clustererRef.current;

    markersRef.current.forEach((m) => kakao.maps.event.removeListener(m, "click"));
    clusterer.clear();

    const nextMarkers = points
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => {
        const marker = new kakao.maps.Marker({ position: new kakao.maps.LatLng(p.lat, p.lng) });
        kakao.maps.event.addListener(marker, "click", () => onSelect?.(p.id));
        return marker;
      });

    markersRef.current = nextMarkers;
    clusterer.addMarkers(nextMarkers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, status]);

  function researchThisArea() {
    const map = mapRef.current;
    if (!map) return;
    if (onBoundsSearch) {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBoundsSearch({ swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng() });
    }
    setShowRedo(false);
  }

  function goToMyLocation() {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const kakao = window.kakao;
        mapRef.current.setCenter(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        mapRef.current.setLevel(5);
        setShowRedo(true);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  return (
    <div className={`showday-map-wrap${className ? ` ${className}` : ""}`}>
      <div ref={mapDivRef} className="showday-map-canvas" aria-label="SHOWDAY 지도" />

      {status === "loading" && <div className="showday-map-overlay">지도를 불러오는 중입니다…</div>}
      {status === "error" && (
        <div className="showday-map-overlay showday-map-overlay--error">
          지도를 불러오지 못했습니다.
          <span>{errorMessage}</span>
        </div>
      )}

      {status === "ready" && showRedo && (
        <button type="button" className="showday-map-redo" onClick={researchThisArea}>
          이 지역 재검색
        </button>
      )}

      {status === "ready" && (
        <button type="button" className="showday-map-locate" onClick={goToMyLocation} disabled={locating}>
          {locating ? "위치 확인 중…" : "현재 위치"}
        </button>
      )}

      {status === "ready" && (
        <div className="showday-map-count">지도 범위 안 {points.filter((p) => Number.isFinite(p.lat)).length}건</div>
      )}
    </div>
  );
}
