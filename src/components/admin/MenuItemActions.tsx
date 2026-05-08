"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function MenuItemActions({
  id,
  isAvailable,
  isSetBuilderEnabled
}: {
  id: string;
  isAvailable: boolean;
  isActive: boolean;
  isSetBuilderEnabled: boolean;
}) {
  const router = useRouter();

  async function patch(data: Record<string, boolean>) {
    await fetch(`/api/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    router.refresh();
  }

  async function remove() {
    const confirmed = window.confirm("Удалить позицию из меню? Старые заказы и чеки сохранятся.");
    if (!confirmed) return;

    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/menu/${id}`} className="rounded-[8px] bg-pak-red px-3 py-2 text-xs font-bold text-white">
        Редактировать
      </Link>
      <button onClick={() => patch({ isAvailable: !isAvailable })} className="rounded-[8px] bg-pak-cream px-3 py-2 text-xs font-bold">
        {isAvailable ? "Нет в наличии" : "В наличии"}
      </button>
      <button onClick={() => patch({ isSetBuilderEnabled: !isSetBuilderEnabled })} className="rounded-[8px] bg-pak-cream px-3 py-2 text-xs font-bold">
        {isSetBuilderEnabled ? "Убрать из сета" : "В сет"}
      </button>
      <button onClick={remove} className="rounded-[8px] bg-red-50 px-3 py-2 text-xs font-bold text-pak-red">
        Удалить
      </button>
    </div>
  );
}
