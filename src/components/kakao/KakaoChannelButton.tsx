"use client";
import { useEffect, useState } from "react";

export default function KakaoChannelButton({ className = "" }: { className?: string }) {
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setChannelId(d.kakao_channel_id || "")).catch(() => {});
  }, []);

  const handleClick = () => {
    if (!channelId) {
      alert("카카오톡 채널 ID가 아직 설정되지 않았습니다. 관리자 화면 > 채널 설정에서 등록해주세요.");
      return;
    }
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    window.Kakao.Channel.addChannel({ channelPublicId: channelId });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEE500] px-3.5 py-2 text-xs font-black text-[#191600] transition hover:-translate-y-0.5 hover:shadow-sm ${className}`}
    >
      <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[#191600] text-[9px] font-black text-[#FEE500]">
        K
      </span>
      카카오톡 채널 추가
    </button>
  );
}
