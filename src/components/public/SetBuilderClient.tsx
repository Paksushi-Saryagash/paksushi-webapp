"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Send, Sparkles, X } from "lucide-react";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { Price } from "@/components/shared/Price";

type SetItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  weight: string | null;
};

type SetCategory = {
  id: string;
  name: string;
  slug: string;
  items: SetItem[];
};

type Quote = {
  total: number;
  normalTotal: number;
  itemCount: number;
  mode: "custom_set" | "regular";
};

export function SetBuilderClient({ categories }: { categories: SetCategory[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<SetItem | null>(null);
  const [details, setDetails] = useState<SetItem | null>(null);

  const items = useMemo(() => categories.flatMap((category) => category.items), [categories]);
  const activeCategory = categories.find((category) => category.slug === activeSlug) ?? categories[0];
  const selected = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
    [quantities]
  );
  const selectedForWhatsApp = selected.map((line) => {
    const item = items.find((menuItem) => menuItem.id === line.menuItemId);
    return {
      name: item?.name ?? "Позиция",
      quantity: line.quantity,
      price: quote ? Math.round(quote.total / Math.max(quote.itemCount, 1)) : 0
    };
  });
  const isSetUnlocked = quote?.mode === "custom_set" && quote.normalTotal > quote.total;

  async function refreshQuote(nextQuantities: Record<string, number>) {
    const nextSelected = Object.entries(nextQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    if (nextSelected.length === 0) {
      setQuote(null);
      return;
    }

    const response = await fetch("/api/set-builder/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextSelected })
    });
    const data = await response.json();
    setQuote(data);
  }

  function change(id: string, delta: number) {
    const next = {
      ...quantities,
      [id]: Math.max(0, (quantities[id] ?? 0) + delta)
    };
    setQuantities(next);
    void refreshQuote(next);
  }

  async function sendToWhatsApp() {
    if (!quote || selected.length === 0 || isSubmitting) return;

    const customerName = window.prompt("Напишите ваше имя, чтобы оператор не перепутал заказ");
    if (!customerName?.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          orderType: "CUSTOM_SET",
          items: selected
        })
      });
      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Не удалось создать заявку");
        return;
      }

      const url = buildWhatsAppOrderUrl(selectedForWhatsApp, data.order.totalRevenue ?? quote.total, undefined, {
        customerName: customerName.trim(),
        orderNumber: data.order.orderNumber,
        title: "Здравствуйте! Хочу собрать сет Pak Sushi:",
        showLinePrices: false
      });
      window.location.href = url;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pb-32 pt-4 sm:px-4 sm:pt-8">
      <section className="relative overflow-hidden rounded-[8px] bg-pak-yellow px-5 py-7 shadow-soft md:px-8">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-pak-green/20" />
        <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/35" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase text-pak-greenDark">Конструктор Pak Sushi</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">Собери свой сет</h1>
          <p className="mt-3 text-base font-semibold text-black/70 sm:text-lg">
            Выберите любимые позиции, а сайт сам покажет итоговую цену для заказа в WhatsApp.
          </p>
        </div>
      </section>

      {categories.length > 0 ? (
        <>
          <div className="sticky top-[61px] z-20 -mx-3 mt-6 overflow-auto border-y border-yellow-900/10 bg-pak-cream/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 sm:py-3 md:top-[73px]">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveSlug(category.slug)}
                  className={`pressable whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${
                    activeSlug === category.slug ? "bg-pak-green text-white shadow-glow" : "bg-white text-pak-ink hover:bg-pak-yellow"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-xl font-black sm:text-2xl">{activeCategory?.name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {activeCategory?.items.map((item) => {
                const quantity = quantities[item.id] ?? 0;
                return (
                  <article
                    key={item.id}
                    onClick={() => setDetails(item)}
                    className={`pressable flex min-h-full cursor-pointer flex-col overflow-hidden rounded-[8px] border bg-white shadow-sm ${
                      quantity > 0 ? "border-pak-green shadow-glow" : "border-yellow-900/10"
                    }`}
                  >
                    {item.imageUrl ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setImagePreview(item);
                        }}
                        className="block w-full overflow-hidden bg-pak-cream"
                        aria-label={`Открыть фото ${item.name}`}
                      >
                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="aspect-[1.05/1] w-full object-cover transition duration-200 hover:scale-[1.03] sm:aspect-[4/3]" />
                      </button>
                    ) : (
                      <div className="grid aspect-[1.05/1] place-items-center bg-gradient-to-br from-pak-yellow/70 to-pak-green/15 text-sm font-black text-pak-greenDark sm:aspect-[4/3]">
                        Pak Sushi
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <h3 className="line-clamp-2 text-[15px] font-black leading-tight sm:text-lg">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/60 sm:text-sm">{item.description}</p>
                      {item.weight && <p className="mt-2 hidden text-xs font-bold uppercase text-black/45 sm:block">{item.weight}</p>}
                      <div className="mt-auto flex items-center justify-between gap-1 pt-3">
                        <span className={quantity > 0 ? "text-xs font-black text-pak-green sm:text-sm" : "text-xs font-bold text-black/45 sm:text-sm"}>
                          {quantity > 0 ? "В наборе" : "Выберите"}
                        </span>
                        <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => change(item.id, -1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-cream sm:h-10 sm:w-10">
                            <Minus size={15} />
                          </button>
                          <strong className="w-5 text-center text-sm sm:w-7 sm:text-lg">{quantity}</strong>
                          <button type="button" onClick={() => change(item.id, 1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-green text-white shadow-glow sm:h-10 sm:w-10">
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-8 rounded-[8px] border border-yellow-900/10 bg-white p-8 text-center">
          <h2 className="text-2xl font-black">Конструктор скоро появится</h2>
          <p className="mt-2 text-black/60">Позиции для “Собери сет” сейчас добавляются.</p>
        </section>
      )}

      {quote && quote.itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-yellow-900/10 bg-white/95 p-3 shadow-soft backdrop-blur">
          <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[8px] px-3 py-2 ${isSetUnlocked ? "set-unlocked bg-pak-yellow" : ""}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase text-black/50">{quote.itemCount} позиций</p>
                {isSetUnlocked && (
                  <span className="sparkle-badge inline-flex items-center gap-1 rounded-full bg-pak-green px-3 py-1 text-xs font-black text-white">
                    <Sparkles size={13} />
                    Сет собран
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-end gap-3">
                {isSetUnlocked && <Price value={quote.normalTotal} className="pb-1 text-sm font-bold text-black/45 line-through" />}
                <Price value={quote.total} className="price-pop text-2xl font-black text-pak-greenDark" />
              </div>
            </div>
            <button onClick={sendToWhatsApp} className="pressable inline-flex items-center gap-2 rounded-full bg-pak-green px-5 py-3 font-black text-white shadow-glow disabled:opacity-60" disabled={isSubmitting}>
              <Send size={18} />
              {isSubmitting ? "Создаем..." : "WhatsApp"}
            </button>
          </div>
        </div>
      )}

      <ImagePreview item={imagePreview} onClose={() => setImagePreview(null)} />
      <SetDetails item={details} onClose={() => setDetails(null)} onAdd={(item) => change(item.id, 1)} />
    </main>
  );
}

function ImagePreview({ item, onClose }: { item: SetItem | null; onClose: () => void }) {
  if (!item?.imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <button className="pressable absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-pak-ink" onClick={onClose} aria-label="Закрыть">
        <X size={20} />
      </button>
      <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="max-h-[90vh] max-w-[94vw] rounded-[8px] object-contain shadow-soft" onClick={(event) => event.stopPropagation()} />
    </div>
  );
}

function SetDetails({ item, onClose, onAdd }: { item: SetItem | null; onClose: () => void; onAdd: (item: SetItem) => void }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-3 sm:p-4" onClick={onClose}>
      <article className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[8px] bg-white shadow-soft" onClick={(event) => event.stopPropagation()}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="aspect-[16/11] w-full object-cover sm:aspect-[16/10]" />}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">{item.name}</h2>
              {item.weight && <p className="mt-1 text-sm font-bold uppercase text-black/45">{item.weight}</p>}
            </div>
            <button className="pressable grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pak-cream" onClick={onClose} aria-label="Закрыть">
              <X size={18} />
            </button>
          </div>
          {item.description && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-black/65">{item.description}</p>}
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => {
                onAdd(item);
                onClose();
              }}
              className="pressable rounded-full bg-pak-green px-5 py-3 font-black text-white shadow-glow"
            >
              Добавить в сет
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
