"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: form.get("slug"),
        sortOrder: Number(form.get("sortOrder") || 0),
        isActive: form.get("isActive") === "on"
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Не удалось сохранить категорию");
      return;
    }

    router.push("/admin/menu");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] bg-white p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
        <label className="grid gap-1 text-sm font-bold">
          Название
          <input name="name" defaultValue={category.name} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Slug
          <input name="slug" defaultValue={category.slug} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Порядок
          <input name="sortOrder" type="number" defaultValue={category.sortOrder} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input name="isActive" type="checkbox" defaultChecked={category.isActive} />
        Активна на сайте
      </label>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button className="w-fit rounded-[8px] bg-pak-red px-4 py-2 font-bold text-white">Сохранить</button>
    </form>
  );
}
