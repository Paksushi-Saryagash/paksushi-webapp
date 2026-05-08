"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function PendingOrderActions({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function update(status: "CONFIRMED" | "CANCELLED") {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "CANCELLED" ? { cancelReason: "Отклонено оператором как мусорная заявка" } : {})
        })
      });

      if (!response.ok) {
        const result = await response.json();
        window.alert(result.error ?? "Не удалось обновить заявку");
        return;
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => update("CONFIRMED")}
        disabled={isLoading}
        className="pressable inline-flex items-center gap-2 rounded-[8px] bg-pak-green px-3 py-2 text-sm font-black text-white disabled:opacity-60"
      >
        <Check size={16} />
        Принять
      </button>
      <button
        type="button"
        onClick={() => update("CANCELLED")}
        disabled={isLoading}
        className="pressable inline-flex items-center gap-2 rounded-[8px] bg-black px-3 py-2 text-sm font-black text-white disabled:opacity-60"
      >
        <X size={16} />
        Мусор
      </button>
    </div>
  );
}
