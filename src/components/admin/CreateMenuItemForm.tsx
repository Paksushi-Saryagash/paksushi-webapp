"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export function CreateMenuItemForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (categories.length === 0) {
      setError("Сначала добавьте хотя бы одну категорию");
      return;
    }

    const form = new FormData(event.currentTarget);

    const payload = {
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
      isActive: true,
      isSetBuilderEnabled: form.get("isSetBuilderEnabled") === "on"
    };

    const response = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Блюдо не создано");
      return;
    }

    event.currentTarget.reset();
    setImageUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] bg-white p-5">
      <div>
        <h2 className="text-lg font-black">Добавить блюдо</h2>
        <p className="mt-1 text-sm text-black/55">
          Вставьте URL картинки со старого сайта. Фото сразу появится в предпросмотре.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Название" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <select name="categoryId" required className="rounded-[8px] border border-black/15 px-3 py-2" disabled={categories.length === 0}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input name="description" placeholder="Описание" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <input name="ingredients" placeholder="Состав" className="rounded-[8px] border border-black/15 px-3 py-2" />
          <input name="weight" placeholder="Вес / порция, например 8 шт" className="rounded-[8px] border border-black/15 px-3 py-2" />
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
            <img src={imageUrl} alt="Предпросмотр" className="aspect-[4/3] w-full rounded-[8px] object-cover" />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-[8px] bg-white text-sm font-bold text-black/40">
              Предпросмотр фото
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold">
          Обычная цена
          <input name="sellingPrice" type="number" min={0} required className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Себестоимость
          <input name="costPrice" type="number" min={0} required className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Цена для конструктора
          <input name="setBuilderPrice" type="number" min={0} required className="rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
        </label>
      </div>

      <div className="rounded-[8px] bg-pak-cream p-3 text-sm text-black/65">
        Обычная цена видна клиенту. Себестоимость нужна для прибыли. Цена для конструктора используется только внутри “Собери сет” и клиенту не раскрывается.
      </div>

      <div className="flex flex-wrap gap-4 text-sm font-bold">
        <label className="flex items-center gap-2">
          <input name="isAvailable" type="checkbox" defaultChecked />
          В наличии
        </label>
        <label className="flex items-center gap-2">
          <input name="isSetBuilderEnabled" type="checkbox" />
          Показывать в “Собери сет”
        </label>
      </div>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button className="pressable w-fit rounded-[8px] bg-pak-green px-4 py-2 font-bold text-white shadow-glow">Добавить блюдо</button>
    </form>
  );
}
