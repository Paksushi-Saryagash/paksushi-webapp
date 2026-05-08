"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import { Price } from "@/components/shared/Price";

type ShiftSummary = {
  orderCount: number;
  revenueTotal: number;
  refundTotal: number;
};

type Shift = {
  id: string;
  openedAt: string;
  startingCash: number;
};

export function ShiftPanel({ shift, summary }: { shift: Shift | null; summary: ShiftSummary | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function openShift() {
    const note = window.prompt("Комментарий к открытию смены, если нужно") ?? "";
    setIsLoading(true);
    try {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingNote: note, startingCash: 0 })
      });
      if (!response.ok) {
        const result = await response.json();
        window.alert(result.error ?? "Не удалось открыть смену");
        return;
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function closeShift() {
    const note = window.prompt("Короткий отчет по смене: были ли возвраты, проблемы, причины") ?? "";
    if (!window.confirm("Закрыть смену? После закрытия нужно будет открыть новую смену для приема заказов.")) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/shifts/current/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closingNote: note })
      });
      if (!response.ok) {
        const result = await response.json();
        window.alert(result.error ?? "Не удалось закрыть смену");
        return;
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (!shift) {
    return (
      <section className="rounded-[8px] border-2 border-pak-yellow bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-pak-red">Смена закрыта</p>
            <h2 className="mt-1 text-xl font-black">Откройте смену</h2>
            <p className="mt-1 text-sm text-black/55">Чтобы принимать заказы, оператор сначала открывает смену.</p>
          </div>
          <button onClick={openShift} disabled={isLoading} className="pressable inline-flex items-center gap-2 rounded-[8px] bg-pak-green px-4 py-3 font-black text-white shadow-glow disabled:opacity-60">
            <Unlock size={18} />
            Открыть смену
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[8px] border border-pak-green/25 bg-[#eaf7ef] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-pak-greenDark">Смена открыта</p>
          <h2 className="mt-1 text-xl font-black">Рабочая смена</h2>
          <p className="mt-1 text-sm text-black/55">Открыта: {new Date(shift.openedAt).toLocaleString("ru-RU")}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[8px] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase text-black/45">Заказы</p>
            <strong className="text-xl">{summary?.orderCount ?? 0}</strong>
          </div>
          <div className="rounded-[8px] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase text-black/45">Выручка</p>
            <Price value={summary?.revenueTotal ?? 0} className="text-xl font-black" />
          </div>
          <div className="rounded-[8px] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase text-black/45">Возврат</p>
            <Price value={summary?.refundTotal ?? 0} className="text-xl font-black text-red-700" />
          </div>
        </div>
        <button onClick={closeShift} disabled={isLoading} className="pressable inline-flex items-center gap-2 rounded-[8px] bg-pak-ink px-4 py-3 font-black text-white disabled:opacity-60">
          <Lock size={18} />
          Закрыть смену
        </button>
      </div>
    </section>
  );
}
