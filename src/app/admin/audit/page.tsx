import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const actionLabels: Record<string, string> = {
  LOGIN: "Вход в систему",
  LOGOUT: "Выход из системы",
  OPEN_SHIFT: "Открыл смену",
  CLOSE_SHIFT: "Закрыл смену",
  CREATE_USER: "Создал сотрудника",
  UPDATE_USER: "Изменил сотрудника",
  DELETE_USER: "Удалил сотрудника",
  DEACTIVATE_USER: "Отключил сотрудника",
  CREATE_CATEGORY: "Создал категорию",
  UPDATE_CATEGORY: "Изменил категорию",
  DELETE_CATEGORY: "Удалил категорию",
  CREATE_MENU_ITEM: "Создал блюдо",
  UPDATE_MENU_ITEM: "Изменил блюдо",
  DELETE_MENU_ITEM: "Удалил блюдо",
  CREATE_ORDER: "Принял заказ",
  UPDATE_ORDER: "Изменил заказ",
  CANCEL_ORDER: "Отклонил заявку",
  REFUND_ORDER: "Сделал возврат",
  MARK_PAID: "Отметил оплату",
  UPDATE_SET_RULE: "Изменил правило сета"
};

const entityLabels: Record<string, string> = {
  user: "сотрудник",
  order: "заказ",
  shift: "смена",
  menuItem: "блюдо",
  category: "категория",
  setRule: "правило сета"
};

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true, login: true, role: true } } },
    take: 200
  });

  return (
    <section className="rounded-[8px] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase text-pak-red">Контроль действий</p>
      <h2 className="mt-1 text-2xl font-black">Журнал действий</h2>
      <div className="mt-4 grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-[8px] border border-black/10 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{actionLabels[log.action] ?? log.action}</strong>
              <span className="text-black/45">{log.createdAt.toLocaleString("ru-RU")}</span>
            </div>
            <p className="mt-1 text-black/60">
              {log.actor ? `${log.actor.name} (${log.actor.role === "OWNER" ? "владелец" : "оператор"})` : "Система"} • {entityLabels[log.entityType] ?? log.entityType}
            </p>
            {log.details ? <p className="mt-2 rounded-[8px] bg-pak-cream p-2 text-xs text-black/65">{JSON.stringify(log.details)}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
