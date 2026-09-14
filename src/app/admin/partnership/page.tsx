"use client";
import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  inquiry_type: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string;
  status: "new" | "read";
  created_at: string;
};

function formatDate(v: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(v));
  } catch {
    return v;
  }
}

export default function AdminPartnership() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/partnership")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setInquiries(d.inquiries || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: "read" } : i)));
    await fetch("/api/partnership", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  };

  const newCount = inquiries.filter((i) => i.status !== "read").length;

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">PARTNERSHIP</p>
        <h1 className="mt-2 text-2xl font-black">제휴·광고 문의</h1>
        <p className="mt-1 text-sm text-[#d8c3a4]">/partnership 폼으로 접수된 문의입니다. {newCount > 0 && `읽지 않은 문의 ${newCount}건`}</p>
      </div>

      {loading && <p className="mt-8 text-sm text-[#8a7360]">불러오는 중입니다...</p>}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && inquiries.length === 0 && (
        <p className="mt-8 text-sm text-[#8a7360]">아직 접수된 문의가 없습니다.</p>
      )}

      {!loading && !error && inquiries.length > 0 && (
        <div className="mt-6 space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className={`rounded-2xl border p-5 shadow-[0_1px_2px_rgba(36,26,16,0.04)] ${i.status === "new" ? "border-[#e8a353] bg-[#fff8f0]" : "border-[#e7dcc9] bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#241a10] px-2.5 py-1 text-[10px] font-black text-white">{i.inquiry_type}</span>
                    {i.status === "new" && <span className="rounded-full bg-[#e8a353] px-2.5 py-1 text-[10px] font-black text-[#1c130b]">NEW</span>}
                    <span className="text-[11px] text-[#9c8a7d]">{formatDate(i.created_at)}</span>
                  </div>
                  <b className="mt-2 block text-sm text-[#241a10]">{i.company_name} · {i.contact_name}</b>
                  <p className="mt-0.5 text-xs text-[#8a7360]">
                    {i.contact_email}{i.contact_phone && ` · ${i.contact_phone}`}
                  </p>
                </div>
                {i.status === "new" && (
                  <button onClick={() => markRead(i.id)} className="shrink-0 rounded-lg border border-[#e7dcc9] px-3 py-2 text-xs font-bold text-[#5c4a38] hover:border-[#c77b46]">
                    읽음 처리
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#faf6f0] p-3 text-xs leading-6 text-[#5c4a38]">{i.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
