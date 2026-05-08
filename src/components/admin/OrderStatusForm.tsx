"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export function OrderStatusForm({ id, status, paymentStatus }: { id: string; status: string; paymentStatus: string; canCancel?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const canRefund = status === "CONFIRMED" && paymentStatus !== "REFUNDED";

  async function refund() {
    const reason = window.prompt("Причина возврата. Это увидит владелец в журнале.");
    if (!reason?.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "REFUNDED", refundReason: reason.trim() })
      });

      if (!response.ok) {
        const result = await response.json();
        window.alert(result.error ?? "Не удалось сделать возврат");
        return;
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (paymentStatus === "REFUNDED") {
    return <span className="rounded-full bg-red-50 px-3 py-2 text-sm font-black text-red-700">Возврат</span>;
  }

  if (!canRefund) {
    return <span className="rounded-full bg-pak-cream px-3 py-2 text-sm font-bold">Принят</span>;
  }

  return (
    <button
      type="button"
      onClick={refund}
      disabled={isLoading}
      className="pressable inline-flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-60"
    >
      <RotateCcw size={15} />
      {isLoading ? "..." : "Возврат"}
    </button>
  );
}
