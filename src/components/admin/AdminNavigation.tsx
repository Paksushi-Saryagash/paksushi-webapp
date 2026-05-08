"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, ClipboardList, Clock3, Gauge, Menu, Settings, Shield, Users, Utensils, X } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { SessionUser } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Обзор", icon: Gauge, ownerOnly: true, exact: true },
  { href: "/admin/orders", label: "Прием заказов", icon: ClipboardList, operatorOnly: true, exact: true },
  { href: "/admin/orders/history", label: "История", icon: CalendarDays },
  { href: "/admin/visits", label: "Смены и входы", icon: Clock3, ownerOnly: true },
  { href: "/admin/menu", label: "Меню", icon: Utensils, ownerOnly: true },
  { href: "/admin/set-rules", label: "Сеты", icon: Settings, ownerOnly: true },
  { href: "/admin/users", label: "Сотрудники", icon: Users, ownerOnly: true },
  { href: "/admin/audit", label: "Журнал", icon: Shield, ownerOnly: true }
];

function getVisibleNav(role: SessionUser["role"]) {
  return nav.filter((item) => (!item.ownerOnly || role === "OWNER") && (!item.operatorOnly || role === "OPERATOR"));
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const roleLabel = user.role === "OWNER" ? "Владелец" : "Оператор";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="rounded-[8px] bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Pak Sushi" className="h-14 w-14 shrink-0 rounded-full shadow-sm" />
          <div className="min-w-0">
            <div className="text-2xl font-black leading-none text-pak-yellow">Pak Sushi</div>
            <p className="mt-1 truncate text-sm text-white/60">{user.name}</p>
          </div>
        </div>
        <span className="mt-4 inline-flex rounded-full bg-pak-yellow px-3 py-1 text-xs font-black uppercase text-pak-ink">{roleLabel}</span>
      </div>

      <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-2">
          {getVisibleNav(user.role).map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`pressable flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold ${
                  active ? "bg-pak-yellow text-pak-ink shadow-glow" : "text-white/78 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-3 border-t border-white/10 pt-3">
        <LogoutButton />
      </div>
    </div>
  );
}

export function DesktopAdminNavigation({ user }: { user: SessionUser }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#14100d] p-5 text-white lg:block">
      <NavContent user={user} />
    </aside>
  );
}

export function MobileAdminNavigation({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="pressable grid h-11 w-11 place-items-center rounded-[8px] bg-pak-ink text-white lg:hidden"
        aria-label="Открыть меню"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} aria-label="Закрыть меню" />
          <aside className="absolute left-3 top-3 flex h-[calc(100dvh-24px)] w-[min(320px,calc(100vw-24px))] flex-col rounded-[8px] bg-[#14100d] p-4 text-white shadow-soft">
            <div className="mb-3 flex shrink-0 justify-end">
              <button onClick={() => setIsOpen(false)} className="pressable grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <NavContent user={user} onNavigate={() => setIsOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
