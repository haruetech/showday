"use client";
import { useEffect, useState } from "react";

type ManualShow = {
  id: string; title: string; genre: string; venue: string; region: string; period: string;
  price_label: string; booking_url: string; poster_url: string; agency_name: string;
  agency_contact: string; status: string; created_at: string;
  show_time?: string; age_label?: string; synopsis?: string; cast_info?: string; crew?: string; producer?: string; running_time?: string;
};

const BOOKING_SITES = [
  { label: "인터파크", url: "https://ticket.interpark.com/" },
  { label: "예스24 공연", url: "https://ticket.yes24.com/" },
  { label: "멜론티켓", url: "https://ticket.melon.com/" },
  { label: "티켓링크", url: "https://www.ticketlink.co.kr/" },
  { label: "NOL 티켓", url: "https://nol.nolticket.com/" },
  { label: "직접 입력", url: "" },
];

const AGE_OPTIONS = ["전체관람가","8세 이상 관람가","12세 이상 관람가","15세 이상 관람가","19세 이상 관람가"];

type PriceRow = { tier: string; price: string };
const emptyPriceRows: PriceRow[] = [{ tier: "R석", price: "" }];

const emptyForm = {
  title: "", genre: "콘서트", venue: "", region: "",
  startDate: "", endDate: "", show_time: "",
  booking_url: "", bookingSite: BOOKING_SITES[0].label,
  poster_url: "", age_label: AGE_OPTIONS[0], running_time: "",
  synopsis: "", cast_info: "", crew: "", producer: "",
  agency_name: "", agency_contact: "", status: "검토중",
};

function formatPeriod(start: string, end: string) {
  const f = (v: string) => v.replaceAll("-", ".");
  if (start && end) return `${f(start)}~${f(end)}`;
  return f(start) || f(end) || "";
}

export default function AdminShows() {
  const [shows, setShows] = useState<ManualShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [priceRows, setPriceRows] = useState<PriceRow[]>(emptyPriceRows);
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

  const updatePriceRow = (i: number, patch: Partial<PriceRow>) => {
    setPriceRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const addPriceRow = () => setPriceRows((rows) => [...rows, { tier: "", price: "" }]);
  const removePriceRow = (i: number) => setPriceRows((rows) => rows.filter((_, idx) => idx !== i));

  const pickBookingSite = (label: string) => {
    const site = BOOKING_SITES.find((s) => s.label === label);
    setForm((f) => ({ ...f, bookingSite: label, booking_url: site?.url || "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const price_label = priceRows.filter((r) => r.tier && r.price).map((r) => `${r.tier} ${r.price}`).join(" / ");
    const period = formatPeriod(form.startDate, form.endDate);
    const payload = { ...form, price_label, period };
    const res = await fetch("/api/admin/shows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "등록에 실패했습니다."); return; }
    setForm(emptyForm); setPriceRows(emptyPriceRows);
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

      <form onSubmit={submit} className="mt-7 rounded-xl border border-[#e7dcc9] bg-white p-6">
        <h2 className="text-sm font-black">새 공연 등록</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="공연명 *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></Field>
          <Field label="장르"><select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="admin-input">
            {["콘서트","뮤지컬","연극","클래식","전시회","축제","체험·가족행사","기타"].map((g)=><option key={g}>{g}</option>)}
          </select></Field>
          <Field label="공연장 *"><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="admin-input" /></Field>
          <Field label="지역"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="예: 서울 강남구" className="admin-input" /></Field>
        </div>

        <div className="mt-5 border-t border-[#f0e6d6] pt-4">
          <p className="text-xs font-bold text-[#5c4a38]">공연 기간·시간</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="시작일 *"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="admin-input" /></Field>
            <Field label="종료일 *"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="admin-input" /></Field>
            <Field label="공연시간 안내"><input value={form.show_time} onChange={(e) => setForm({ ...form, show_time: e.target.value })} placeholder="예: 화~금 20:00, 토 15:00/19:00" className="admin-input" /></Field>
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0e6d6] pt-4">
          <p className="text-xs font-bold text-[#5c4a38]">가격 안내 (좌석 등급별로 추가)</p>
          <div className="mt-3 space-y-2">
            {priceRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={row.tier} onChange={(e) => updatePriceRow(i, { tier: e.target.value })} placeholder="예: R석" className="admin-input w-28 shrink-0" />
                <input value={row.price} onChange={(e) => updatePriceRow(i, { price: e.target.value })} placeholder="예: 88,000원" className="admin-input" />
                {priceRows.length > 1 && <button type="button" onClick={() => removePriceRow(i)} className="shrink-0 text-xs font-semibold text-red-500">삭제</button>}
              </div>
            ))}
            <button type="button" onClick={addPriceRow} className="text-xs font-bold text-[#b3742f] underline underline-offset-4">+ 좌석 등급 추가</button>
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0e6d6] pt-4">
          <p className="text-xs font-bold text-[#5c4a38]">예매처 · 포스터</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="예매 사이트 선택">
              <div className="flex flex-wrap gap-2">
                {BOOKING_SITES.map((site) => (
                  <button key={site.label} type="button" onClick={() => pickBookingSite(site.label)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${form.bookingSite === site.label ? "border-[#2a1d12] bg-[#2a1d12] text-white" : "border-[#e7dcc9] text-[#5c4a38]"}`}>
                    {site.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="예매 링크 (정확한 공연 페이지 주소로 수정)"><input value={form.booking_url} onChange={(e) => setForm({ ...form, booking_url: e.target.value })} placeholder="https://..." className="admin-input" /></Field>
            <Field label="포스터 이미지 URL"><input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} placeholder="https://... (기획사가 갖고 있는 포스터 이미지 주소)" className="admin-input" /></Field>
            <Field label="관람연령"><select value={form.age_label} onChange={(e) => setForm({ ...form, age_label: e.target.value })} className="admin-input">
              {AGE_OPTIONS.map((a)=><option key={a}>{a}</option>)}
            </select></Field>
            <Field label="러닝타임"><input value={form.running_time} onChange={(e) => setForm({ ...form, running_time: e.target.value })} placeholder="예: 150분(인터미션 20분 포함)" className="admin-input" /></Field>
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0e6d6] pt-4">
          <p className="text-xs font-bold text-[#5c4a38]">공연 상세 정보</p>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <Field label="공연 소개"><textarea value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} rows={3} className="admin-input" /></Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="출연"><input value={form.cast_info} onChange={(e) => setForm({ ...form, cast_info: e.target.value })} placeholder="예: 김배우, 이배우" className="admin-input" /></Field>
              <Field label="제작진"><input value={form.crew} onChange={(e) => setForm({ ...form, crew: e.target.value })} placeholder="예: 연출 최감독" className="admin-input" /></Field>
              <Field label="기획·제작"><input value={form.producer} onChange={(e) => setForm({ ...form, producer: e.target.value })} className="admin-input" /></Field>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0e6d6] pt-4">
          <p className="text-xs font-bold text-[#5c4a38]">기획사 정보</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="기획사명 *"><input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} className="admin-input" /></Field>
            <Field label="기획사 연락처"><input value={form.agency_contact} onChange={(e) => setForm({ ...form, agency_contact: e.target.value })} placeholder="이메일 또는 전화번호" className="admin-input" /></Field>
          </div>
        </div>

        {error && <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="mt-5 w-full rounded-lg bg-[#2a1d12] py-3 text-sm font-bold text-white disabled:opacity-40">
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
