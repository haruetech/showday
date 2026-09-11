import { isAdminAuthed } from "@/lib/adminAuth";
import AdminLoginForm from "./AdminLoginForm";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();
  if (!authed) return <AdminLoginForm />;

  return (
    <div className="min-h-screen bg-[#faf5ec] text-[#2a1d12]">
      <div className="mx-auto flex max-w-[1200px] gap-8 px-6 py-8">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
