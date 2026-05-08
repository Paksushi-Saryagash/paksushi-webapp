"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Send, X } from "lucide-react";
import { Price } from "@/components/shared/Price";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { useCart } from "@/components/public/useCart";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sellingPrice: number;
  weight: string | null;
  isAvailable: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
};

export function MenuClient({ categories }: { categories: MenuCategory[] }) {
  const firstVisibleSlug = categories.find((category) => category.items.length > 0)?.slug ?? "";
  const [active, setActive] = useState(firstVisibleSlug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<MenuItem | null>(null);
  const [details, setDetails] = useState<MenuItem | null>(null);
  const { cart, lines, total, count, add, remove } = useCart();
  const visibleCategories = categories.filter((category) => category.items.length > 0);
  const activeCategories = visibleCategories.filter((category) => !active || category.slug === active);

  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some((category) => category.slug === active)) {
      setActive(visibleCategories[0].slug);
    }
  }, [active, visibleCategories]);

  async function sendToWhatsApp() {
    if (lines.length === 0 || isSubmitting) return;

    const customerName = window.prompt("Напишите ваше имя, чтобы оператор не перепутал заказ");
    if (!customerName?.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          orderType: "REGULAR",
          items: lines.map((line) => ({ menuItemId: line.id, quantity: line.quantity }))
        })
      });
      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Не удалось создать заявку");
        return;
      }

      const url = buildWhatsAppOrderUrl(lines, data.order.totalRevenue ?? total, undefined, {
        customerName: customerName.trim(),
        orderNumber: data.order.orderNumber
      });
      window.location.href = url;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-28 sm:px-4">
      <section className="hidden gap-8 py-8 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-black uppercase text-pak-green">Paksushi.Saryagash</p>
          <h1 className="mt-3 text-5xl font-black leading-tight">Свежие роллы, сеты и горячие блюда</h1>
          <p className="mt-4 max-w-xl text-lg font-semibold text-black/70">
            Выберите позиции, соберите корзину и отправьте заказ оператору через WhatsApp.
          </p>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-[8px] bg-pak-yellow p-6 text-pak-ink shadow-soft">
          <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-pak-green/25" />
          <div className="absolute bottom-5 right-8 h-28 w-28 rounded-full bg-white/35" />
          <div className="relative flex h-full flex-col justify-end">
            <span className="text-sm font-black uppercase text-pak-greenDark">Pak Sushi</span>
            <strong className="mt-2 text-4xl font-black">Сарыагаш</strong>
            <span className="mt-3 font-bold text-black/70">Сеты • Суши • Пицца • Закуски</span>
          </div>
        </div>
      </section>

      {visibleCategories.length > 0 ? (
        <>
          <div className="sticky top-[61px] z-20 -mx-3 overflow-auto border-y border-yellow-900/10 bg-pak-cream/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 sm:py-3 md:top-[73px]">
            <div className="flex gap-2">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActive(category.slug)}
                  className={`pressable whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${
                    active === category.slug ? "bg-pak-green text-white shadow-glow" : "bg-white text-pak-ink hover:bg-pak-yellow"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-7 sm:mt-6 sm:gap-8">
            {activeCategories.map((category) => (
              <section key={category.id}>
                <h2 className="mb-3 text-xl font-black sm:mb-4 sm:text-2xl">{category.name}</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {category.items.map((item) => {
                    const quantity = cart[item.id]?.quantity ?? 0;
                    return (
                      <article
                        key={item.id}
                        onClick={() => setDetails(item)}
                        className="pressable group flex min-h-full cursor-pointer flex-col overflow-hidden rounded-[8px] border border-yellow-900/10 bg-white shadow-sm"
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
                            <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="aspect-[1.05/1] w-full object-cover transition duration-200 group-hover:scale-[1.03] sm:aspect-[4/3]" />
                          </button>
                        ) : (
                          <div className="grid aspect-[1.05/1] place-items-center bg-gradient-to-br from-pak-yellow/70 to-pak-green/15 text-sm font-black text-pak-greenDark sm:aspect-[4/3]">
                            Pak Sushi
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-[15px] font-black leading-tight sm:text-lg">{item.name}</h3>
                            <Price value={item.sellingPrice} className="shrink-0 text-[14px] font-black text-pak-greenDark sm:text-base" />
                          </div>
                          <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-5 text-black/60 sm:min-h-10 sm:text-sm">{item.description}</p>
                          {item.weight && <p className="mt-2 hidden text-xs font-bold uppercase text-black/50 sm:block">{item.weight}</p>}
                          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                            <span className={item.isAvailable ? "text-xs font-bold text-pak-green sm:text-sm" : "text-xs text-black/40 sm:text-sm"}>
                              {item.isAvailable ? "В наличии" : "Нет"}
                            </span>
                            {quantity > 0 ? (
                              <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                                <button onClick={() => remove(item.id)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-cream sm:h-9 sm:w-9" aria-label="Убрать">
                                  <Minus size={15} />
                                </button>
                                <strong className="min-w-4 text-center text-sm sm:text-base">{quantity}</strong>
                                <button onClick={() => item.isAvailable && add(item)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-green text-white shadow-glow sm:h-9 sm:w-9" aria-label="Добавить">
                                  <Plus size={15} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  item.isAvailable && add(item);
                                }}
                                className="pressable rounded-full bg-pak-green px-3 py-2 text-xs font-black text-white shadow-glow disabled:bg-black/20 sm:px-4 sm:text-sm"
                                disabled={!item.isAvailable}
                              >
                                Добавить
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <section className="rounded-[8px] border border-yellow-900/10 bg-white p-8 text-center">
          <h2 className="text-2xl font-black">Меню скоро появится</h2>
          <p className="mt-2 text-black/60">Позиции ресторана сейчас добавляются.</p>
        </section>
      )}

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-yellow-900/10 bg-white/95 p-3 shadow-soft backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-black/50">{count} позиций</p>
              <Price value={total} className="text-xl font-black text-pak-greenDark" />
            </div>
            <button onClick={sendToWhatsApp} className="pressable inline-flex items-center gap-2 rounded-full bg-pak-green px-5 py-3 font-black text-white shadow-glow disabled:opacity-60" disabled={isSubmitting}>
              <Send size={18} />
              {isSubmitting ? "Создаем..." : "WhatsApp"}
            </button>
          </div>
        </div>
      )}

      <ImagePreview item={imagePreview} onClose={() => setImagePreview(null)} />
      <MenuDetails item={details} onClose={() => setDetails(null)} onAdd={(item) => add(item)} />
    </div>
  );
}

function ImagePreview({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
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

function MenuDetails({ item, onClose, onAdd }: { item: MenuItem | null; onClose: () => void; onAdd: (item: MenuItem) => void }) {
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
          <div className="mt-5 flex items-center justify-between gap-4">
            <Price value={item.sellingPrice} className="text-2xl font-black text-pak-greenDark" />
            <button
              onClick={() => {
                onAdd(item);
                onClose();
              }}
              disabled={!item.isAvailable}
              className="pressable rounded-full bg-pak-green px-5 py-3 font-black text-white shadow-glow disabled:bg-black/20"
            >
              Добавить
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
