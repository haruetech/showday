"use client";
import { useEffect, useState } from "react";

type ClicksData = {
  total: number;
  byPlatform: Record<string, number>;
  topShows: [string, number][];
  recent: { platform: string; show_id: string; target_url: string; created_at: string }[];
  error?: string;
};

export default function AdminClicks() {
  const [data, setData] = useState<ClicksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/clicks").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="text-[11px] font-bold tracking-[.16em] text-[#b3742f]">TRAFFIC</p>
      <h1 className="mt-1 text-2xl font-black">예매 클릭 통계</h1>
      <p className="mt-1 text-sm text-[#8a7360]">"예매처에서 좌석·가격 확인" 버튼 클릭 데이터 — 예매처 제휴 협상 시 근거 자료로 활용합니다.</p>

      {loading && <p className="mt-8 text-sm text-[#8a7360]">불러오는 중입니다...</p>}

      {!loading && data?.error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.
          <p className="mt-2 text-xs text-red-500">Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY를 추가하고(Supabase 대시보드 Settings → API에서 확인), 재배포해주세요.</p>
        </div>
      )}

      {!loading && data && !data.error && (
        <>
          <div className="mt-7 rounded-xl border border-[#e7dcc9] bg-white p-6">
            <p className="text-xs font-semibold text-[#8a7360]">누적 클릭 수 (최근 500건 기준)</p>
            <p className="mt-2 text-3xl font-black">{data.total.toLocaleString()}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e7dcc9] bg-white p-6">
              <h2 className="text-sm font-black">예매처별 클릭 비중</h2>
              {Object.keys(data.byPlatform).length === 0 ? (
                <p className="mt-4 text-xs text-[#8a7360]">아직 데이터가 없습니다.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {Object.entries(data.byPlatform).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                    <div key={platform}>
                      <div className="flex justify-between text-xs font-bold"><span>{platform}</span><span>{count}</span></div>
                      <div className="mt-1 h-2 w-full rounded-full bg-[#f0e6d6]">
                        <div className="h-2 rounded-full bg-[#c98a4b]" style={{ width: `${(count / data.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#e7dcc9] bg-white p-6">
              <h2 className="text-sm font-black">클릭 많은 공연 TOP 10</h2>
              {data.topShows.length === 0 ? (
                <p className="mt-4 text-xs text-[#8a7360]">아직 데이터가 없습니다.</p>
              ) : (
                <ol className="mt-4 space-y-2 text-xs">
                  {data.topShows.map(([showId, count], i) => (
                    <li key={showId} className="flex justify-between border-b border-[#f0e6d6] pb-2">
                      <span className="font-semibold">{i + 1}. {showId}</span>
                      <span className="font-bold">{count}회</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#e7dcc9] bg-white p-6">
            <h2 className="text-sm font-black">최근 클릭 로그</h2>
            {data.recent.length === 0 ? <p className="mt-4 text-xs text-[#8a7360]">아직 데이터가 없습니다.</p> : (
              <table className="mt-4 w-full text-left text-xs">
                <thead><tr className="text-[#8a7360]"><th className="pb-2">예매처</th><th className="pb-2">공연 ID</th><th className="pb-2">시각</th></tr></thead>
                <tbody>
                  {data.recent.map((r, i) => (
                    <tr key={i} className="border-t border-[#f0e6d6]">
                      <td className="py-2 font-bold">{r.platform}</td>
                      <td className="py-2">{r.show_id}</td>
                      <td className="py-2 text-[#8a7360]">{new Date(r.created_at).toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
