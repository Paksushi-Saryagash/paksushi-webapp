"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateUserForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          login: formData.get("login"),
          password: formData.get("password"),
          role: formData.get("role")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Не удалось добавить сотрудника");
        return;
      }

      form.reset();
      setSuccess("Сотрудник добавлен");
      router.refresh();
    } catch {
      setError("Не удалось подключиться к серверу");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[8px] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Добавить сотрудника</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <input name="name" placeholder="Имя" required className="rounded-[8px] border border-black/15 px-3 py-2" />
        <input name="login" placeholder="Логин" required minLength={3} className="rounded-[8px] border border-black/15 px-3 py-2" />
        <input name="password" type="password" placeholder="Пароль" required minLength={8} className="rounded-[8px] border border-black/15 px-3 py-2" />
        <select name="role" className="rounded-[8px] border border-black/15 px-3 py-2">
          <option value="OPERATOR">Оператор</option>
          <option value="OWNER">Админ-владелец</option>
        </select>
      </div>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      {success && <p className="rounded-[8px] bg-green-50 p-3 text-sm font-semibold text-pak-greenDark">{success}</p>}
      <button disabled={isLoading} className="pressable w-fit rounded-[8px] bg-pak-red px-4 py-2 font-bold text-white disabled:opacity-60">
        {isLoading ? "Добавляем..." : "Добавить"}
      </button>
    </form>
  );
}
