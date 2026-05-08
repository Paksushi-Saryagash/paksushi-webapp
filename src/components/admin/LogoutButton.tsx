"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="pressable flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white">
      <LogOut size={18} />
      Выйти
    </button>
  );
}
