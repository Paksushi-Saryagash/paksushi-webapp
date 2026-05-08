import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { PendingOrderActions } from "@/components/admin/PendingOrderActions";

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: true,
      createdBy: { select: { name: true, role: true } }
    }
  });

  if (!order) notFound();

  const canSeeProfit = user.role === "OWNER";
  const isPublicLead = order.status === "NEW" && (order.comment?.startsWith("Заявка с сайта") ?? false);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-white p-5 shadow-sm">
        <div>
          <Link href="/admin/orders/history" className="text-sm font-bold text-pak-greenDark">Назад к истории</Link>
          <h2 className="mt-2 text-2xl font-black">Заказ #{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-black/55">
            {order.source} • {order.createdBy?.name ? `создал ${order.createdBy.name}` : "заявка с сайта"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPublicLead ? (
            <PendingOrderActions id={order.id} />
          ) : (
            <OrderStatusForm id={order.id} status={order.status} paymentStatus={order.paymentStatus} canCancel={canSeeProfit} />
          )}
          <Link href={`/admin/orders/${order.id}/receipt`} className="pressable rounded-[8px] bg-pak-green px-4 py-2 font-bold text-white">Чек</Link>
        </div>
      </div>

      <section className={`grid gap-4 ${canSeeProfit ? "md:grid-cols-4" : "md:grid-cols-2"}`}>
        <Metric title={order.paymentStatus === "REFUNDED" ? "Сумма возврата" : "Выручка"} value={<Price value={order.totalRevenue} />} />
        {canSeeProfit && <Metric title="Себестоимость" value={<Price value={order.totalCost} />} />}
        {canSeeProfit && <Metric title="Прибыль" value={<Price value={order.totalProfit} />} />}
        <Metric title="Тип" value={order.type === "CUSTOM_SET" ? "Собранный сет" : "Обычный"} />
      </section>

      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">Клиент</h3>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <p><strong>Имя:</strong> {order.customerName || "Не указано"}</p>
          <p><strong>Телефон:</strong> {order.customerPhone || "Не указано"}</p>
          <p><strong>Адрес:</strong> {order.customerAddress || "Не указано"}</p>
        </div>
        {order.comment && <p className="mt-3 text-sm text-black/65">{order.comment}</p>}
        {order.cancelReason && <p className="mt-3 rounded-[8px] bg-red-50 p-3 text-sm font-bold text-red-700">{order.cancelReason}</p>}
      </section>

      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">Позиции</h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-black/45">
              <tr>
                <th className="py-2">Блюдо</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
                {canSeeProfit && <th>Себестоимость</th>}
                {canSeeProfit && <th>Прибыль</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-black/10">
                  <td className="py-3 font-bold">{item.nameSnapshot}</td>
                  <td>{item.quantity}</td>
                  <td><Price value={item.finalUnitPrice} /></td>
                  <td><Price value={item.lineRevenue} /></td>
                  {canSeeProfit && <td><Price value={item.lineCost} /></td>}
                  {canSeeProfit && <td className="font-bold text-pak-green"><Price value={item.lineProfit} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[8px] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase text-black/45">{title}</p>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}
