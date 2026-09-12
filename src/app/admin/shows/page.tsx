"use client";

import { useEffect, useState } from "react";

type ScheduleRow = {
  id?: string;
  performance_date: string;
  start_time: string;
  sort_order?: number;
};

type TicketPriceRow = {
  id?: string;
  seat_grade: string;
  price: string | number;
  price_note: string;
  sort_order?: number;
};

type ManualShow = {
  id: string;
  title: string;
  genre: string;
  venue: string;
  region: string;
  period: string;
  price_label: string;
  booking_url: string;
  poster_url: string;
  agency_name: string;
  agency_contact: string;
  agency_email?: string;
  submission_source?: string;
  status: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  show_time?: string;
  age_label?: string;
  synopsis?: string;
  cast_info?: string;
  crew?: string;
  producer?: string;
  running_time?: string;
  is_featured?: boolean;
  poster_rights_confirmed?: boolean;
  show_schedules?: ScheduleRow[];
  show_ticket_prices?: TicketPriceRow[];
};

const BOOKING_SITES = [
  { label: "인터파크", url: "https://ticket.interpark.com/" },
  { label: "예스24 공연", url: "https://ticket.yes24.com/" },
  { label: "멜론티켓", url: "https://ticket.melon.com/" },
  { label: "티켓링크", url: "https://www.ticketlink.co.kr/" },
  { label: "NOL 티켓", url: "https://nol.nolticket.com/" },
  { label: "직접 입력", url: "" },
];

const AGE_OPTIONS = ["전체관람가", "8세 이상 관람가", "12세 이상 관람가", "15세 이상 관람가", "19세 이상 관람가"];

const emptySchedule = (): ScheduleRow => ({ performance_date: "", start_time: "" });
const emptyTicketPrice = (): TicketPriceRow => ({ seat_grade: "R석", price: "", price_note: "" });

const emptyForm = {
  title: "",
  genre: "콘서트",
  venue: "",
  region: "",
  startDate: "",
  endDate: "",
  booking_url: "",
  bookingSite: BOOKING_SITES[0].label,
  poster_url: "",
  age_label: AGE_OPTIONS[0],
  running_time: "",
  synopsis: "",
  cast_info: "",
  crew: "",
  producer: "",
  agency_name: "",
  agency_contact: "",
  status: "게시중",
  is_featured: false,
  poster_rights_confirmed: false,
};

function formatPeriod(start: string, end: string) {
  const f = (v: string) => v.replaceAll("-", ".");
  if (start && end) return `${f(start)}~${f(end)}`;
  return f(start) || f(end) || "";
}

function parsePeriod(period: string) {
  const [start, end] = (period || "").split("~").map((s) => s.trim().replaceAll(".", "-"));
  return { startDate: start || "", endDate: end || start || "" };
}

export default function AdminShows() {
  const [shows, setShows] = useState<ManualShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([emptySchedule()]);
  const [ticketPrices, setTicketPrices] = useState<TicketPriceRow[]>([emptyTicketPrice()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [sourceFilter, setSourceFilter] = useState("전체");
  const [sortMode, setSortMode] = useState("최근등록순");
  const [reviewChecks, setReviewChecks] = useState({
    poster: false,
    schedule: false,
    venue: false,
    price: false,
    booking: false,
    agency: false,
    copyright: false,
  });

  const reviewComplete = Object.values(reviewChecks).every(Boolean);

  const visibleShows = [...shows]
    .filter((s) => {
      const q = query.trim().toLowerCase();
      const text = `${s.title || ""} ${s.venue || ""} ${s.agency_name || ""}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (statusFilter !== "전체" && s.status !== statusFilter) return false;
      if (sourceFilter === "외부" && s.submission_source !== "public-register") return false;
      if (sourceFilter === "본사" && s.submission_source === "public-register") return false;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "공연일 임박순") return String(a.start_date || "").localeCompare(String(b.start_date || ""));
      if (sortMode === "검토대기 우선") {
        const ap = a.status === "검토중" || a.status === "보완요청" ? 0 : 1;
        const bp = b.status === "검토중" || b.status === "보완요청" ? 0 : 1;
        if (ap !== bp) return ap - bp;
      }
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    });

  const pendingExternal = visibleShows.filter(
    (s) => s.submission_source === "public-register" && ["검토중", "보완요청", "반려"].includes(s.status)
  );
  const managedShows = visibleShows.filter(
    (s) => !(s.submission_source === "public-register" && ["검토중", "보완요청", "반려"].includes(s.status))
  );

  const load = () => {
    setLoading(true);
    fetch("/api/admin/shows")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setConfigError(true);
          return;
        }
        setShows(d.shows || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSchedules([emptySchedule()]);
    setTicketPrices([emptyTicketPrice()]);
    setError("");
    setUploadError("");
    setShowUrlFallback(false);
  };

  const pickBookingSite = (label: string) => {
    const site = BOOKING_SITES.find((s) => s.label === label);
    setForm((f) => ({ ...f, bookingSite: label, booking_url: site?.url || "" }));
  };

  const updateSchedule = (index: number, patch: Partial<ScheduleRow>) => {
    setSchedules((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const addSchedule = () => setSchedules((rows) => [...rows, emptySchedule()]);
  const removeSchedule = (index: number) =>
    setSchedules((rows) => (rows.length === 1 ? [emptySchedule()] : rows.filter((_, i) => i !== index)));

  const updateTicketPrice = (index: number, patch: Partial<TicketPriceRow>) => {
    setTicketPrices((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const addTicketPrice = () => setTicketPrices((rows) => [...rows, { seat_grade: "", price: "", price_note: "" }]);
  const removeTicketPrice = (index: number) =>
    setTicketPrices((rows) => (rows.length === 1 ? [emptyTicketPrice()] : rows.filter((_, i) => i !== index)));

  const uploadPoster = async (file: File) => {
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setUploadError(data.error || "업로드에 실패했습니다.");
      return;
    }
    setForm((f) => ({ ...f, poster_url: data.url }));
  };

  const waitingLabel = (createdAt?: string) => {
    if (!createdAt) return "";
    const ms = Date.now() - new Date(createdAt).getTime();
    const hours = Math.max(0, Math.floor(ms / 3600000));
    if (hours < 1) return "등록 1시간 이내";
    if (hours < 24) return `등록 ${hours}시간 전`;
    return `등록 ${Math.floor(hours / 24)}일 전`;
  };

  const openDirectCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, status: "게시중" });
    setSchedules([emptySchedule()]);
    setTicketPrices([emptyTicketPrice()]);
    setError("");
    setUploadError("");
    setShowUrlFallback(false);
    setModalOpen(true);
  };

  const startEdit = (s: ManualShow) => {
    const { startDate, endDate } = parsePeriod(s.period);
    const site = BOOKING_SITES.find((b) => s.booking_url?.startsWith(b.url) && b.url) || BOOKING_SITES[BOOKING_SITES.length - 1];

    setForm({
      title: s.title,
      genre: s.genre,
      venue: s.venue,
      region: s.region || "",
      startDate,
      endDate,
      booking_url: s.booking_url || "",
      bookingSite: site.label,
      poster_url: s.poster_url || "",
      age_label: s.age_label || AGE_OPTIONS[0],
      running_time: s.running_time || "",
      synopsis: s.synopsis || "",
      cast_info: s.cast_info || "",
      crew: s.crew || "",
      producer: s.producer || "",
      agency_name: s.agency_name,
      agency_contact: s.agency_contact || "",
      status: s.status,
      is_featured: Boolean(s.is_featured),
      poster_rights_confirmed: Boolean(s.poster_rights_confirmed),
    });

    setSchedules(s.show_schedules?.length ? s.show_schedules.map((r) => ({
      performance_date: r.performance_date,
      start_time: String(r.start_time || "").slice(0, 5),
    })) : [emptySchedule()]);

    setTicketPrices(s.show_ticket_prices?.length ? s.show_ticket_prices.map((r) => ({
      seat_grade: r.seat_grade,
      price: r.price,
      price_note: r.price_note || "",
    })) : [emptyTicketPrice()]);

    setEditingId(s.id);
    setUploadError("");
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.venue || !form.startDate || !form.endDate || !form.agency_name) {
      setError("공연명, 공연장, 시작일, 종료일, 기획사명은 필수입니다.");
      return;
    }
    if (form.poster_url && !form.poster_rights_confirmed) {
      setError("포스터 이미지를 등록하려면 저작권 확인 체크박스에 동의해주세요.");
      return;
    }

    const validSchedules = schedules.filter((s) => s.performance_date && s.start_time);
    const validPrices = ticketPrices.filter((p) => p.seat_grade && p.price !== "");

    setSubmitting(true);
    setError("");

    const period = formatPeriod(form.startDate, form.endDate);
    const payload = {
      ...form,
      period,
      submission_source: editingId ? undefined : "admin",
      status: editingId ? form.status : "게시중",
      schedules: validSchedules,
      ticket_prices: validPrices.map((p) => ({
        seat_grade: p.seat_grade,
        price: Number(String(p.price).replaceAll(",", "")),
        price_note: p.price_note,
      })),
    };

    const res = editingId
      ? await fetch(`/api/admin/shows/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/shows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || (editingId ? "수정에 실패했습니다." : "등록에 실패했습니다."));
      return;
    }

    const title = form.title;
    const wasEditing = Boolean(editingId);
    closeModal();
    setToast(wasEditing ? `"${title}" 공연이 수정되었습니다.` : `"${data.show?.title || title}" 공연이 등록되었습니다.`);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/shows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("이 공연 등록을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/shows/${id}`, { method: "DELETE" });
    load();
    setToast("삭제되었습니다.");
  };

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">SHOW MANAGEMENT</p>
            <h1 className="mt-2 text-2xl font-black">공연 승인·등록</h1>
            <p className="mt-1 text-sm text-[#d8c3a4]">외부 기획사 등록 요청은 검수·승인하고, SHOWDAY 본사 공연은 바로 등록·게시합니다.</p>
          </div>
          <button
            onClick={openDirectCreate}
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] px-5 py-3 text-sm font-black text-[#1c130b]"
          >
            + 본사 공연 직접 등록
          </button>
        </div>
      </div>

      {configError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Supabase 서버 설정 또는 공연 회차·좌석가격 테이블을 확인해주세요.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="공연명·공연장·기획사 검색" className="rounded-xl border border-[#e7dcc9] px-3 py-2 text-sm outline-none focus:border-[#b3742f]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#e7dcc9] px-3 py-2 text-sm">
            {["전체","검토중","보완요청","게시중","종료","반려"].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-xl border border-[#e7dcc9] px-3 py-2 text-sm">
            {["전체","외부","본사"].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="rounded-xl border border-[#e7dcc9] px-3 py-2 text-sm">
            {["최근등록순","공연일 임박순","검토대기 우선"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black tracking-[.16em] text-[#b3742f]">EXTERNAL REQUESTS</p>
            <h2 className="mt-1 text-base font-black text-[#241a10]">외부 공연 등록 요청 ({pendingExternal.length})</h2>
            <p className="mt-1 text-xs text-[#8a7360]">기획사·주최사가 /register에서 제출한 공연입니다. 확인 후 승인·게시 또는 반려하세요.</p>
          </div>
          <a href="/register" target="_blank" rel="noreferrer" className="rounded-lg border border-[#e7dcc9] px-3 py-2 text-xs font-bold text-[#5c4a38] hover:border-[#b3742f]">
            외부 등록페이지 보기 ↗
          </a>
        </div>

        {loading ? (
          <p className="mt-5 text-xs text-[#8a7360]">불러오는 중입니다...</p>
        ) : pendingExternal.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#faf7f1] px-4 py-5 text-xs text-[#8a7360]">현재 검토할 외부 공연 등록 요청이 없습니다.</div>
        ) : (
          <div className="mt-5 divide-y divide-[#f0e6d6]">
            {pendingExternal.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#241a10]">
                    {s.title}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${s.status === "반려" ? "bg-red-50 text-red-600" : "bg-[#eef7ff] text-[#2563a6]"}`}>
                      {s.status === "반려" ? "반려" : "검토대기"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#8a7360]">{s.venue} · {s.period} · {s.agency_name}</p>\n                  <p className={`mt-1 text-[11px] font-bold ${waitingLabel(s.created_at).includes("일 전") ? "text-red-600" : "text-[#b3742f]"}`}>{waitingLabel(s.created_at)}</p>
                  {!!s.show_schedules?.length && (
                    <p className="mt-1 text-[11px] leading-5 text-[#8a7360]">
                      회차: {s.show_schedules.map((r) => `${r.performance_date} ${String(r.start_time).slice(0, 5)}`).join(" · ")}
                    </p>
                  )}
                  {!!s.show_ticket_prices?.length && (
                    <p className="text-[11px] leading-5 text-[#8a7360]">
                      가격: {s.show_ticket_prices.map((r) => `${r.seat_grade} ${Number(r.price).toLocaleString("ko-KR")}원`).join(" · ")}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-[#8a7360]">담당자: {s.agency_contact || "-"}{s.agency_email ? ` · ${s.agency_email}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => startEdit(s)} className="rounded-lg border border-[#e7dcc9] px-3 py-2 text-xs font-bold text-[#5c4a38]">내용 확인·수정</button>
                  <button onClick={() => updateStatus(s.id, "게시중")} className="rounded-lg bg-[#241a10] px-3 py-2 text-xs font-black text-white">승인·게시</button>
                  <button onClick={() => updateStatus(s.id, "보완요청")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">보완요청</button>\n                  <button onClick={() => updateStatus(s.id, "반려")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">반려</button>
                  <button onClick={() => remove(s.id)} className="px-2 py-2 text-xs font-semibold text-red-500">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6">
        <div>
          <p className="text-[11px] font-black tracking-[.16em] text-[#b3742f]">PUBLISHED & MANAGED</p>
          <h2 className="mt-1 text-base font-black text-[#241a10]">등록·게시 공연 ({managedShows.length})</h2>
          <p className="mt-1 text-xs text-[#8a7360]">본사 직접등록 공연과 승인 완료된 외부 공연을 관리합니다.</p>
        </div>

        {loading ? (
          <p className="mt-5 text-xs text-[#8a7360]">불러오는 중입니다...</p>
        ) : managedShows.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#faf7f1] px-4 py-5 text-xs text-[#8a7360]">현재 등록·게시된 공연이 없습니다.</div>
        ) : (
          <div className="mt-5 divide-y divide-[#f0e6d6]">
            {managedShows.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#241a10]">
                    {s.title}
                    {s.is_featured && <span className="ml-2 rounded-full bg-[#fff3e0] px-2 py-0.5 text-[10px] font-black text-[#b3742f]">광고 노출중</span>}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${s.submission_source === "public-register" ? "bg-[#eef7ff] text-[#2563a6]" : "bg-[#f3f0eb] text-[#6f5b46]"}`}>
                      {s.submission_source === "public-register" ? "외부 승인" : "본사 등록"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#8a7360]">{s.venue} · {s.period} · {s.agency_name}</p>
                  {!!s.show_schedules?.length && (
                    <p className="mt-1 text-[11px] leading-5 text-[#8a7360]">
                      회차: {s.show_schedules.map((r) => `${r.performance_date} ${String(r.start_time).slice(0, 5)}`).join(" · ")}
                    </p>
                  )}
                  {!!s.show_ticket_prices?.length && (
                    <p className="text-[11px] leading-5 text-[#8a7360]">
                      가격: {s.show_ticket_prices.map((r) => `${r.seat_grade} ${Number(r.price).toLocaleString("ko-KR")}원`).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(s)} className="rounded-lg border border-[#e7dcc9] px-2.5 py-1.5 text-xs font-bold text-[#5c4a38]">수정</button>
                  <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)} className="rounded-lg border border-[#e7dcc9] px-2 py-1.5 text-xs font-bold">
                    {["게시중", "종료", "검토중", "보완요청", "반려"].map((st) => <option key={st}>{st}</option>)}
                  </select>
                  <button onClick={() => remove(s.id)} className="text-xs font-semibold text-red-500">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#241a10]">{editingId ? "공연 수정" : "본사 공연 직접 등록"}</h2>
              <button onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-full text-[#8a7360]">✕</button>
            </div>

            <form onSubmit={submit} className="mt-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="공연명 *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></Field>
                <Field label="장르">
                  <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="admin-input">
                    {["콘서트", "뮤지컬", "연극", "클래식", "전시회", "축제", "체험·가족행사", "기타"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="공연장 *"><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="admin-input" /></Field>
                <Field label="지역"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="예: 서울 강남구" className="admin-input" /></Field>
              </div>

              <SectionTitle title="공연기간" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="시작일 *"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="admin-input" /></Field>
                <Field label="종료일 *"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="admin-input" /></Field>
              </div>

              <SectionTitle title="공연 회차" />
              <div className="space-y-2">
                {schedules.map((row, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-[#fffaf3] p-3 sm:grid-cols-[1fr_1fr_auto]">
                    <Field label={`회차 ${i + 1} 날짜`}><input type="date" value={row.performance_date} onChange={(e) => updateSchedule(i, { performance_date: e.target.value })} className="admin-input" /></Field>
                    <Field label="시작시간"><input type="time" value={row.start_time} onChange={(e) => updateSchedule(i, { start_time: e.target.value })} className="admin-input" /></Field>
                    <button type="button" onClick={() => removeSchedule(i)} className="self-end rounded-lg border border-[#e7dcc9] px-3 py-2.5 text-xs font-bold text-red-500">삭제</button>
                  </div>
                ))}
                <button type="button" onClick={addSchedule} className="text-xs font-bold text-[#b3742f] underline underline-offset-4">+ 회차 추가</button>
              </div>

              <SectionTitle title="좌석별 티켓 가격" />
              <div className="space-y-2">
                {ticketPrices.map((row, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-[#fffaf3] p-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
                    <Field label="좌석 등급"><input value={row.seat_grade} onChange={(e) => updateTicketPrice(i, { seat_grade: e.target.value })} placeholder="VIP석 / R석 / 전석" className="admin-input" /></Field>
                    <Field label="가격(원)"><input type="number" min="0" value={row.price} onChange={(e) => updateTicketPrice(i, { price: e.target.value })} placeholder="88000" className="admin-input" /></Field>
                    <Field label="가격 안내"><input value={row.price_note} onChange={(e) => updateTicketPrice(i, { price_note: e.target.value })} placeholder="조기예매 10% 할인" className="admin-input" /></Field>
                    <button type="button" onClick={() => removeTicketPrice(i)} className="self-end rounded-lg border border-[#e7dcc9] px-3 py-2.5 text-xs font-bold text-red-500">삭제</button>
                  </div>
                ))}
                <button type="button" onClick={addTicketPrice} className="text-xs font-bold text-[#b3742f] underline underline-offset-4">+ 좌석 등급 추가</button>
              </div>

              <SectionTitle title="예매처 · 관람정보 · 포스터" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="예매 사이트 선택">
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_SITES.map((site) => (
                      <button
                        key={site.label}
                        type="button"
                        onClick={() => pickBookingSite(site.label)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${form.bookingSite === site.label ? "border-[#241a10] bg-[#241a10] text-white" : "border-[#e7dcc9] text-[#5c4a38]"}`}
                      >
                        {site.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="예매 링크"><input value={form.booking_url} onChange={(e) => setForm({ ...form, booking_url: e.target.value })} placeholder="https://..." className="admin-input" /></Field>
                <Field label="관람연령">
                  <select value={form.age_label} onChange={(e) => setForm({ ...form, age_label: e.target.value })} className="admin-input">
                    {AGE_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="러닝타임"><input value={form.running_time} onChange={(e) => setForm({ ...form, running_time: e.target.value })} placeholder="예: 120분" className="admin-input" /></Field>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-[#5c4a38]">포스터 이미지</p>
                <div className="mt-1.5 flex items-start gap-4">
                  {form.poster_url ? (
                    <img src={form.poster_url} alt="포스터 미리보기" className="h-32 w-24 shrink-0 rounded-lg border border-[#e7dcc9] object-cover" />
                  ) : (
                    <div className="grid h-32 w-24 shrink-0 place-items-center rounded-lg border border-dashed border-[#e7dcc9] text-[10px] text-[#a1876a]">미리보기</div>
                  )}
                  <div className="flex-1">
                    <label className="inline-block cursor-pointer rounded-lg border border-[#e7dcc9] px-3.5 py-2 text-xs font-bold text-[#5c4a38]">
                      {uploading ? "업로드 중..." : form.poster_url ? "이미지 교체" : "이미지 선택"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPoster(f); e.target.value = ""; }} />
                    </label>
                    {form.poster_url && <button type="button" onClick={() => setForm({ ...form, poster_url: "" })} className="ml-2 text-xs font-semibold text-red-500">제거</button>}
                    {uploadError && <p className="mt-1.5 text-xs font-semibold text-red-600">{uploadError}</p>}
                    <button type="button" onClick={() => setShowUrlFallback((v) => !v)} className="mt-2 block text-[11px] font-semibold text-[#a1876a] underline">
                      {showUrlFallback ? "URL 직접 입력 닫기" : "관리자용 · URL 직접 입력"}
                    </button>
                    {showUrlFallback && <input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} placeholder="https://..." className="admin-input mt-2" />}
                    {form.poster_url && (
                      <label className="mt-3 flex items-start gap-2 text-[11px] font-semibold text-[#5c4a38]">
                        <input type="checkbox" checked={form.poster_rights_confirmed} onChange={(e) => setForm({ ...form, poster_rights_confirmed: e.target.checked })} className="mt-0.5" />
                        해당 포스터 이미지를 등록·사용할 권한이 있음을 확인합니다.
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <SectionTitle title="공연 상세정보" />
              <div className="grid grid-cols-1 gap-3">
                <Field label="공연 소개"><textarea value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} rows={3} className="admin-input" /></Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="출연"><input value={form.cast_info} onChange={(e) => setForm({ ...form, cast_info: e.target.value })} className="admin-input" /></Field>
                  <Field label="제작진"><input value={form.crew} onChange={(e) => setForm({ ...form, crew: e.target.value })} className="admin-input" /></Field>
                  <Field label="기획·제작"><input value={form.producer} onChange={(e) => setForm({ ...form, producer: e.target.value })} className="admin-input" /></Field>
                </div>
              </div>

              <SectionTitle title="기획사 정보" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="기획사명 *"><input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} className="admin-input" /></Field>
                <Field label="기획사 연락처"><input value={form.agency_contact} onChange={(e) => setForm({ ...form, agency_contact: e.target.value })} className="admin-input" /></Field>
              </div>

              {error && <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>}

              <div className="mt-6 flex gap-2">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-[#e7dcc9] py-3 text-sm font-bold text-[#5c4a38]">취소</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] py-3 text-sm font-black text-[#1c130b] disabled:opacity-40">
                  {submitting ? (editingId ? "저장 중..." : "등록·게시 중...") : (editingId ? "수정 사항 저장" : "등록 후 바로 게시")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#241a10] px-5 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      <style>{`.admin-input{border:1px solid #e7dcc9;border-radius:8px;padding:10px 12px;font-size:13px;width:100%}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#5c4a38]">{label}<div className="mt-1.5">{children}</div></label>;
}

function SectionTitle({ title }: { title: string }) {
  return <div className="mt-5 border-t border-[#f0e6d6] pt-4"><p className="mb-3 text-xs font-bold text-[#5c4a38]">{title}</p></div>;
}
