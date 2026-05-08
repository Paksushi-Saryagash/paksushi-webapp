import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, createdBy: { select: { name: true } } }
  });

  if (!order) notFound();

  const createdAt = order.createdAt.toLocaleString("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <main className="receipt-page min-h-screen bg-[#f4efe4] p-4">
      <div className="no-print mb-4 flex items-center justify-between rounded-[8px] bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase text-pak-red">Чек заказа</p>
          <h1 className="text-xl font-black">#{order.orderNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders/history" className="pressable rounded-[8px] bg-pak-cream px-4 py-2 font-black">Назад</Link>
          <PrintButton />
        </div>
      </div>

      <section className="receipt mx-auto">
        <div className="text-center">
          <h1 className="text-xl font-black tracking-tight">Pak Sushi</h1>
          <p className="text-xs font-bold">Saryagash</p>
          <p className="mt-2 text-xs">Заказ #{order.orderNumber}</p>
          <p className="text-xs">{createdAt}</p>
        </div>

        <div className="my-3 border-t border-dashed border-black" />

        <div className="grid gap-1.5 text-xs">
          <InfoLine label="Клиент" value={order.customerName || "Без имени"} />
          {order.customerPhone && <InfoLine label="Телефон" value={order.customerPhone} />}
          {order.customerAddress && <InfoLine label="Адрес" value={order.customerAddress} />}
          <InfoLine label="Оплата" value={order.paymentStatus === "PAID" ? "Оплачен" : "Не оплачен"} />
          <InfoLine label="Статус" value={order.status} />
          {order.createdBy?.name && <InfoLine label="Оператор" value={order.createdBy.name} />}
        </div>

        <div className="my-3 border-t border-dashed border-black" />

        <div className="grid gap-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between gap-3 font-bold">
                <span>{item.nameSnapshot}</span>
                <Price value={item.lineRevenue} />
              </div>
              <div className="mt-0.5 flex justify-between text-xs text-black/65">
                <span>{item.quantity} x <Price value={item.finalUnitPrice} /></span>
                <span>{item.menuItemId ? "Меню" : "Позиция"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-black" />

        <div className="flex justify-between text-lg font-black">
          <span>Итого</span>
          <Price value={order.totalRevenue} />
        </div>

        {order.comment && <p className="mt-3 text-xs leading-5 text-black/70">Комментарий: {order.comment}</p>}

        <p className="mt-4 text-center text-xs font-bold">Спасибо за заказ!</p>
        <p className="mt-1 text-center text-[10px] text-black/60">+7 705 721 0505 • @paksushi_saryagash</p>
      </section>
    </main>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-black/55">{label}</span>
      <span className="max-w-[170px] text-right font-bold">{value}</span>
    </div>
  );
}
