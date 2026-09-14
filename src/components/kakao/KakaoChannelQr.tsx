"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function KakaoChannelQr({
  className = "",
  responsive = true, // true면 모바일(작은 화면)에서는 숨김 — 본인 화면의 QR을 본인 폰으로 스캔할 수 없기 때문
}: {
  className?: string;
  responsive?: boolean;
}) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const channelId = d.kakao_channel_id;
        if (!channelId) return;
        const channelUrl = `https://pf.kakao.com/${channelId}`;
        return QRCode.toDataURL(channelUrl, { width: 96, margin: 1, color: { dark: "#241a10", light: "#ffffff" } });
      })
      .then((url) => { if (url) setDataUrl(url); })
      .catch(() => {});
  }, []);

  if (!dataUrl) return null;

  return (
    <div className={`${responsive ? "hidden sm:flex" : "flex"} flex-col items-center gap-1 ${className}`}>
      <img src={dataUrl} alt="카카오톡 채널 QR 코드" className="h-16 w-16 rounded-md border border-line" />
      <p className="text-[10px] text-muted">PC는 QR로 추가</p>
    </div>
  );
}
