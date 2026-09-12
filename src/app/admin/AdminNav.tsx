"use client";
import { usePathname, useRouter } from "next/navigation";
import { TrendIcon, TicketIcon, CalendarIcon, SparkIcon, BellIcon, PinIcon } from "@/components/common/Icons";

const items = [
  { href: "/admin", label: "운영 현황판", desc: "전체 지표 요약", icon: TrendIcon },
  { href: "/admin/shows", label: "공연 등록·관리", desc: "기획사 제출 검토", icon: CalendarIcon },
  { href: "/admin/popup", label: "공연 팝업", desc: "등록 공연 광고 팝업", icon: SparkIcon },
  { href: "/admin/notices", label: "홍보·공지 팝업", desc: "자유 형식 공지·이벤트", icon: BellIcon },
  { href: "/admin/channel", label: "채널 설정", desc: "카카오톡 채널 연결", icon: BellIcon },
  { href: "/admin/business", label: "사업자 정보", desc: "하단(Footer) 표시 정보", icon: PinIcon },
  { href: "/admin/clicks", label: "예매 클릭 통계", desc: "제휴 협상 근거자료", icon: TicketIcon },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <nav className="w-[240px] shrink-0">
      <div className="rounded-2xl border border-[#e7dcc9] bg-white p-3 shadow-[0_1px_2px_rgba(36,26,16,0.04)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-start gap-3 rounded-xl px-3.5 py-3 transition last:mb-0 ${
                active ? "bg-[#241a10] text-white shadow-sm" : "text-[#5c4a38] hover:bg-[#f7f0e4]"
              }`}
            >
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${active ? "bg-white/15 text-[#f0c88a]" : "bg-[#f7f0e4] text-[#b3742f]"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold">{item.label}</span>
                <span className={`block text-[11px] ${active ? "text-[#d8c3a4]" : "text-[#a1876a]"}`}>{item.desc}</span>
              </span>
            </a>
          );
        })}
      </div>
      <button onClick={logout} className="mt-4 w-full rounded-xl border border-[#e7dcc9] bg-white px-3.5 py-2.5 text-left text-xs font-bold text-[#a1876a] hover:text-[#241a10]">
        로그아웃
      </button>
    </nav>
  );
}
