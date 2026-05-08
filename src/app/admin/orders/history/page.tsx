import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

const visibleStatuses: OrderStatus[] = ["CONFIRMED", "CANCELLED"];
const publicLeadPrefix = "Заявка с сайта";

function todayInKazakhstan() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function dateRange(date: string) {
  return {
    start: new Date(`${date}T00:00:00+05:00`),
    end: new Date(`${date}T23:59:59.999+05:00`)
  };
}

function statusLabel(status: string, paymentStatus: string) {
  if (paymentStatus === "REFUNDED") return "Возврат";
  if (status === "CANCELLED") return "Отклонен";
  return "Принят";
}

export default async function OrderHistoryPage({ searchParams }: { searchParams: { date?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const selectedDate = searchParams.date || todayInKazakhstan();
  const { start, end } = dateRange(selectedDate);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      OR: [
        { status: { in: visibleStatuses } },
        { status: "NEW", NOT: { comment: { startsWith: publicLeadPrefix } } }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { items: true, createdBy: { select: { name: true } } }
  });

  const acceptedOrders = orders.filter((order) => order.status === "CONFIRMED" && order.paymentStatus !== "REFUNDED");
  const refundedOrders = orders.filter((order) => order.paymentStatus === "REFUNDED");
  const revenue = acceptedOrders.reduce((total, order) => total + order.totalRevenue, 0);
  const refundRevenue = refundedOrders.reduce((total, order) => total + order.totalRevenue, 0);
  const canCancel = user.role === "OWNER";

  return (
    <div className="grid gap-5">
      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-pak-red">Архив заказов</p>
            <h2 className="mt-1 text-2xl font-black">История за день</h2>
            <p className="mt-1 text-sm text-black/55">Принятые заказы, отклоненные заявки и возвраты по выбранной дате.</p>
          </div>
          {user.role === "OPERATOR" && (
            <Link href="/admin/orders" className="pressable rounded-[8px] bg-pak-green px-4 py-3 font-black text-white shadow-glow">
              Прием заказов
            </Link>
          )}
        </div>

        <form className="mt-5 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-bold">
            Дата
            <input name="date" type="date" defaultValue={selectedDate} className="rounded-[8px] border border-black/15 bg-white px-3 py-3 font-normal" />
          </label>
          <button className="pressable rounded-[8px] bg-pak-ink px-4 py-3 font-black text-white">
            Показать
          </button>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric title="Принятых" value={acceptedOrders.length} tone="dark" />
        <Metric title="Выручка" value={<Price value={revenue} />} tone="green" />
        <Metric title="Возвратов" value={refundedOrders.length} tone="yellow" />
        <Metric title="Сумма возврата" value={<Price value={refundRevenue} />} tone="red" />
      </section>

      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black">Заказы за {selectedDate}</h2>
          <span className="rounded-full bg-pak-cream px-3 py-1 text-xs font-black text-black/60">{orders.length} записей</span>
        </div>

        <div className="mt-4 grid gap-3 lg:hidden">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[8px] border border-black/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="text-lg font-black text-pak-greenDark">#{order.orderNumber}</Link>
                  <p className="mt-1 text-sm text-black/55">{order.customerName || "Без имени"} • {order.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" })}</p>
                </div>
                <Price value={order.totalRevenue} className={order.paymentStatus === "REFUNDED" ? "font-black text-red-700 line-through" : "font-black"} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-pak-cream px-3 py-1 text-xs font-bold">{statusLabel(order.status, order.paymentStatus)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <OrderStatusForm id={order.id} status={order.status} paymentStatus={order.paymentStatus} canCancel={canCancel} />
                <Link href={`/admin/orders/${order.id}/receipt`} className="pressable rounded-[8px] bg-pak-cream px-3 py-2 font-bold">Чек</Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 hidden overflow-auto lg:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-black/45">
              <tr>
                <th className="py-2">№</th>
                <th>Время</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-black/10">
                  <td className="py-3 font-black">
                    <Link href={`/admin/orders/${order.id}`} className="text-pak-greenDark">#{order.orderNumber}</Link>
                  </td>
                  <td>{order.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" })}</td>
                  <td>{order.customerName || "Без имени"}</td>
                  <td>{statusLabel(order.status, order.paymentStatus)}</td>
                  <td className={order.paymentStatus === "REFUNDED" ? "text-red-700 line-through" : ""}><Price value={order.totalRevenue} /></td>
                  <td className="flex items-center gap-2 py-2">
                    <OrderStatusForm id={order.id} status={order.status} paymentStatus={order.paymentStatus} canCancel={canCancel} />
                    <Link href={`/admin/orders/${order.id}/receipt`} className="pressable rounded-[8px] bg-pak-cream px-3 py-2 font-bold">Чек</Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-black/50">Заказов за эту дату нет.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, tone }: { title: string; value: React.ReactNode; tone: "dark" | "green" | "yellow" | "red" }) {
  const tones = {
    dark: "bg-white",
    green: "bg-[#eaf7ef]",
    yellow: "bg-[#fff7c6]",
    red: "bg-[#fff0ec]"
  };

  return (
    <div className={`rounded-[8px] p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-black uppercase text-black/45">{title}</p>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
