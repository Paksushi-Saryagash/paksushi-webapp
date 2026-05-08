"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { formatTenge } from "@/lib/money";

type MenuItem = {
  id: string;
  name: string;
  sellingPrice: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

type OrderLine = {
  menuItemId: string;
  quantity: number;
};

export function CreateOrderForm({ menuItems }: { menuItems: MenuItem[] }) {
  const router = useRouter();
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [source, setSource] = useState("WHATSAPP");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((item) => map.set(item.category.id, item.category.name));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory = categoryId === "all" || item.category.id === categoryId;
      const matchesSearch = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [categoryId, menuItems, query]);

  const estimatedTotal = useMemo(() => {
    return lines.reduce((total, line) => {
      const item = menuItems.find((menuItem) => menuItem.id === line.menuItemId);
      return total + (item?.sellingPrice ?? 0) * line.quantity;
    }, 0);
  }, [lines, menuItems]);

  const selectedLines = lines
    .map((line) => ({ ...line, item: menuItems.find((item) => item.id === line.menuItemId) }))
    .filter((line): line is OrderLine & { item: MenuItem } => Boolean(line.item));

  function quantityOf(id: string) {
    return lines.find((line) => line.menuItemId === id)?.quantity ?? 0;
  }

  function changeItem(id: string, delta: number) {
    setLines((current) => {
      const existing = current.find((line) => line.menuItemId === id);
      if (!existing && delta > 0) return [...current, { menuItemId: id, quantity: 1 }];
      if (!existing) return current;

      const nextQuantity = existing.quantity + delta;
      if (nextQuantity <= 0) return current.filter((line) => line.menuItemId !== id);
      return current.map((line) => (line.menuItemId === id ? { ...line, quantity: nextQuantity } : line));
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const orderItems = lines.filter((line) => line.menuItemId && line.quantity > 0);
    if (orderItems.length === 0) {
      setError("Добавьте хотя бы одну позицию в заказ");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          source,
          items: orderItems
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Заказ не создан");
        return;
      }

      setLines([]);
      setCustomerName("");
      setCustomerPhone("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (menuItems.length === 0) {
    return (
      <section className="rounded-[8px] bg-white p-5">
        <h2 className="text-lg font-black">Добавить заказ вручную</h2>
        <p className="mt-2 text-black/60">Сначала добавьте позиции меню.</p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[8px] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">Добавить заказ</h2>
          <p className="mt-1 text-sm text-black/55">Нажмите на карточку блюда или на плюс, чтобы добавить позицию.</p>
        </div>
        <div className="rounded-[8px] bg-pak-cream px-4 py-2 text-right">
          <p className="text-xs font-bold uppercase text-black/45">Итого</p>
          <strong>{formatTenge(estimatedTotal)}</strong>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Имя клиента" className="rounded-[8px] border border-black/15 px-3 py-2" />
        <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Телефон" className="rounded-[8px] border border-black/15 px-3 py-2" />
        <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-[8px] border border-black/15 px-3 py-2">
          <option value="WHATSAPP">WhatsApp</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="PHONE">Звонок</option>
          <option value="WALK_IN">На месте</option>
          <option value="OTHER">Другое</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/35" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск блюда" className="w-full rounded-[8px] border border-black/15 py-2 pl-10 pr-3" />
            </label>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-[8px] border border-black/15 px-3 py-2">
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid max-h-[520px] gap-3 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const quantity = quantityOf(item.id);
              return (
                <article
                  key={item.id}
                  onClick={() => changeItem(item.id, 1)}
                  className={`pressable cursor-pointer rounded-[8px] border bg-white p-3 shadow-sm ${
                    quantity > 0 ? "border-pak-green ring-2 ring-pak-green/20" : "border-black/10"
                  }`}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full rounded-[8px] object-cover" />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center rounded-[8px] bg-pak-cream text-xs font-bold text-black/35">
                      Pak Sushi
                    </div>
                  )}
                  <h3 className="mt-3 min-h-10 font-black">{item.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <strong className="text-pak-greenDark">{formatTenge(item.sellingPrice)}</strong>
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <button type="button" onClick={() => changeItem(item.id, -1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-cream">
                        <Minus size={15} />
                      </button>
                      <span className="w-6 text-center font-black">{quantity}</span>
                      <button type="button" onClick={() => changeItem(item.id, 1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-green text-white">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[8px] border border-black/10 bg-pak-cream p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black">Текущий заказ</h3>
            {selectedLines.length > 0 && (
              <button type="button" onClick={() => setLines([])} className="pressable inline-flex items-center gap-1 text-sm font-bold text-pak-red">
                <Trash2 size={15} />
                Очистить
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {selectedLines.length > 0 ? (
              selectedLines.map((line) => (
                <div key={line.menuItemId} className="rounded-[8px] bg-white p-3">
                  <div className="flex justify-between gap-3">
                    <strong>{line.item.name}</strong>
                    <span>{formatTenge(line.item.sellingPrice * line.quantity)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-black/50">{formatTenge(line.item.sellingPrice)} за шт</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => changeItem(line.menuItemId, -1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-cream">
                        <Minus size={15} />
                      </button>
                      <strong className="w-6 text-center">{line.quantity}</strong>
                      <button type="button" onClick={() => changeItem(line.menuItemId, 1)} className="pressable grid h-8 w-8 place-items-center rounded-full bg-pak-green text-white">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[8px] bg-white p-4 text-sm text-black/55">Выберите позиции слева.</p>
            )}
          </div>

          <div className="mt-4 rounded-[8px] bg-white p-4">
            <p className="text-xs font-bold uppercase text-black/45">Итого к оплате</p>
            <div className="mt-1 text-2xl font-black">{formatTenge(estimatedTotal)}</div>
          </div>
        </aside>
      </div>

      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button disabled={isSubmitting} className="pressable w-fit rounded-[8px] bg-pak-green px-5 py-3 font-bold text-white shadow-glow disabled:opacity-60">
        {isSubmitting ? "Создаем..." : "Создать заказ"}
      </button>
    </form>
  );
}
