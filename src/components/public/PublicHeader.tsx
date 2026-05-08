import Link from "next/link";
import { LockKeyhole, ShoppingCart } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-yellow-900/10 bg-pak-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
        <Link href="/" className="pressable flex min-w-0 items-center gap-2 font-black uppercase tracking-wide text-pak-greenDark sm:gap-3">
          <img src="/logo.svg" alt="Pak Sushi" className="h-11 w-11 shrink-0 rounded-full shadow-sm sm:h-12 sm:w-12" />
          <span className="leading-none">
            <span className="block text-base text-pak-green sm:text-lg">Pak Sushi</span>
            <span className="block text-[11px] text-pak-red sm:text-xs">Saryagash</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-xs font-black sm:gap-2 sm:text-sm">
          <Link href="/" className="pressable hidden rounded-full px-3 py-2 hover:bg-white sm:block">
            Меню
          </Link>
          <Link href="/set-builder" className="pressable rounded-full px-2.5 py-2 hover:bg-white sm:px-4">
            Собери сет
          </Link>
          <Link href="/contacts" className="pressable hidden rounded-full px-3 py-2 hover:bg-white min-[430px]:block sm:px-4">
            Контакты
          </Link>
          <Link href="/admin" className="pressable grid h-10 w-10 place-items-center rounded-full bg-white text-pak-greenDark shadow-sm sm:h-11 sm:w-11" title="Админ-панель">
            <LockKeyhole size={17} />
          </Link>
          <Link href="/cart" className="pressable grid h-10 w-10 place-items-center rounded-full bg-pak-green text-white shadow-glow sm:h-11 sm:w-11" title="Корзина">
            <ShoppingCart size={18} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
