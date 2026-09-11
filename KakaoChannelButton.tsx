"use client";
import { useEffect, useState } from "react";

export default function KakaoChannelButton({ className = "" }: { className?: string }) {
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setChannelId(d.kakao_channel_id || "")).catch(() => {});
  }, []);

  // 카카오 JS SDK의 addChannel()은 팝업 창을 여는 방식인데, 모바일 브라우저들이
  // 이런 팝업을 자주 막아버려서 눌러도 아무 반응이 없는 것처럼 보이는 문제가 있었다.
  // QR 스캔으로 접속했을 때 정상 작동했던 것과 똑같이, 채널 페이지로 직접 이동하는
  // 평범한 링크로 바꾸면 팝업 차단 없이 모바일·PC 모두에서 안정적으로 작동한다.
  const href = channelId ? `https://pf.kakao.com/${channelId}` : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (!channelId) {
      e.preventDefault();
      alert("카카오톡 채널 ID가 아직 설정되지 않았습니다. 관리자 화면 > 채널 설정에서 등록해주세요.");
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEE500] px-3.5 py-2 text-xs font-black text-[#191600] transition hover:-translate-y-0.5 hover:shadow-sm ${className}`}
    >
      <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[#191600] text-[9px] font-black text-[#FEE500]">
        K
      </span>
      카카오톡 채널 추가
    </a>
  );
}
