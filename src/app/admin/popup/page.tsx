"use client";
import { useEffect, useState } from "react";

type ManualShow = {
  id: string; title: string; genre: string; venue: string; period: string; price_label: string;
  poster_url: string; status: string; is_featured?: boolean;
};

export default function AdminPopup() {
  const [shows, setShows] = useState<ManualShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configError, setConfigError] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/shows").then((r) => r.json()).then((d) => {
      if (d.error) { setConfigError(true); return; }
      setShows((d.shows || []).filter((s: ManualShow) => s.status === "게시중"));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const featured = shows.find((s) => s.is_featured);
  const preview = featured || shows[0]; // 지정된 게 없으면 자동 노출될 (가장 최근) 공연을 미리보기로 보여준다

  const select = async (id: string | null) => {
    setSaving(true);
    await fetch("/api/admin/popup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSaving(false);
    load();
  };

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">SHOW POPUP</p>
        <h1 className="mt-2 text-2xl font-black">공연 팝업</h1>
        <p className="mt-1 text-sm text-[#d8c3a4]">SHOWDAY 메인 화면에 하루 1회 뜨는 공연 광고 팝업을 관리합니다. &quot;홍보·공지 팝업&quot;이 켜져 있으면 그게 먼저 노출됩니다.</p>
      </div>

      {configError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
          SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다. Vercel 환경변수에 추가 후 재배포해주세요.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">게시중인 공연 중에서 선택</h2>
            {featured && (
              <button onClick={() => select(null)} disabled={saving} className="text-xs font-bold text-[#a1876a] underline underline-offset-4 disabled:opacity-40">
                지정 해제 (자동 노출로 전환)
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-[#8a7360]">아무것도 선택하지 않으면 가장 최근에 게시중으로 승인된 공연이 자동으로 노출됩니다.</p>

          {loading ? (
            <p className="mt-4 text-xs text-[#8a7360]">불러오는 중입니다...</p>
          ) : shows.length === 0 ? (
            <p className="mt-4 text-xs text-[#8a7360]">게시중인 공연이 없습니다. 먼저 &quot;공연 등록·관리&quot;에서 공연을 등록하고 상태를 게시중으로 바꿔주세요.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {shows.map((s) => (
                <label key={s.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 ${s.is_featured ? "border-[#b3742f] bg-[#fff3e0]" : "border-[#e7dcc9]"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="popup-show" checked={Boolean(s.is_featured)} onChange={() => select(s.id)} disabled={saving} className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-bold text-[#241a10]">{s.title}</p>
                      <p className="text-xs text-[#8a7360]">{s.venue} · {s.period}</p>
                    </div>
                  </div>
                  {s.is_featured && <span className="shrink-0 rounded-full bg-[#b3742f] px-2.5 py-1 text-[10px] font-black text-white">지정됨</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-[#5c4a38]">실제 팝업 미리보기</p>
          {preview ? (
            <div className="overflow-hidden rounded-2xl border border-[#e7dcc9] bg-white shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
              {preview.poster_url ? (
                <img src={preview.poster_url} alt="" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/4] w-full items-end bg-[linear-gradient(145deg,#c8875e,#7a351d)] p-5">
                  <p className="text-lg font-black leading-snug text-white">{preview.title}</p>
                </div>
              )}
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-[.12em] text-[#b3742f]">{preview.genre} · SHOWDAY PICK</p>
                <p className="mt-1 text-sm font-black text-[#241a10]">{preview.title}</p>
                <p className="mt-1 text-xs text-[#5c4a38]">{preview.venue} · {preview.period}</p>
                {preview.price_label && <p className="mt-1 text-xs font-bold text-[#241a10]">{preview.price_label}</p>}
                <div className="mt-3 rounded-lg bg-[#241a10] py-2.5 text-center text-xs font-black text-white">공연 정보 보기</div>
              </div>
              <p className="border-t border-[#f0e6d6] py-2 text-center text-[10px] font-semibold text-[#8a7360]">☐ 오늘 하루 보지 않기</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e7dcc9] bg-white p-6 text-center text-xs text-[#8a7360]">
              게시중인 공연이 없어서 지금은 팝업이 뜨지 않습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
