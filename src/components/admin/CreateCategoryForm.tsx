"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const translit: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .split("")
    .map((char) => translit[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCategoryForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: form.get("slug"),
        sortOrder: Number(form.get("sortOrder") || 0),
        isActive: true
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Категория не создана");
      return;
    }

    event.currentTarget.reset();
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[8px] bg-white p-5">
      <h2 className="text-lg font-black">Добавить категорию</h2>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
        <input
          name="name"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSlug(slugify(event.target.value));
          }}
          placeholder="Название"
          className="rounded-[8px] border border-black/15 px-3 py-2"
        />
        <input
          name="slug"
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="slug, например sushi"
          className="rounded-[8px] border border-black/15 px-3 py-2"
        />
        <input name="sortOrder" type="number" placeholder="Порядок" className="rounded-[8px] border border-black/15 px-3 py-2" />
      </div>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button className="w-fit rounded-[8px] bg-pak-red px-4 py-2 font-bold text-white">Добавить</button>
    </form>
  );
}
