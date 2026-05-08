import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";
import { CreateOrderForm } from "@/components/admin/CreateOrderForm";
import { PendingOrderActions } from "@/components/admin/PendingOrderActions";
import { ShiftPanel } from "@/components/admin/ShiftPanel";
import { getOpenShift, summarizeShift } from "@/lib/shift";

const publicLeadPrefix = "Заявка с сайта";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role === "OWNER") redirect("/admin");

  const openShift = await getOpenShift(user.id);
  const shiftSummary = openShift ? await summarizeShift(openShift.id) : null;

  const [pendingOrders, menuItems] = await Promise.all([
    prisma.order.findMany({
      where: { status: "NEW", comment: { startsWith: publicLeadPrefix } },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 60
    }),
    prisma.menuItem.findMany({
      where: { isActive: true, isAvailable: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        imageUrl: true,
        category: { select: { id: true, name: true } }
      }
    })
  ]);

  return (
    <div className="grid gap-5">
      <ShiftPanel
        shift={openShift ? { id: openShift.id, openedAt: openShift.openedAt.toISOString(), startingCash: openShift.startingCash } : null}
        summary={shiftSummary}
      />

      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-pak-red">Рабочее место</p>
            <h2 className="mt-1 text-2xl font-black">Прием заказов</h2>
            <p className="mt-1 text-sm text-black/55">Добавляйте заказы вручную и подтверждайте заявки с сайта.</p>
          </div>
          <Link href="/admin/orders/history" className="pressable rounded-[8px] bg-pak-ink px-4 py-3 font-black text-white">
            История
          </Link>
        </div>
      </section>

      {openShift && (
        <section className="rounded-[8px] border border-black/10 bg-white p-5 shadow-sm">
          <CreateOrderForm menuItems={menuItems} />
        </section>
      )}

      <section className="rounded-[8px] border-2 border-pak-yellow bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Заявки с сайта и WhatsApp</h2>
            <p className="mt-1 text-sm text-black/55">Они не попадают в выручку, пока оператор не подтвердит заказ.</p>
          </div>
          <span className="rounded-full bg-pak-yellow px-4 py-2 text-sm font-black">{pendingOrders.length} новых</span>
        </div>
        <div className="mt-4 grid gap-3">
          {pendingOrders.map((order) => (
            <article key={order.id} className="grid gap-3 rounded-[8px] border border-yellow-900/10 bg-pak-cream p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-pak-greenDark">#{order.orderNumber}</Link>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black/55">{order.type === "CUSTOM_SET" ? "Собери сет" : "Меню"}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black/55">{order.paymentStatus === "PAID" ? "Оплачен" : "Не оплачен"}</span>
                </div>
                <p className="mt-2 font-bold">{order.customerName || "Без имени"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-black/60">
                  {order.items.map((item) => `${item.nameSnapshot} x${item.quantity}`).join(", ")}
                </p>
                <Price value={order.totalRevenue} className="mt-2 block text-xl font-black text-pak-greenDark" />
              </div>
              <PendingOrderActions id={order.id} />
            </article>
          ))}
          {pendingOrders.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-black/15 p-6 text-center text-black/50">
              Новых заявок пока нет.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
