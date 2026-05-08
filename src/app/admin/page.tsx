import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Price } from "@/components/shared/Price";
import { getSessionUser } from "@/lib/auth";

const restaurantTimeZone = "Asia/Almaty";

function getDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: restaurantTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function dateRange(date: string) {
  return {
    start: new Date(`${date}T00:00:00+05:00`),
    end: new Date(`${date}T23:59:59.999+05:00`)
  };
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/orders");

  const todayKey = getDayKey(new Date());
  const { start, end } = dateRange(todayKey);

  const [todayOrders, pendingCount, openShifts, recentRefunds] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: "CONFIRMED",
        paymentStatus: { not: "REFUNDED" }
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } },
      take: 8
    }),
    prisma.order.count({ where: { status: "NEW", comment: { startsWith: "Заявка с сайта" } } }),
    prisma.shift.findMany({
      where: { isOpen: true },
      include: { operator: { select: { name: true } } },
      orderBy: { openedAt: "desc" }
    }),
    prisma.order.findMany({
      where: { paymentStatus: "REFUNDED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { createdBy: { select: { name: true } } }
    })
  ]);

  const todayRevenue = todayOrders.reduce((total, order) => total + order.totalRevenue, 0);

  return (
    <div className="grid gap-5">
      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase text-pak-red">Главное за сегодня</p>
        <h2 className="mt-1 text-2xl font-black">Простая касса Pak Sushi</h2>
        <p className="mt-1 text-sm text-black/55">
          Здесь только нужное владельцу: выручка, принятые заказы, открытые смены и возвраты.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric title="Выручка сегодня" value={<Price value={todayRevenue} />} tone="green" />
        <Metric title="Принятых заказов" value={todayOrders.length} tone="dark" />
        <Metric title="Новых заявок" value={pendingCount} tone="yellow" />
        <Metric title="Открытых смен" value={openShifts.length} tone="red" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[8px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Сегодняшние заказы</h3>
            <Link href={`/admin/orders/history?date=${todayKey}`} className="pressable rounded-[8px] bg-pak-cream px-3 py-2 text-sm font-black">
              История
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {todayOrders.map((order) => (
              <article key={order.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-black/10 p-3">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-pak-greenDark">#{order.orderNumber}</Link>
                  <p className="mt-1 text-sm text-black/55">{order.customerName || "Без имени"} • {order.createdBy?.name ?? "оператор"}</p>
                </div>
                <Price value={order.totalRevenue} className="font-black" />
              </article>
            ))}
            {todayOrders.length === 0 && <p className="rounded-[8px] border border-dashed border-black/15 p-5 text-center text-sm text-black/50">Сегодня принятых заказов пока нет.</p>}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[8px] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black">Открытые смены</h3>
            <div className="mt-4 grid gap-3">
              {openShifts.map((shift) => (
                <article key={shift.id} className="rounded-[8px] border border-black/10 p-3 text-sm">
                  <p className="font-black">{shift.operator.name}</p>
                  <p className="mt-1 text-black/55">Открыта: {shift.openedAt.toLocaleString("ru-RU")}</p>
                </article>
              ))}
              {openShifts.length === 0 && <p className="text-sm text-black/50">Сейчас открытых смен нет.</p>}
            </div>
          </div>

          <div className="rounded-[8px] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black">Последние возвраты</h3>
            <div className="mt-4 grid gap-3">
              {recentRefunds.map((order) => (
                <article key={order.id} className="rounded-[8px] border border-red-100 bg-red-50 p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-black text-red-700">#{order.orderNumber}</Link>
                    <Price value={order.totalRevenue} className="font-black text-red-700" />
                  </div>
                  <p className="mt-1 text-black/60">{order.cancelReason || "Причина не указана"}</p>
                </article>
              ))}
              {recentRefunds.length === 0 && <p className="text-sm text-black/50">Возвратов пока нет.</p>}
            </div>
          </div>
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
