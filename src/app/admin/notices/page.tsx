"use client";
import { useEffect, useState } from "react";

type Notice = {
  id: string; title: string; body: string; image_url: string; link_url: string; link_label: string;
  is_active: boolean; start_date: string | null; end_date: string | null; created_at: string;
};

const emptyForm = { title: "", body: "", image_url: "", link_url: "", link_label: "자세히 보기", is_active: false, start_date: "", end_date: "" };

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/notices").then((r) => r.json()).then((d) => {
      if (d.error) { setConfigError(true); return; }
      setNotices(d.notices || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); }, [toast]);

  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyForm); setError(""); };

  const startCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const startEdit = (n: Notice) => {
    setForm({
      title: n.title, body: n.body || "", image_url: n.image_url || "", link_url: n.link_url || "",
      link_label: n.link_label || "자세히 보기", is_active: n.is_active, start_date: n.start_date || "", end_date: n.end_date || "",
    });
    setEditingId(n.id);
    setModalOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "notices");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) { setError(data.error || "업로드에 실패했습니다."); return; }
    setForm((f) => ({ ...f, image_url: data.url }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const res = editingId
      ? await fetch(`/api/admin/notices/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch("/api/admin/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "저장에 실패했습니다."); return; }
    closeModal();
    setToast(editingId ? "공지가 수정되었습니다." : "공지가 등록되었습니다.");
    load();
  };

  const toggleActive = async (n: Notice) => {
    await fetch(`/api/admin/notices/${n.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !n.is_active }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("이 공지를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    load();
    setToast("삭제되었습니다.");
  };

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-[#241a10] to-[#3d2a17] p-7 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[.2em] text-[#e8a353]">MAIN SITE NOTICE</p>
            <h1 className="mt-2 text-2xl font-black">홍보·공지 팝업</h1>
            <p className="mt-1 text-sm text-[#d8c3a4]">특정 공연과 무관한 자유 형식의 공지·이벤트 팝업입니다. 켜져 있으면 &quot;공연 팝업&quot;보다 우선 노출됩니다.</p>
          </div>
          <button onClick={startCreate} className="shrink-0 rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] px-5 py-3 text-sm font-black text-[#1c130b]">
            + 새 공지 등록
          </button>
        </div>
      </div>

      {configError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
          SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다. Vercel 환경변수에 추가 후 재배포해주세요.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#e7dcc9] bg-white p-6 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        <h2 className="text-sm font-black">등록된 공지 ({notices.length})</h2>
        {loading ? (
          <p className="mt-4 text-xs text-[#8a7360]">불러오는 중입니다...</p>
        ) : notices.length === 0 ? (
          <p className="mt-4 text-xs text-[#8a7360]">아직 등록된 공지가 없습니다.</p>
        ) : (
          <div className="mt-4 divide-y divide-[#f0e6d6]">
            {notices.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#241a10]">
                    {n.title}
                    {n.is_active && <span className="ml-2 rounded-full bg-[#fff3e0] px-2 py-0.5 text-[10px] font-black text-[#b3742f]">노출중</span>}
                  </p>
                  <p className="text-xs text-[#8a7360]">
                    {n.start_date || n.end_date ? `${n.start_date || "제한없음"} ~ ${n.end_date || "제한없음"}` : "기간 제한 없음"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(n)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${n.is_active ? "border-[#b3742f] bg-[#fff3e0] text-[#b3742f]" : "border-[#e7dcc9] text-[#5c4a38]"}`}>
                    {n.is_active ? "끄기" : "켜기"}
                  </button>
                  <button onClick={() => startEdit(n)} className="rounded-lg border border-[#e7dcc9] px-2.5 py-1.5 text-xs font-bold text-[#5c4a38] hover:border-[#b3742f] hover:text-[#b3742f]">수정</button>
                  <button onClick={() => remove(n.id)} className="text-xs font-semibold text-red-500">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#241a10]">{editingId ? "공지 수정" : "새 공지 등록"}</h2>
              <button onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-full text-[#8a7360] hover:bg-[#f7f0e4]">✕</button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-xs font-semibold text-[#5c4a38]">
                제목 *
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input mt-1.5" />
              </label>
              <label className="block text-xs font-semibold text-[#5c4a38]">
                내용
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="admin-input mt-1.5" />
              </label>

              <div>
                <p className="text-xs font-semibold text-[#5c4a38]">이미지 (선택)</p>
                <div className="mt-1.5 flex items-start gap-3">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="h-20 w-32 shrink-0 rounded-lg border border-[#e7dcc9] object-cover" />
                  ) : (
                    <div className="grid h-20 w-32 shrink-0 place-items-center rounded-lg border border-dashed border-[#e7dcc9] text-[10px] text-[#a1876a]">미리보기</div>
                  )}
                  <div>
                    <label className="inline-block cursor-pointer rounded-lg border border-[#e7dcc9] px-3 py-2 text-xs font-bold text-[#5c4a38]">
                      {uploading ? "업로드 중..." : form.image_url ? "이미지 교체" : "이미지 선택"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                    </label>
                    {form.image_url && <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="ml-2 text-xs font-semibold text-red-500">제거</button>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5c4a38]">
                  링크 URL (선택)
                  <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." className="admin-input mt-1.5" />
                </label>
                <label className="block text-xs font-semibold text-[#5c4a38]">
                  버튼 문구
                  <input value={form.link_label} onChange={(e) => setForm({ ...form, link_label: e.target.value })} className="admin-input mt-1.5" />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5c4a38]">
                  시작일 (선택, 비우면 즉시)
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="admin-input mt-1.5" />
                </label>
                <label className="block text-xs font-semibold text-[#5c4a38]">
                  종료일 (선택, 비우면 무기한)
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="admin-input mt-1.5" />
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#5c4a38]">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
                저장 즉시 메인 화면에 노출 (다른 공지는 자동으로 꺼집니다)
              </label>

              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-[#e7dcc9] py-3 text-sm font-bold text-[#5c4a38]">취소</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] py-3 text-sm font-black text-[#1c130b] disabled:opacity-40">
                  {submitting ? "저장 중..." : editingId ? "수정 사항 저장" : "공지 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#241a10] px-5 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}

      <style>{`.admin-input{border:1px solid #e7dcc9;border-radius:8px;padding:10px 12px;font-size:13px;width:100%}`}</style>
    </div>
  );
}
