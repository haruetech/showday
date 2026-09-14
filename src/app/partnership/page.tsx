"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type InquiryType = "제휴" | "광고" | "기타";

type FormState = {
  inquiry_type: InquiryType;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  message: string;
  privacy_consent: boolean;
  website: string; // honeypot
};

const initialForm: FormState = {
  inquiry_type: "제휴",
  company_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  message: "",
  privacy_consent: false,
  website: "",
};

const inquiryTypes: InquiryType[] = ["제휴", "광고", "기타"];

export default function PartnershipPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.company_name.trim() || !form.contact_name.trim() || !form.contact_email.trim() || !form.message.trim()) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.contact_email.trim())) {
      setError("이메일 주소를 확인해주세요.");
      return;
    }
    if (!form.privacy_consent) {
      setError("개인정보 수집·이용 동의가 필요합니다.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/partnership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "문의 접수에 실패했습니다.");
      return;
    }

    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <>
        <Header />
        <main className="mx-auto min-h-[60vh] max-w-2xl px-5 py-16 sm:py-24">
          <div className="rounded-3xl border border-[#eadfce] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff0dc] text-2xl">✓</div>
            <h1 className="mt-5 text-2xl font-black text-[#241a10]">문의가 접수되었습니다.</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#725f4d]">
              SHOWDAY 운영팀이 내용을 확인한 후, 입력하신 이메일 또는 연락처로 순차적으로 회신드립니다.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => { setForm(initialForm); setDone(false); }}
                className="rounded-xl border border-[#dfd2bf] px-5 py-3 text-sm font-bold text-[#5c4a38]"
              >
                다른 문의 남기기
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
        <section className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
          <p className="text-xs font-black tracking-[0.18em] text-[#b3742f]">PARTNERSHIP</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#241a10] sm:text-4xl">제휴·광고 문의</h1>
          <p className="mt-4 text-sm leading-7 text-[#725f4d]">
            공연장·티켓 플랫폼·브랜드 제휴, 지면·배너 광고 등 SHOWDAY와의 협업을 원하시면 아래 내용을 남겨주세요.
            회원가입 없이 접수되며, 확인 후 회신드립니다.
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-4 rounded-3xl border border-[#eadfce] bg-white p-5 shadow-sm sm:p-8">
            <input
              type="text"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
              문의 유형
              <div className="flex flex-wrap gap-2">
                {inquiryTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("inquiry_type", t)}
                    className={`min-h-11 rounded-xl border px-4 text-sm font-bold transition ${
                      form.inquiry_type === t
                        ? "border-[#c77b46] bg-[#fff0e3] text-[#b96730]"
                        : "border-[#e7dcc9] bg-white text-[#5c4a38]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </label>

            <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
              회사·단체명 <span className="font-normal text-[#9c8a7d]">(필수)</span>
              <input
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="예: (주)OOO"
                className="min-h-12 w-full rounded-xl border border-[#e7dcc9] px-3 text-base font-semibold text-[#241a10]"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
              담당자명 <span className="font-normal text-[#9c8a7d]">(필수)</span>
              <input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                className="min-h-12 w-full rounded-xl border border-[#e7dcc9] px-3 text-base font-semibold text-[#241a10]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
                이메일 <span className="font-normal text-[#9c8a7d]">(필수)</span>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="name@company.com"
                  className="min-h-12 w-full rounded-xl border border-[#e7dcc9] px-3 text-base font-semibold text-[#241a10]"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
                연락처 <span className="font-normal text-[#9c8a7d]">(선택)</span>
                <input
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="010-0000-0000"
                  className="min-h-12 w-full rounded-xl border border-[#e7dcc9] px-3 text-base font-semibold text-[#241a10]"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-black text-[#5c4a38]">
              문의 내용 <span className="font-normal text-[#9c8a7d]">(필수)</span>
              <textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                rows={6}
                placeholder="제휴·광고 관련 문의 내용을 자유롭게 남겨주세요."
                className="w-full rounded-xl border border-[#e7dcc9] px-3 py-2.5 text-sm text-[#241a10]"
              />
            </label>

            <label className="mt-1 flex items-start gap-2 text-xs leading-5 text-[#725f4d]">
              <input
                type="checkbox"
                checked={form.privacy_consent}
                onChange={(e) => set("privacy_consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              문의 처리를 위해 입력한 담당자명·이메일·연락처를 수집·이용하는 것에 동의합니다. (문의 답변 목적으로만 사용하며, 답변 완료 후 파기합니다.)
            </label>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 min-h-12 rounded-xl bg-[#241a10] px-5 text-sm font-black text-white disabled:opacity-50"
            >
              {submitting ? "접수 중..." : "문의 보내기"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
