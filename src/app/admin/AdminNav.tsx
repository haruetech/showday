"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "운영 현황판" },
  { href: "/admin/shows", label: "공연 등록·관리" },
  { href: "/admin/clicks", label: "예매 클릭 통계" },
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
    <nav className="w-[200px] shrink-0">
      <p className="mb-1 text-[11px] font-bold tracking-[.16em] text-[#b3742f]">SHOWDAY</p>
      <p className="mb-6 text-lg font-black">관리자</p>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2.5 text-sm font-bold ${
              pathname === item.href ? "bg-[#2a1d12] text-white" : "text-[#5c4a38] hover:bg-[#f0e6d6]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className="mt-8 text-xs font-semibold text-[#a1876a] underline underline-offset-4">
        로그아웃
      </button>
    </nav>
  );
}
