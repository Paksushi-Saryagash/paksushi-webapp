"use client";

import Link from "next/link";
import { Minus, Plus, Send, Trash2 } from "lucide-react";
import { Price } from "@/components/shared/Price";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { useCart } from "@/components/public/useCart";

export function CartClient() {
  const { lines, total, count, add, remove, clear } = useCart();
  const whatsAppUrl = buildWhatsAppOrderUrl(lines, total);

  if (count === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-black">Корзина</h1>
        <p className="mt-4 text-black/65">Пока пусто. Выберите блюда в меню, и они появятся здесь.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-pak-red px-5 py-3 font-bold text-white">
          Перейти в меню
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Корзина</h1>
          <p className="mt-2 text-black/60">{count} позиций</p>
        </div>
        <button onClick={clear} className="inline-flex items-center gap-2 rounded-[8px] bg-red-50 px-4 py-2 font-bold text-pak-red">
          <Trash2 size={16} />
          Очистить
        </button>
      </div>

      <div className="mt-8 grid gap-3">
        {lines.map((line) => (
          <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-white p-4">
            <div>
              <h2 className="font-black">{line.name}</h2>
              <Price value={line.price} className="text-sm text-black/55" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => remove(line.id)} className="grid h-9 w-9 place-items-center rounded-full bg-pak-cream">
                <Minus size={16} />
              </button>
              <strong className="w-8 text-center">{line.quantity}</strong>
              <button onClick={() => add({ id: line.id, name: line.name, sellingPrice: line.price })} className="grid h-9 w-9 place-items-center rounded-full bg-pak-red text-white">
                <Plus size={16} />
              </button>
              <Price value={line.price * line.quantity} className="w-28 text-right font-black text-pak-red" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-5">
        <div>
          <p className="text-sm font-bold uppercase text-black/45">Итого</p>
          <Price value={total} className="text-3xl font-black" />
        </div>
        <a href={whatsAppUrl} className="inline-flex items-center gap-2 rounded-full bg-pak-green px-5 py-3 font-bold text-white">
          <Send size={18} />
          Отправить в WhatsApp
        </a>
      </div>
    </main>
  );
}
