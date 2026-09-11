"use client";
import { useEffect, useState } from "react";

type ManualShow = {
  id: string; title: string; genre: string; venue: string; region: string; period: string;
  price_label: string; booking_url: string; poster_url: string; agency_name: string;
  agency_contact: string; status: string; created_at: string;
};

const emptyForm = {
  title: "", genre: "콘서트", venue: "", region: "", period: "", price_label: "",
  booking_url: "", poster_url: "", agency_name: "", agency_contact: "", status: "검토중",
};

export default function AdminShows() {
  const [shows, setShows] = useState<ManualShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/shows").then((r) => r.json()).then((d) => {
      if (d.error) { setConfigError(true); return; }
      setShows(d.shows || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const res = await fetch("/api/admin/shows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "등록에 실패했습니다."); return; }
    setForm(emptyForm);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/shows/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("이 공연 등록을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/shows/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <p className="text-[11px] font-bold tracking-[.16em] text-[#b3742f]">AGENCY SUBMISSIONS</p>
      <h1 className="mt-1 text-2xl font-black">공연 등록·관리</h1>
      <p className="mt-1 text-sm text-[#8a7360]">기획사가 직접 제출한 공연을 검토하고 게시 상태를 관리합니다.</p>

      {configError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다. Vercel 환경변수에 추가 후 재배포해주세요.
        </div>
      )}

      <form onSubmit={submit} className="mt-7 grid grid-cols-1 gap-3 rounded-xl border border-[#e7dcc9] bg-white p-6 sm:grid-cols-2">
        <h2 className="col-span-full text-sm font-black">새 공연 등록 (데모용 입력 폼)</h2>
        <Field label="공연명 *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></Field>
        <Field label="장르"><select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="admin-input">
          {["콘서트","뮤지컬","연극","클래식","전시회","축제","체험·가족행사","기타"].map((g)=><option key={g}>{g}</option>)}
        </select></Field>
        <Field label="공연장 *"><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="admin-input" /></Field>
        <Field label="지역"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="예: 서울 강남구" className="admin-input" /></Field>
        <Field label="공연 기간 *"><input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="예: 2026.10.01~2026.10.31" className="admin-input" /></Field>
        <Field label="가격 안내"><input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} placeholder="예: R석 88,000원" className="admin-input" /></Field>
        <Field label="예매 링크"><input value={form.booking_url} onChange={(e) => setForm({ ...form, booking_url: e.target.value })} placeholder="https://..." className="admin-input" /></Field>
        <Field label="포스터 이미지 URL"><input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} placeholder="https://..." className="admin-input" /></Field>
        <Field label="기획사명 *"><input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} className="admin-input" /></Field>
        <Field label="기획사 연락처"><input value={form.agency_contact} onChange={(e) => setForm({ ...form, agency_contact: e.target.value })} placeholder="이메일 또는 전화번호" className="admin-input" /></Field>

        {error && <p className="col-span-full text-xs font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="col-span-full mt-2 rounded-lg bg-[#2a1d12] py-3 text-sm font-bold text-white disabled:opacity-40">
          {submitting ? "등록 중..." : "공연 등록"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-[#e7dcc9] bg-white p-6">
        <h2 className="text-sm font-black">등록된 공연 목록 ({shows.length})</h2>
        {loading ? <p className="mt-4 text-xs text-[#8a7360]">불러오는 중입니다...</p> : shows.length === 0 ? (
          <p className="mt-4 text-xs text-[#8a7360]">아직 등록된 공연이 없습니다. 위 폼으로 테스트 등록을 해보세요.</p>
        ) : (
          <div className="mt-4 divide-y divide-[#f0e6d6]">
            {shows.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{s.title}</p>
                  <p className="text-xs text-[#8a7360]">{s.venue} · {s.period} · {s.agency_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)} className="rounded-lg border border-[#e7dcc9] px-2 py-1.5 text-xs font-bold">
                    {["검토중","게시중","종료"].map((st)=><option key={st}>{st}</option>)}
                  </select>
                  <button onClick={() => remove(s.id)} className="text-xs font-semibold text-red-500">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`.admin-input{border:1px solid #e7dcc9;border-radius:8px;padding:10px 12px;font-size:13px;width:100%}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#5c4a38]">{label}<div className="mt-1.5">{children}</div></label>;
}
