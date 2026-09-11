"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function KakaoChannelQr({ className = "" }: { className?: string }) {
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
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img src={dataUrl} alt="카카오톡 채널 QR 코드" className="h-16 w-16 rounded-md border border-line" />
      <p className="text-[10px] text-muted">PC는 QR로 추가</p>
    </div>
  );
}
