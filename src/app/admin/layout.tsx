import { isAdminAuthed } from "@/lib/adminAuth";
import AdminLoginForm from "./AdminLoginForm";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();
  if (!authed) return <AdminLoginForm />;

  return (
    <div className="min-h-screen bg-[#f7f0e4] text-[#241a10]">
      <header className="border-b border-[#e7dcc9] bg-[#1c130b]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#e8a353] to-[#b3742f] text-sm font-black text-[#1c130b]">S</div>
            <div>
              <p className="text-sm font-black tracking-tight text-white">SHOWDAY</p>
              <p className="text-[10px] font-semibold tracking-[.2em] text-[#c9a877]">ADMIN CONSOLE</p>
            </div>
          </div>
          <p className="hidden text-xs font-medium text-[#c9a877] sm:block">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1240px] gap-8 px-6 py-8">
        <AdminNav />
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
