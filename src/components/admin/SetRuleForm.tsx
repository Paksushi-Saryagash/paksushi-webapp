"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetRuleForm({ threshold, isActive, useSetPriceSum }: { threshold: number; isActive: boolean; useSetPriceSum: boolean }) {
  const router = useRouter();
  const [currentThreshold, setCurrentThreshold] = useState(threshold);
  const [active, setActive] = useState(isActive);
  const [useSum, setUseSum] = useState(useSetPriceSum);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/set-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threshold: currentThreshold, isActive: active, useSetPriceSum: useSum })
    });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] bg-white p-5">
      <h2 className="text-lg font-black">Правило “Собери сет”</h2>
      <label className="grid gap-2 text-sm font-bold">
        Порог по цене для сета
        <input type="number" value={currentThreshold} onChange={(e) => setCurrentThreshold(Number(e.target.value))} className="max-w-xs rounded-[8px] border border-black/15 px-3 py-2 font-normal" />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Правило активно
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={useSum} onChange={(e) => setUseSum(e.target.checked)} />
        После достижения порога считать итог по цене для сета
      </label>
      <button className="w-fit rounded-[8px] bg-pak-red px-4 py-2 font-bold text-white">Сохранить</button>
    </form>
  );
}
