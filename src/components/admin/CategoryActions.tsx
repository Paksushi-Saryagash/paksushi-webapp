"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function CategoryActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive })
    });
    router.refresh();
  }

  async function remove() {
    const confirmed = window.confirm("Удалить категорию? Позиции внутри этой категории тоже будут скрыты с сайта.");
    if (!confirmed) return;

    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/categories/${id}`} className="rounded-[8px] bg-pak-red px-3 py-2 text-xs font-bold text-white">
        Редактировать
      </Link>
      <button onClick={toggle} className="rounded-[8px] bg-pak-cream px-3 py-2 text-xs font-bold">
        {isActive ? "Отключить" : "Включить"}
      </button>
      <button onClick={remove} className="rounded-[8px] bg-red-50 px-3 py-2 text-xs font-bold text-pak-red">
        Удалить
      </button>
    </div>
  );
}
