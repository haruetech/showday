"use client";
import { useEffect, useState } from "react";
import { DEFAULT_FIFTYPLUS_CARDS, type FiftyPlusCard } from "@/components/home/ParentsFiftyPlusSection";

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "business_name", label: "상호명", placeholder: "예: 하루애" },
  { key: "ceo_name", label: "대표자", placeholder: "대표자명" },
  { key: "business_reg_no", label: "사업자등록번호", placeholder: "000-00-00000" },
  { key: "mail_order_no", label: "통신판매업신고번호", placeholder: "제0000-서울OO-00000호" },
  { key: "address", label: "사업장 주소", placeholder: "주소" },
  { key: "support_contact", label: "고객센터 (이메일 또는 전화번호)", placeholder: "예: help@showday.kr" },
];

const POLICY_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "policy_effective_date", label: "이용약관·개인정보처리방침 시행일", placeholder: "예: 2026년 9월 14일" },
];

const ALL_TEXT_KEYS = [...FIELDS, ...POLICY_FIELDS];
const CARD_BADGES = ["WELLNESS", "BRAIN REST", "FOOT & WALK", "AI LIFE"];

function parseCards(raw: string | undefined): FiftyPlusCard[] {
  if (!raw) return DEFAULT_FIFTYPLUS_CARDS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_FIFTYPLUS_CARDS;
    return DEFAULT_FIFTYPLUS_CARDS.map((d, i) => ({ ...d, ...(parsed[i] || {}) }));
  } catch {
    return DEFAULT_FIFTYPLUS_CARDS;
  }
}

export default function AdminBusiness() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [cards, setCards] = useState<FiftyPlusCard[]>(DEFAULT_FIFTYPLUS_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setValues(d);
      setCards(parseCards(d.fiftyplus_cards));
    }).finally(() => setLoading(false));
  }, []);

  const update = (key: string, v: string) => { setValues((prev) => ({ ...prev, [key]: v })); setSaved(false); };
  const updateCard = (i: number, patch: Partial<FiftyPlusCard>) => {
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true); setError(""); setSaved(false);
    const payload: Record<string, string> = Object.fromEntries(ALL_TEXT_KEYS.map((f) => [f.key, values[f.key] || ""]));
    payload.fiftyplus_visible = values.fiftyplus_visible === "false" ? "false" : "true";
    payload.fiftyplus_cards = JSON.stringify(cards);
    const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) { setSaved(true); return; }
    setError(data.error || `저장에 실패했습니다. (상태 코드 ${res.status})`);
  };

  const fiftyplusVisible = values.fiftyplus_visible !== "false";

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">FOOTER</p>
        <h1 className="mt-2 text-2xl font-black">사업자 정보</h1>
        <p className="mt-1 text-sm text-[#d8c3a4]">메인 사이트 하단(Footer)에 표시되는 사업자 정보입니다. 전자상거래법상 표시 의무가 있는 항목이에요.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        {loading ? (
          <p className="text-xs text-[#8a7360]">불러오는 중입니다...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.key} className="block text-xs font-semibold text-[#5c4a38]">
                {f.label}
                <input
                  value={values[f.key] || ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1.5 w-full rounded-lg border border-[#e7dcc9] px-3 py-2.5 text-sm"
                />
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} disabled={saving || loading} className="rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] px-6 py-3 text-sm font-black text-[#1c130b] disabled:opacity-40">
            {saving ? "저장 중..." : "저장"}
          </button>
          {saved && <span className="text-xs font-bold text-[#4f7d63]">저장되었습니다. 사이트에 바로 반영됩니다.</span>}
          {error && <span className="text-xs font-bold text-red-600">{error}</span>}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#9a8b80]">이 버튼 하나로 아래 사업자 정보 · 약관 시행일 · 50+ LIFE 카드까지 한 번에 저장됩니다.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        <h2 className="text-sm font-black">미리보기 (Footer)</h2>
        <div className="mt-3 rounded-xl border border-dashed border-[#e7dcc9] p-4 text-xs leading-6 text-[#5c4a38]">
          <p>
            상호명 {values.business_name || "[ 미입력 ]"} · 대표 {values.ceo_name || "[ 미입력 ]"} · 사업자등록번호 {values.business_reg_no || "[ 미입력 ]"}
          </p>
          <p>통신판매업신고 {values.mail_order_no || "[ 미입력 ]"} · 주소 {values.address || "[ 미입력 ]"}</p>
          <p>고객센터 {values.support_contact || "[ 미입력 ]"}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        <h2 className="text-sm font-black">이용약관 · 개인정보처리방침</h2>
        <p className="mt-1 text-xs leading-5 text-[#8a7360]">
          위에서 입력한 상호명·대표자·고객센터 정보를 /terms, /privacy 페이지가 그대로 가져다 씁니다. 아래 시행일만 별도로 입력해주세요.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {POLICY_FIELDS.map((f) => (
            <label key={f.key} className="block text-xs font-semibold text-[#5c4a38]">
              {f.label}
              <input
                value={values[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1.5 w-full rounded-lg border border-[#e7dcc9] px-3 py-2.5 text-sm"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        <h2 className="text-sm font-black">홈 화면 노출 설정</h2>
        <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-[#e7dcc9] p-4">
          <div>
            <b className="text-sm text-[#241a10]">SHOWDAY 50+ LIFE 섹션 전체</b>
            <p className="mt-1 text-xs leading-5 text-[#8a7360]">전체 섹션을 통째로 껐다 켤 수 있습니다. 아래 카드별 설정과 별도로 동작해요 (둘 다 켜져 있어야 해당 카드가 보입니다).</p>
          </div>
          <button
            type="button"
            onClick={() => update("fiftyplus_visible", fiftyplusVisible ? "false" : "true")}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${fiftyplusVisible ? "bg-[#c77b46]" : "bg-[#e7dcc9]"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${fiftyplusVisible ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cards.map((card, i) => {
            const cardVisible = card.visible !== false;
            return (
              <div key={i} className="rounded-xl border border-[#e7dcc9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black tracking-[.1em] text-[#c77b46]">{CARD_BADGES[i]}</span>
                  <button
                    type="button"
                    onClick={() => updateCard(i, { visible: !cardVisible })}
                    className={`relative h-6 w-10 shrink-0 rounded-full transition ${cardVisible ? "bg-[#c77b46]" : "bg-[#e7dcc9]"}`}
                    aria-label={`${CARD_BADGES[i]} 카드 노출 여부`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${cardVisible ? "left-5" : "left-1"}`} />
                  </button>
                </div>
                <label className="mt-3 block text-xs font-semibold text-[#5c4a38]">
                  제목
                  <input
                    value={card.title}
                    onChange={(e) => updateCard(i, { title: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[#e7dcc9] px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-xs font-semibold text-[#5c4a38]">
                  설명
                  <textarea
                    value={card.desc}
                    onChange={(e) => updateCard(i, { desc: e.target.value })}
                    rows={2}
                    className="mt-1.5 w-full rounded-lg border border-[#e7dcc9] px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-xs font-semibold text-[#5c4a38]">
                  상태 문구 (비워두면 배지가 사라집니다)
                  <input
                    value={card.status}
                    onChange={(e) => updateCard(i, { status: e.target.value })}
                    placeholder="예: 콘텐츠 제작 중 / 지금 바로 듣기"
                    className="mt-1.5 w-full rounded-lg border border-[#e7dcc9] px-3 py-2 text-sm"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
