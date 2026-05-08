import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function ContactsPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-4xl font-black">Контакты</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="tel:+77057210505" className="pressable rounded-[8px] bg-white p-5 shadow-sm">
            <Phone className="text-pak-green" />
            <p className="mt-4 font-bold">Телефон</p>
            <p className="text-black/60">+7 705 721 0505</p>
          </a>
          <a href="https://wa.me/77057210505" className="pressable rounded-[8px] bg-white p-5 shadow-sm">
            <MessageCircle className="text-pak-green" />
            <p className="mt-4 font-bold">WhatsApp</p>
            <p className="text-black/60">Заказы принимаются через WhatsApp</p>
          </a>
          <a href="https://www.instagram.com/paksushi_saryagash" target="_blank" rel="noreferrer" className="pressable rounded-[8px] bg-white p-5 shadow-sm">
            <Instagram className="text-pak-green" />
            <p className="mt-4 font-bold">Instagram</p>
            <p className="text-black/60">@paksushi_saryagash</p>
          </a>
          <div className="rounded-[8px] bg-white p-5 shadow-sm">
            <MapPin className="text-pak-green" />
            <p className="mt-4 font-bold">Город</p>
            <p className="text-black/60">Сарыагаш</p>
          </div>
        </div>
      </main>
    </>
  );
}
