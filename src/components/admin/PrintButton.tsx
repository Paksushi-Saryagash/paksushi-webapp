"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 rounded-[8px] bg-pak-red px-4 py-2 font-bold text-white">
      <Printer size={16} />
      Печать
    </button>
  );
}
