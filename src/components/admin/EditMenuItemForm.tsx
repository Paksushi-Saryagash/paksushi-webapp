"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  imageUrl: string | null;
  sellingPrice: number;
  costPrice: number;
  setBuilderPrice: number;
  weight: string | null;
  ingredients: string | null;
  isAvailable: boolean;
  isActive: boolean;
  isSetBuilderEnabled: boolean;
};

export function EditMenuItemForm({ item, categories }: { item: MenuItem; categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description") || null,
        categoryId: form.get("categoryId"),
        imageUrl: form.get("imageUrl") || null,
        sellingPrice: Number(form.get("sellingPrice") || 0),
        costPrice: Number(form.get("costPrice") || 0),
        setBuilderPrice: Number(form.get("setBuilderPrice") || 0),
        weight: form.get("weight") || null,
        ingredients: form.get("ingredients") || null,
        isAvailable: form.get("isAvailable") === "on",
        isActive: form.get("isActive") === "on",
        isSetBuilderEnabled: form.get("isSetBuilderEnabled") === "on"
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Не удалось сохранить блюдо");
      return;
    }

    router.push("/admin/menu");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" required defaultValue={item.name} className="rounded-[8px] border border-black/15 px-3 py-2" />
          <select name="categoryId" defaultValue={item.categoryId} className="rounded-[8px] border border-black/15 px-3 py-2">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input name="description" defaultValue={item.description ?? ""} placeholder="Описание" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <input name="ingredients" defaultValue={item.ingredients ?? ""} placeholder="Состав" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <input name="weight" defaultValue={item.weight ?? ""} placeholder="Вес / порция" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="URL изображения"
            className="rounded-[8px] border border-black/15 px-3 py-2"
          />
        </div>

        <div className="rounded-[8px] border border-black/10 bg-pak-cream p-3">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} className="aspect-[4/3] w-full rounded-[8px] object-cover" />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-[8px] bg-white text-sm font-bold text-black/40">
              Нет фото
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold">
          Обычная цена
          <input name="sellingPrice" type="number" min={0} defaultValue={item.sellingPrice} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Себестоимость
          <input name="costPrice" type="number" min={0} defaultValue={item.costPrice} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Цена для конструктора
          <input name="setBuilderPrice" type="number" min={0} defaultValue={item.setBuilderPrice} className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-bold">
        <label className="flex items-center gap-2">
          <input name="isAvailable" type="checkbox" defaultChecked={item.isAvailable} />
          В наличии
        </label>
        <label className="flex items-center gap-2">
          <input name="isSetBuilderEnabled" type="checkbox" defaultChecked={item.isSetBuilderEnabled} />
          Показывать в “Собери сет”
        </label>
        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={item.isActive} />
          Активно на сайте
        </label>
      </div>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button className="pressable w-fit rounded-[8px] bg-pak-green px-4 py-2 font-bold text-white shadow-glow">Сохранить</button>
    </form>
  );
}
