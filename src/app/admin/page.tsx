"use client";
import { useEffect, useState } from "react";
import { TrendIcon, TicketIcon, CalendarIcon, SparkIcon } from "@/components/Icons";

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
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">SHOWDAY DASHBOARD</p>
        <h1 className="mt-2 text-2xl font-black">전체 운영 현황</h1>
        <p className="mt-1 text-sm text-[#d8c3a4]">회원·공연·예매 연결 흐름을 한눈에 확인합니다.</p>
      </div>

      {loading && <p className="mt-8 text-sm text-[#8a7360]">불러오는 중입니다...</p>}

      {!loading && data?.error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {data.error}
          <p className="mt-2 text-xs text-red-500">
            Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY를 추가하고(Supabase 대시보드 Settings → API에서 확인), 재배포해주세요.
          </p>
        </div>
      )}

      {!loading && data && !data.error && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="가입 회원 수" value={data.memberCount} icon={SparkIcon} accent="from-[#e8a353] to-[#b3742f]" />
            <StatCard label="등록된 공연 (기획사)" value={data.showCount} icon={CalendarIcon} accent="from-[#7fae8f] to-[#4f7d63]" />
            <StatCard label="예매처 클릭 수 (누적)" value={data.clickCount} icon={TicketIcon} accent="from-[#e08a6d] to-[#b8543a]" />
          </div>

          <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
            <div className="flex items-center gap-2">
              <TrendIcon className="h-4 w-4 text-[#b3742f]" />
              <h2 className="text-sm font-black">최근 7일 예매 클릭 추이</h2>
            </div>
            {Object.keys(data.clicksByDay).length === 0 ? (
              <p className="mt-4 text-xs text-[#8a7360]">아직 쌓인 클릭 데이터가 없습니다. 실제 사용자가 &quot;예매처에서 좌석·가격 확인&quot; 버튼을 누르면 여기 표시됩니다.</p>
            ) : (
              <div className="mt-6 flex items-end gap-3">
                {Object.entries(data.clicksByDay).sort().map(([day, count]) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end">
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-[#b3742f] to-[#e8a353]" style={{ height: `${Math.min(100, count * 20)}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-[#a1876a]">{day.slice(5)}</span>
                    <span className="text-xs font-black text-[#241a10]">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
            <h2 className="text-sm font-black">최근 예매 클릭 로그</h2>
            {data.recentClicks.length === 0 ? (
              <p className="mt-4 text-xs text-[#8a7360]">아직 기록이 없습니다.</p>
            ) : (
              <table className="mt-4 w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0e6d6] text-[#a1876a]">
                    <th className="pb-2 font-semibold">예매처</th>
                    <th className="pb-2 font-semibold">공연 ID</th>
                    <th className="pb-2 font-semibold">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentClicks.map((c, i) => (
                    <tr key={i} className="border-b border-[#f7f0e4] last:border-0">
                      <td className="py-2.5 font-bold text-[#241a10]">{c.platform}</td>
                      <td className="py-2.5 text-[#5c4a38]">{c.show_id}</td>
                      <td className="py-2.5 text-[#a1876a]">{new Date(c.created_at).toLocaleString("ko-KR")}</td>
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

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7dcc9] bg-white shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#8a7360]">{label}</p>
          <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${accent} text-white`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-black text-[#241a10]">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
