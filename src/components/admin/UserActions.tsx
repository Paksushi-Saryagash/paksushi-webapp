"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "OWNER" | "OPERATOR";

export function UserActions({ id, isActive, role }: { id: string; isActive: boolean; role: Role }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  async function patch(data: Record<string, string | boolean>) {
    setIsBusy(true);

    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const result = await response.json();
      window.alert(result.error ?? "Не удалось изменить сотрудника");
      setIsBusy(false);
      return;
    }

    router.refresh();
    setIsBusy(false);
  }

  async function resetPassword() {
    const password = window.prompt("Введите новый пароль минимум 8 символов");
    if (!password) return;

    if (password.length < 8) {
      window.alert("Пароль должен быть минимум 8 символов");
      return;
    }

    await patch({ password });
  }

  async function deleteUser() {
    if (!window.confirm("Удалить сотрудника из активного списка? Если у него есть заказы или смены, аккаунт будет скрыт и отключен, чтобы не сломать отчеты.")) return;

    setIsBusy(true);
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      window.alert(result.error ?? "Не удалось удалить сотрудника");
      setIsBusy(false);
      return;
    }

    router.refresh();
    setIsBusy(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={role}
        disabled={isBusy}
        onChange={(event) => patch({ role: event.target.value })}
        className="rounded-[8px] border border-black/15 bg-white px-2 py-2 text-sm font-bold disabled:opacity-60"
      >
        <option value="OPERATOR">Оператор</option>
        <option value="OWNER">Админ</option>
      </select>
      <button disabled={isBusy} onClick={() => patch({ isActive: !isActive })} className="pressable rounded-[8px] bg-pak-cream px-3 py-2 text-sm font-bold disabled:opacity-60">
        {isActive ? "Отключить" : "Включить"}
      </button>
      <button disabled={isBusy} onClick={resetPassword} className="pressable rounded-[8px] bg-pak-cream px-3 py-2 text-sm font-bold disabled:opacity-60">
        Пароль
      </button>
      <button disabled={isBusy} onClick={deleteUser} className="pressable rounded-[8px] bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-60">
        Удалить
      </button>
    </div>
  );
}
