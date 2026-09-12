"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type ScheduleRow = {
  performance_date: string;
  start_time: string;
};

type TicketPriceRow = {
  seat_grade: string;
  price: string;
  price_note: string;
};

type FormState = {
  title: string;
  genre: string;
  venue: string;
  region: string;
  startDate: string;
  endDate: string;
  booking_url: string;
  poster_url: string;
  age_label: string;
  running_time: string;
  synopsis: string;
  cast_info: string;
  producer: string;
  agency_name: string;
  agency_contact: string;
  agency_email: string;
  poster_rights_confirmed: boolean;
  privacy_consent: boolean;
  website: string; // honeypot
};

const initialForm: FormState = {
  title: "",
  genre: "콘서트",
  venue: "",
  region: "",
  startDate: "",
  endDate: "",
  booking_url: "",
  poster_url: "",
  age_label: "전체관람가",
  running_time: "",
  synopsis: "",
  cast_info: "",
  producer: "",
  agency_name: "",
  agency_contact: "",
  agency_email: "",
  poster_rights_confirmed: false,
  privacy_consent: false,
  website: "",
};

const genres = ["콘서트", "뮤지컬", "연극", "클래식", "전시회", "축제", "체험·가족행사", "기타"];
const ages = ["전체관람가", "8세 이상 관람가", "12세 이상 관람가", "15세 이상 관람가", "19세 이상 관람가"];

const emptySchedule = (): ScheduleRow => ({ performance_date: "", start_time: "" });
const emptyPrice = (): TicketPriceRow => ({ seat_grade: "R석", price: "", price_note: "" });

export default function RegisterShowPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([emptySchedule()]);
  const [ticketPrices, setTicketPrices] = useState<TicketPriceRow[]>([emptyPrice()]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const period = useMemo(() => {
    const fmt = (v: string) => v.replaceAll("-", ".");
    if (form.startDate && form.endDate) return `${fmt(form.startDate)}~${fmt(form.endDate)}`;
    return fmt(form.startDate || form.endDate);
  }, [form.startDate, form.endDate]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateSchedule = (index: number, patch: Partial<ScheduleRow>) => {
    setSchedules((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addSchedule = () => setSchedules((rows) => [...rows, emptySchedule()]);
  const removeSchedule = (index: number) =>
    setSchedules((rows) => (rows.length === 1 ? [emptySchedule()] : rows.filter((_, i) => i !== index)));

  const updatePrice = (index: number, patch: Partial<TicketPriceRow>) => {
    setTicketPrices((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addPrice = () => setTicketPrices((rows) => [...rows, { seat_grade: "", price: "", price_note: "" }]);
  const removePrice = (index: number) =>
    setTicketPrices((rows) => (rows.length === 1 ? [emptyPrice()] : rows.filter((_, i) => i !== index)));

  async function uploadPoster(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/register/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "포스터 업로드에 실패했습니다.");
      return;
    }
    set("poster_url", data.url || "");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.venue || !period || !form.agency_name || !form.agency_contact || !form.agency_email) {
      setError("필수 항목을 확인해주세요. 공연명, 공연장, 기간, 업체명, 연락처, 이메일은 필수입니다.");
      return;
    }

    const validSchedules = schedules.filter((s) => s.performance_date && s.start_time);
    const partiallyFilledSchedule = schedules.some(
      (s) => (s.performance_date && !s.start_time) || (!s.performance_date && s.start_time)
    );
    if (partiallyFilledSchedule) {
      setError("공연 회차는 날짜와 시작시간을 함께 입력해주세요.");
      return;
    }

    const validPrices = ticketPrices.filter((p) => p.seat_grade && p.price !== "");
    const partiallyFilledPrice = ticketPrices.some(
      (p) => (p.seat_grade && p.price === "") || (!p.seat_grade && p.price !== "")
    );
    if (partiallyFilledPrice) {
      setError("좌석 등급과 가격을 함께 입력해주세요.");
      return;
    }

    if (!form.poster_rights_confirmed) {
      setError("포스터 이미지 사용 권한 확인에 동의해주세요.");
      return;
    }
    if (!form.privacy_consent) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        period,
        schedules: validSchedules,
        ticket_prices: validPrices.map((p) => ({
          ...p,
          price: Number(String(p.price).replaceAll(",", "")),
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "등록 신청에 실패했습니다.");
      return;
    }

    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <>
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16 sm:py-24">
          <div className="rounded-3xl border border-[#eadfce] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff0dc] text-2xl">✓</div>
            <h1 className="mt-5 text-2xl font-black text-[#241a10]">공연 등록 신청이 완료되었습니다.</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#725f4d]">
              SHOWDAY 운영팀이 내용을 확인한 후 승인된 공연만 공개합니다. 정보 보완이 필요한 경우 입력하신 연락처 또는 이메일로 연락드릴 수 있습니다.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setForm(initialForm);
                  setSchedules([emptySchedule()]);
                  setTicketPrices([emptyPrice()]);
                  setDone(false);
                }}
                className="rounded-xl border border-[#dfd2bf] px-5 py-3 text-sm font-bold text-[#5c4a38]"
              >
                다른 공연 등록
              </button>
              <Link href="/" className="rounded-xl bg-[#241a10] px-5 py-3 text-sm font-black text-white">
                SHOWDAY 홈
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#fffaf3]">
        <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.18em] text-[#b3742f]">FOR ORGANIZERS</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#241a10] sm:text-4xl">
              기획사·주최사 공연 직접 등록
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#725f4d]">
              회원가입 없이 공연 소식을 등록할 수 있습니다. 제출 즉시 공개되지 않으며, SHOWDAY 검수 후 승인된 공연만 서비스에 노출됩니다.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
            <form onSubmit={submit} className="rounded-3xl border border-[#eadfce] bg-white p-5 shadow-sm sm:p-8">
              <Section title="공연 기본정보">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="공연명 *">
                    <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
                  </Field>
                  <Field label="장르">
                    <select className="input" value={form.genre} onChange={(e) => set("genre", e.target.value)}>
                      {genres.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="공연장 *">
                    <input className="input" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
                  </Field>
                  <Field label="지역">
                    <input className="input" placeholder="예: 서울 도봉구" value={form.region} onChange={(e) => set("region", e.target.value)} />
                  </Field>
                  <Field label="공연 시작일 *">
                    <input type="date" className="input" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                  </Field>
                  <Field label="공연 종료일 *">
                    <input type="date" className="input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                  </Field>
                  <Field label="관람연령">
                    <select className="input" value={form.age_label} onChange={(e) => set("age_label", e.target.value)}>
                      {ages.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Field>
                  <Field label="러닝타임">
                    <input className="input" placeholder="예: 120분" value={form.running_time} onChange={(e) => set("running_time", e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="공연 회차">
                <p className="-mt-2 mb-4 text-xs leading-5 text-[#8a7360]">
                  날짜와 시작시간을 회차별로 입력해주세요. 예: 9월 12일 15:00 / 9월 13일 15:00
                </p>
                <div className="space-y-3">
                  {schedules.map((row, index) => (
                    <div key={index} className="grid gap-2 rounded-2xl bg-[#fffaf3] p-3 sm:grid-cols-[1fr_1fr_auto]">
                      <Field label={`회차 ${index + 1} 날짜`}>
                        <input
                          type="date"
                          className="input"
                          value={row.performance_date}
                          onChange={(e) => updateSchedule(index, { performance_date: e.target.value })}
                        />
                      </Field>
                      <Field label="시작시간">
                        <input
                          type="time"
                          className="input"
                          value={row.start_time}
                          onChange={(e) => updateSchedule(index, { start_time: e.target.value })}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="self-end rounded-xl border border-[#eadfce] px-3 py-2.5 text-xs font-bold text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="mt-3 rounded-xl border border-[#d9b987] bg-[#fff8ed] px-4 py-2.5 text-xs font-black text-[#9a5f24]"
                >
                  + 회차 추가
                </button>
              </Section>

              <Section title="티켓 가격">
                <p className="-mt-2 mb-4 text-xs leading-5 text-[#8a7360]">
                  좌석 등급별 가격을 추가해주세요. 무료공연은 좌석등급에 ‘전석’, 가격에 ‘0’을 입력할 수 있습니다.
                </p>
                <div className="space-y-3">
                  {ticketPrices.map((row, index) => (
                    <div key={index} className="grid gap-2 rounded-2xl bg-[#fffaf3] p-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
                      <Field label="좌석 등급">
                        <input
                          className="input"
                          placeholder="예: VIP석, R석, 전석"
                          value={row.seat_grade}
                          onChange={(e) => updatePrice(index, { seat_grade: e.target.value })}
                        />
                      </Field>
                      <Field label="가격(원)">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          className="input"
                          placeholder="예: 88000"
                          value={row.price}
                          onChange={(e) => updatePrice(index, { price: e.target.value })}
                        />
                      </Field>
                      <Field label="가격 안내">
                        <input
                          className="input"
                          placeholder="예: 조기예매 10% 할인"
                          value={row.price_note}
                          onChange={(e) => updatePrice(index, { price_note: e.target.value })}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removePrice(index)}
                        className="self-end rounded-xl border border-[#eadfce] px-3 py-2.5 text-xs font-bold text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPrice}
                  className="mt-3 rounded-xl border border-[#d9b987] bg-[#fff8ed] px-4 py-2.5 text-xs font-black text-[#9a5f24]"
                >
                  + 좌석 등급 추가
                </button>
                <div className="mt-4">
                  <Field label="예매 링크">
                    <input type="url" className="input" placeholder="https://..." value={form.booking_url} onChange={(e) => set("booking_url", e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="포스터 이미지">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="grid h-52 w-36 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-[#dfd2bf] bg-[#fffaf3] text-center text-xs text-[#9a826b]">
                    {form.poster_url ? <img src={form.poster_url} alt="포스터 미리보기" className="h-full w-full object-cover" /> : "포스터\n미리보기"}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer rounded-xl border border-[#dfd2bf] px-4 py-2.5 text-sm font-bold text-[#5c4a38] hover:border-[#b3742f]">
                      {uploading ? "업로드 중..." : form.poster_url ? "이미지 교체" : "포스터 선택"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadPoster(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-[#8a7360]">JPG · PNG · WEBP / 최대 5MB. 세로형 공식 포스터 사용을 권장합니다.</p>
                    <label className="mt-4 flex items-start gap-2 text-xs font-semibold leading-5 text-[#5c4a38]">
                      <input type="checkbox" className="mt-1" checked={form.poster_rights_confirmed} onChange={(e) => set("poster_rights_confirmed", e.target.checked)} />
                      해당 포스터를 SHOWDAY에 등록·노출할 권한이 있음을 확인합니다. *
                    </label>
                  </div>
                </div>
              </Section>

              <Section title="공연 상세정보">
                <div className="space-y-4">
                  <Field label="공연 소개">
                    <textarea className="input min-h-28" value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="출연 아티스트">
                      <input className="input" value={form.cast_info} onChange={(e) => set("cast_info", e.target.value)} />
                    </Field>
                    <Field label="기획·제작">
                      <input className="input" value={form.producer} onChange={(e) => set("producer", e.target.value)} />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section title="업체 담당자 정보">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="기획사·주최사명 *">
                    <input className="input" value={form.agency_name} onChange={(e) => set("agency_name", e.target.value)} />
                  </Field>
                  <Field label="담당자 연락처 *">
                    <input className="input" placeholder="010-0000-0000" value={form.agency_contact} onChange={(e) => set("agency_contact", e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="담당자 이메일 *">
                      <input type="email" className="input" placeholder="name@company.com" value={form.agency_email} onChange={(e) => set("agency_email", e.target.value)} />
                    </Field>
                  </div>
                </div>
                <label className="mt-4 flex items-start gap-2 text-xs font-semibold leading-5 text-[#5c4a38]">
                  <input type="checkbox" className="mt-1" checked={form.privacy_consent} onChange={(e) => set("privacy_consent", e.target.checked)} />
                  등록 검수 및 연락을 위해 담당자 연락처·이메일을 수집·이용하는 데 동의합니다. *
                </label>
                <input aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={(e) => set("website", e.target.value)} />
              </Section>

              {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#f0a850] to-[#c1762d] py-4 text-base font-black text-[#241a10] shadow-sm disabled:opacity-50"
              >
                {submitting ? "등록 신청 중..." : "공연 등록 신청"}
              </button>
            </form>

            <aside className="h-fit rounded-3xl border border-[#eadfce] bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-sm font-black text-[#241a10]">등록 전 확인</h2>
              <ol className="mt-4 space-y-4 text-xs leading-6 text-[#725f4d]">
                <li><b className="text-[#241a10]">1. 공연기간</b><br />전체 공연 시작일과 종료일을 입력합니다.</li>
                <li><b className="text-[#241a10]">2. 회차 입력</b><br />날짜와 시작시간을 회차별로 추가합니다.</li>
                <li><b className="text-[#241a10]">3. 좌석별 가격</b><br />VIP/R/S석 등 필요한 만큼 추가합니다.</li>
                <li><b className="text-[#241a10]">4. SHOWDAY 검수</b><br />승인된 공연만 서비스에 공개됩니다.</li>
              </ol>
              <div className="mt-5 rounded-2xl bg-[#fff6e9] p-4 text-xs leading-6 text-[#725f4d]">
                담당자 연락처와 이메일은 검수 용도로만 사용하며 일반 사용자 화면에는 노출하지 않습니다.
              </div>
            </aside>
          </div>
        </section>
        <style>{`.input{width:100%;border:1px solid #dfd2bf;border-radius:12px;padding:11px 13px;font-size:14px;background:white;outline:none}.input:focus{border-color:#c1762d;box-shadow:0 0 0 3px rgba(193,118,45,.10)}`}</style>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#5c4a38]">{label}<div className="mt-1.5">{children}</div></label>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-[#f0e6d6] py-6 first:pt-0 last:border-b-0"><h2 className="mb-4 text-sm font-black text-[#241a10]">{title}</h2>{children}</section>;
}
