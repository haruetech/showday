"use client";
import { useEffect, useState } from "react";
import KakaoChannelButton from "@/components/KakaoChannelButton";

export default function AdminChannel() {
  const [channelId, setChannelId] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setChannelId(d.kakao_channel_id || "");
      setSaved(d.kakao_channel_id || "");
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kakao_channel_id: channelId.trim() }) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) { setSaved(channelId.trim()); return; }
    setError(data.error || `저장에 실패했습니다. (상태 코드 ${res.status})`);
  };

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">KAKAO CHANNEL</p>
        <h1 className="mt-2 text-2xl font-black">채널 설정</h1>
        <p className="mt-1 text-sm text-[#d8c3a4]">메인 사이트 하단의 &quot;카카오톡 채널 추가&quot; 버튼이 연결할 채널을 설정합니다.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div className="rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
          <h2 className="text-sm font-black">카카오톡 채널 ID</h2>
          <p className="mt-1 text-xs text-[#8a7360]">
            <a href="https://center-pf.kakao.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#b3742f]">
              카카오톡 채널 관리자센터
            </a>
            {" "}→ 채널 관리 → 상세설정에서 확인할 수 있는 <b>검색용 아이디</b>(&quot;_&quot;로 시작하는 형태)를 입력해주세요.
          </p>

          {loading ? (
            <p className="mt-4 text-xs text-[#8a7360]">불러오는 중입니다...</p>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="예: _xdxaK5"
                className="flex-1 rounded-lg border border-[#e7dcc9] px-3 py-2.5 text-sm"
              />
              <button onClick={save} disabled={saving || channelId.trim() === saved} className="shrink-0 rounded-lg bg-gradient-to-r from-[#e8a353] to-[#b3742f] px-5 text-sm font-black text-[#1c130b] disabled:opacity-40">
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          )}

          {saved && <p className="mt-3 text-xs font-semibold text-[#4f7d63]">현재 저장된 채널 ID: {saved}</p>}
          {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

          <p className="mt-5 text-xs text-[#8a7360]">
            그 외 카카오 JavaScript 키(NEXT_PUBLIC_KAKAO_JS_KEY)는 앱 자체를 식별하는 값이라 Vercel 환경변수에서
            관리합니다. 아직 등록 전이라면 카카오 개발자센터 → SHOWDAY 앱 → 플랫폼 키 → JavaScript 키에서 확인해
            Vercel에 추가하고, 같은 화면의 &quot;JavaScript SDK 도메인&quot;에 실제 배포 도메인도 등록해주세요.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-[#5c4a38]">버튼 미리보기</p>
          <div className="rounded-2xl border border-[#e7dcc9] bg-white p-6 text-center shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
            <KakaoChannelButton />
            <p className="mt-3 text-[11px] text-[#8a7360]">실제로는 하단(Footer)에 노출됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
