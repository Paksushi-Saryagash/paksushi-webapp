"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: formData.get("login"),
          password: formData.get("password")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Не удалось войти");
        setIsLoading(false);
        return;
      }

      router.push(data.user?.role === "OWNER" ? "/admin" : "/admin/orders");
      router.refresh();
    } catch {
      setError("Не удалось подключиться к серверу");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[8px] bg-white p-6 shadow-soft">
      <label className="grid gap-2 text-sm font-bold">
        Логин
        <input name="login" className="rounded-[8px] border border-black/15 px-3 py-3 font-normal outline-none transition focus:border-pak-green focus:ring-4 focus:ring-pak-green/10" disabled={isLoading} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Пароль
        <input name="password" type="password" className="rounded-[8px] border border-black/15 px-3 py-3 font-normal outline-none transition focus:border-pak-green focus:ring-4 focus:ring-pak-green/10" disabled={isLoading} />
      </label>
      {error && <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-pak-red">{error}</p>}
      <button disabled={isLoading} className="pressable rounded-[8px] bg-pak-red px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-70">
        {isLoading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
