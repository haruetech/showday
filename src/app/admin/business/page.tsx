"use client";
import { useEffect, useState } from "react";

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "business_name", label: "상호명", placeholder: "예: ㈜미니멈" },
  { key: "ceo_name", label: "대표자", placeholder: "대표자명" },
  { key: "business_reg_no", label: "사업자등록번호", placeholder: "000-00-00000" },
  { key: "mail_order_no", label: "통신판매업신고번호", placeholder: "제0000-서울OO-00000호" },
  { key: "address", label: "사업장 주소", placeholder: "주소" },
  { key: "support_contact", label: "고객센터 (이메일 또는 전화번호)", placeholder: "예: help@showday.kr" },
];

export default function AdminBusiness() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setValues(d)).finally(() => setLoading(false));
  }, []);

  const update = (key: string, v: string) => { setValues((prev) => ({ ...prev, [key]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    const payload = Object.fromEntries(FIELDS.map((f) => [f.key, values[f.key] || ""]));
    const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) setSaved(true);
  };

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
          {saved && <span className="text-xs font-bold text-[#4f7d63]">저장되었습니다. 하단 화면에 바로 반영됩니다.</span>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        <h2 className="text-sm font-black">미리보기</h2>
        <div className="mt-3 rounded-xl border border-dashed border-[#e7dcc9] p-4 text-xs leading-6 text-[#5c4a38]">
          <p>
            상호명 {values.business_name || "[ 미입력 ]"} · 대표 {values.ceo_name || "[ 미입력 ]"} · 사업자등록번호 {values.business_reg_no || "[ 미입력 ]"}
          </p>
          <p>통신판매업신고 {values.mail_order_no || "[ 미입력 ]"} · 주소 {values.address || "[ 미입력 ]"}</p>
          <p>고객센터 {values.support_contact || "[ 미입력 ]"}</p>
        </div>
      </div>
    </div>
  );
}
