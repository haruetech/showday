"use client";
import { useEffect, useState } from "react";

type Overview = {
  memberCount: number;
  showCount: number;
  clickCount: number;
  recentClicks: { platform: string; show_id: string; created_at: string }[];
  clicksByDay: Record<string, number>;
  error?: string;
};

export default function AdminHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="text-[11px] font-bold tracking-[.16em] text-[#b3742f]">DASHBOARD</p>
      <h1 className="mt-1 text-2xl font-black">전체 운영 현황판</h1>

      {loading && <p className="mt-8 text-sm text-[#8a7360]">불러오는 중입니다...</p>}

      {!loading && data?.error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {data.error}
          <p className="mt-2 text-xs text-red-500">
            Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY를 추가하고(Supabase 대시보드 Settings → API에서 확인), 재배포해주세요.
          </p>
        </div>
      )}

      {!loading && data && !data.error && (
        <>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="가입 회원 수" value={data.memberCount} />
            <StatCard label="등록된 공연 (기획사)" value={data.showCount} />
            <StatCard label="예매처 클릭 수 (누적)" value={data.clickCount} />
          </div>

          <div className="mt-8 rounded-xl border border-[#e7dcc9] bg-white p-6">
            <h2 className="text-sm font-black">최근 7일 예매 클릭 추이</h2>
            {Object.keys(data.clicksByDay).length === 0 ? (
              <p className="mt-4 text-xs text-[#8a7360]">아직 쌓인 클릭 데이터가 없습니다. 실제 사용자가 "예매처에서 좌석·가격 확인" 버튼을 누르면 여기 표시됩니다.</p>
            ) : (
              <div className="mt-4 flex items-end gap-3">
                {Object.entries(data.clicksByDay).sort().map(([day, count]) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-24 w-full items-end">
                      <div className="w-full rounded-t bg-[#c98a4b]" style={{ height: `${Math.min(100, count * 20)}%` }} />
                    </div>
                    <span className="text-[10px] text-[#8a7360]">{day.slice(5)}</span>
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-[#e7dcc9] bg-white p-6">
            <h2 className="text-sm font-black">최근 예매 클릭 로그</h2>
            {data.recentClicks.length === 0 ? (
              <p className="mt-4 text-xs text-[#8a7360]">아직 기록이 없습니다.</p>
            ) : (
              <table className="mt-4 w-full text-left text-xs">
                <thead>
                  <tr className="text-[#8a7360]">
                    <th className="pb-2 font-semibold">예매처</th>
                    <th className="pb-2 font-semibold">공연 ID</th>
                    <th className="pb-2 font-semibold">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentClicks.map((c, i) => (
                    <tr key={i} className="border-t border-[#f0e6d6]">
                      <td className="py-2 font-bold">{c.platform}</td>
                      <td className="py-2">{c.show_id}</td>
                      <td className="py-2 text-[#8a7360]">{new Date(c.created_at).toLocaleString("ko-KR")}</td>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#e7dcc9] bg-white p-6">
      <p className="text-xs font-semibold text-[#8a7360]">{label}</p>
      <p className="mt-2 text-3xl font-black">{value.toLocaleString()}</p>
    </div>
  );
}
