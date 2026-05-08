import { SessionUser } from "@/lib/auth";
import { DesktopAdminNavigation, MobileAdminNavigation } from "@/components/admin/AdminNavigation";
import Link from "next/link";

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const roleLabel = user.role === "OWNER" ? "Владелец" : "Оператор";

  return (
    <div className="admin-shell min-h-screen bg-[#f4efe4]">
      <DesktopAdminNavigation user={user} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur lg:px-8 lg:py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <MobileAdminNavigation user={user} />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-pak-red">{roleLabel}</p>
                <h1 className="truncate text-xl font-black leading-tight sm:text-2xl">Панель управления</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/" className="pressable rounded-full bg-pak-cream px-3 py-2 text-xs font-black text-pak-greenDark hover:bg-pak-yellow sm:text-sm">
                На сайт
              </Link>
              <div className="hidden items-center gap-2 rounded-full bg-pak-cream px-3 py-2 text-sm font-bold text-black/60 sm:flex">
                <img src="/logo.svg" alt="Pak Sushi" className="h-7 w-7 rounded-full" />
                Pak Sushi Saryagash
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
