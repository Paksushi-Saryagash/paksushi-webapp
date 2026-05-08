import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <main className="relative grid min-h-screen place-items-center bg-pak-cream px-4">
      <Link href="/" className="pressable absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-black text-pak-greenDark shadow-sm hover:bg-pak-yellow sm:right-6 sm:top-6">
        На сайт
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.svg" alt="Pak Sushi" className="h-16 w-16 rounded-full shadow-sm" />
          <div>
            <p className="text-sm font-bold uppercase text-pak-red">Pak Sushi</p>
            <h1 className="text-3xl font-black leading-tight">Вход в админку</h1>
          </div>
        </div>
        <p className="mb-6 text-black/60">Доступ только для владельца и операторов.</p>
        <LoginForm />
      </div>
    </main>
  );
}
