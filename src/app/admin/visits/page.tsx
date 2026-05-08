import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";

export default async function VisitsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin");

  const [logins, shifts] = await Promise.all([
    prisma.auditLog.findMany({
      where: { action: "LOGIN" },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, login: true, role: true } } },
      take: 100
    }),
    prisma.shift.findMany({
      orderBy: { openedAt: "desc" },
      include: { operator: { select: { name: true, login: true, role: true } } },
      take: 100
    })
  ]);

  return (
    <div className="grid gap-5">
      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase text-pak-red">Контроль</p>
        <h2 className="mt-1 text-2xl font-black">Смены и входы</h2>
        <p className="mt-1 text-sm text-black/55">Кто заходил в систему, когда открыл смену и когда закрыл.</p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[8px] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">Смены операторов</h3>
          <div className="mt-4 grid gap-3">
            {shifts.map((shift) => (
              <article key={shift.id} className="rounded-[8px] border border-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{shift.operator.name}</p>
                    <p className="mt-1 text-sm text-black/55">
                      Открыта: {shift.openedAt.toLocaleString("ru-RU")}
                      {shift.closedAt ? ` • Закрыта: ${shift.closedAt.toLocaleString("ru-RU")}` : " • Сейчас открыта"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${shift.isOpen ? "bg-[#eaf7ef] text-pak-greenDark" : "bg-pak-cream text-black/60"}`}>
                    {shift.isOpen ? "Открыта" : "Закрыта"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-[8px] bg-pak-cream p-3">
                    <p className="text-xs font-bold uppercase text-black/45">Заказы</p>
                    <strong>{shift.orderCount}</strong>
                  </div>
                  <div className="rounded-[8px] bg-pak-cream p-3">
                    <p className="text-xs font-bold uppercase text-black/45">Выручка</p>
                    <Price value={shift.revenueTotal} className="font-black" />
                  </div>
                  <div className="rounded-[8px] bg-pak-cream p-3">
                    <p className="text-xs font-bold uppercase text-black/45">Возврат</p>
                    <Price value={shift.refundTotal} className="font-black text-red-700" />
                  </div>
                </div>
                {(shift.openingNote || shift.closingNote) && (
                  <p className="mt-3 text-sm text-black/65">
                    {shift.openingNote && `Открытие: ${shift.openingNote}`}
                    {shift.openingNote && shift.closingNote ? " • " : ""}
                    {shift.closingNote && `Закрытие: ${shift.closingNote}`}
                  </p>
                )}
              </article>
            ))}
            {shifts.length === 0 && <p className="text-sm text-black/50">Смен пока нет.</p>}
          </div>
        </div>

        <div className="rounded-[8px] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">Входы в систему</h3>
          <div className="mt-4 grid gap-3">
            {logins.map((log) => (
              <article key={log.id} className="rounded-[8px] border border-black/10 p-3 text-sm">
                <p className="font-black">{log.actor?.name ?? "Система"}</p>
                <p className="mt-1 text-black/55">{log.actor?.role === "OWNER" ? "Владелец" : "Оператор"} • {log.createdAt.toLocaleString("ru-RU")}</p>
              </article>
            ))}
            {logins.length === 0 && <p className="text-sm text-black/50">Входов пока нет.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
